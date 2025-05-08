
import { useCallback } from 'react';

export const useAlgorithmTimer = () => {
  const getRunTime = useCallback((algorithmType: string, algorithmSubtype: string): number => {
    // Set different run times based on algorithm type and subtype
    let runTime = 1500; // default 1.5 seconds
    
    if (algorithmType === 'linkPrediction') {
      runTime = 2000; // 2 seconds for link prediction
    } else if (algorithmType === 'communityDetection') {
      // Vary time based on community detection algorithm
      if (algorithmSubtype === 'gcn') runTime = 2500;
      else if (algorithmSubtype === 'secomm') runTime = 3500;
      else if (algorithmSubtype === 'gat') runTime = 3000;
    } else if (algorithmType === 'roleClassification') {
      // Vary time based on role classification algorithm
      if (algorithmSubtype === 'graphAttention') runTime = 4000;
      else if (algorithmSubtype === 'appnp') runTime = 4500;
    }
    
    return runTime;
  }, []);

  return { getRunTime };
};
