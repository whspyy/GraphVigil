
import { useEffect } from 'react';

export const useCommunityLayoutReset = (
  algorithmType: string | null, 
  setCommunityLayout: (layout: boolean) => void
) => {
  // Reset community layout if changing algorithm type
  useEffect(() => {
    if (algorithmType !== 'communityDetection' && algorithmType !== 'roleClassification') {
      setCommunityLayout(false);
    }
  }, [algorithmType, setCommunityLayout]);
};
