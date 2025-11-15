import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RATE_LIMIT_MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Obter username e senha do corpo da requisição
    const { username, password } = await req.json()

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Usuário e senha são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check rate limiting
    const { data: attemptData } = await supabaseClient
      .from('failed_login_attempts')
      .select('attempt_count, last_attempt, locked_until')
      .eq('username', username)
      .single()

    if (attemptData) {
      const now = Date.now()
      const lastAttemptTime = new Date(attemptData.last_attempt).getTime()
      const timeSinceLastAttempt = now - lastAttemptTime

      // Check if account is locked
      if (attemptData.locked_until) {
        const lockExpiry = new Date(attemptData.locked_until).getTime()
        if (now < lockExpiry) {
          const remainingMinutes = Math.ceil((lockExpiry - now) / 60000)
          console.log('Login rate limit exceeded', { username, remainingMinutes })
          return new Response(
            JSON.stringify({ 
              error: `Muitas tentativas de login. Tente novamente em ${remainingMinutes} minutos.` 
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      // Check if within rate limit window
      if (attemptData.attempt_count >= RATE_LIMIT_MAX_ATTEMPTS && timeSinceLastAttempt < RATE_LIMIT_WINDOW_MS) {
        const lockUntil = new Date(now + RATE_LIMIT_WINDOW_MS)
        await supabaseClient
          .from('failed_login_attempts')
          .update({ locked_until: lockUntil.toISOString() })
          .eq('username', username)

        console.log('Login rate limit exceeded', { username })
        return new Response(
          JSON.stringify({ error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Buscar email pelo username usando a função RPC
    const { data: email, error: emailError } = await supabaseClient
      .rpc('get_email_by_username', { user_username: username })

    if (emailError || !email) {
      console.error('Failed to lookup username')
      return new Response(
        JSON.stringify({ error: 'Usuário ou senha incorretos' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fazer login com o email encontrado
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (authError) {
      console.error('Authentication failed')
      
      // Record failed attempt
      if (attemptData) {
        const now = Date.now()
        const lastAttemptTime = new Date(attemptData.last_attempt).getTime()
        const timeSinceLastAttempt = now - lastAttemptTime
        
        // Reset counter if outside the window
        const newCount = timeSinceLastAttempt > RATE_LIMIT_WINDOW_MS ? 1 : attemptData.attempt_count + 1
        
        await supabaseClient
          .from('failed_login_attempts')
          .update({ 
            attempt_count: newCount,
            last_attempt: new Date().toISOString(),
            locked_until: null
          })
          .eq('username', username)
      } else {
        // First failed attempt
        await supabaseClient
          .from('failed_login_attempts')
          .insert({
            username,
            attempt_count: 1,
            last_attempt: new Date().toISOString()
          })
      }
      
      return new Response(
        JSON.stringify({ error: 'Usuário ou senha incorretos' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Successful login - clear failed attempts
    if (attemptData) {
      await supabaseClient
        .from('failed_login_attempts')
        .delete()
        .eq('username', username)
    }

    // Retornar sessão e dados do usuário
    return new Response(
      JSON.stringify({
        success: true,
        session: authData.session,
        user: authData.user
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Login error occurred')
    return new Response(
      JSON.stringify({ error: 'Erro ao processar login' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
