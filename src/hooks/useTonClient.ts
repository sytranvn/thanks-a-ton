import { getHttpEndpoint, type Network } from '@orbs-network/ton-access';
import { TonClient } from "@ton/ton";
import { useAsyncInitialize } from './useAsyncInitialize';
import { useCallback } from 'react';

export function useTonClient(network: Network) {
  const getEndpoint = useCallback(async function() {
    if (!network) return;
    return await getHttpEndpoint({ network })
  }, [network]);
  const endpoint = useAsyncInitialize(getEndpoint, [network]);
  return useAsyncInitialize(
    async () => {
      if (!endpoint) return;
      return new TonClient({
        endpoint,
      });
    }
    , [network, endpoint]);
}
