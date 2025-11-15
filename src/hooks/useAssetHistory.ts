import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AssetHistoryEntry } from '@/types/asset';
import { toast } from 'sonner';

export const useAssetHistory = (assetId: string | undefined) => {
  const [history, setHistory] = useState<AssetHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!assetId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('asset_history')
        .select(`
          *,
          user_profile:profiles(full_name, email)
        `)
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      type SupabaseHistoryEntry = Omit<AssetHistoryEntry, 'user_profile'> & {
        user_profile: { full_name: string; email: string } | null;
      };

      const transformedData = (data ?? []).map((entry) => {
        const typedEntry = entry as SupabaseHistoryEntry;
        return {
          ...typedEntry,
          user_profile: typedEntry.user_profile ?? undefined,
        } satisfies AssetHistoryEntry;
      });

      setHistory(transformedData);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico de alterações');
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    void fetchHistory();
  }, [assetId, fetchHistory]);

  return { history, loading, refetch: fetchHistory };
};