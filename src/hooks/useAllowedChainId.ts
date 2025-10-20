import { useMemo } from 'react';

export function useAllowedChainId(chainId: string | number | undefined, fallback = 56) {
  return useMemo(() => {
    if (typeof chainId === 'number') return chainId;
    if (typeof chainId === 'string') {
      if (chainId.startsWith('0x')) return parseInt(chainId, 16);
      const n = Number(chainId);
      return Number.isFinite(n) ? n : fallback;
    }
    return fallback;
  }, [chainId, fallback]);
}
