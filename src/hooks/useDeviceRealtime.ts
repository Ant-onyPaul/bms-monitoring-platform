import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DeviceCurrentData } from '../types/database.types';

export function useDeviceRealtime(deviceId: string, initialData?: DeviceCurrentData) {
  const [data, setData] = useState<DeviceCurrentData | null>(initialData || null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!deviceId) return;

    // Set initial data if available or fetch it
    if (!initialData && import.meta.env.VITE_MOCK_AUTH !== 'true') {
      const fetchInitialData = async () => {
        const { data: currentData, error: fetchError } = await supabase
          .from('device_current_data')
          .select('*')
          .eq('device_id', deviceId)
          .single();
          
        if (fetchError) setError(new Error(fetchError.message));
        if (currentData) setData(currentData as DeviceCurrentData);
      };
      fetchInitialData();
    }

    if (import.meta.env.VITE_MOCK_AUTH === 'true') {
      // Setup mock interval for demo
      const interval = setInterval(() => {
        setData(prev => prev ? {
          ...prev,
          temperature: (prev.temperature || 24) + (Math.random() > 0.5 ? 0.1 : -0.1),
          voltage: (prev.voltage || 230) + (Math.random() > 0.5 ? 0.5 : -0.5),
        } : null);
      }, 3000);
      return () => clearInterval(interval);
    }

    // Subscribe to realtime updates
    const channel = supabase.channel(`public:device_current_data:device_id=eq.${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // We mostly expect UPSERTs, which trigger UPDATE or INSERT
          schema: 'public',
          table: 'device_current_data',
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          setData(payload.new as DeviceCurrentData);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'device_current_data',
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          setData(payload.new as DeviceCurrentData);
        }
      )
      .subscribe((status, err) => {
        if (err) setError(err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deviceId, initialData]);

  return { data, error };
}
