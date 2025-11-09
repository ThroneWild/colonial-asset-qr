import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AssetHistoryEntry } from '@/types/asset';
import { toast } from 'sonner';

export const useAssetHistory = (assetId: string | undefined) => {
  const [history, setHistory] = useState<AssetHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assetId) {
      setLoading(false);
      return;
    }

    fetchHistory();
  }, [assetId]);

  const fetchHistory = async () => {
    if (!assetId) return;

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

      // Transform the data to match our interface
      const transformedData = data?.map((entry: any) => ({
        ...entry,
        user_profile: entry.user_profile ? {
          full_name: entry.user_profile.full_name,
          email: entry.user_profile.email
        } : undefined
      })) || [];

      setHistory(transformedData);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico de alterações');
    } finally {
      setLoading(false);
    }
  };

  return { history, loading, refetch: fetchHistory };
};