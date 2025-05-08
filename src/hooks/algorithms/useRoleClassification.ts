import { useCallback } from 'react';
import { runRoleClassification } from '../../utils/networkAlgorithms';

export const useRoleClassification = (
  setRoles: (roles: {[key: string]: number}) => void
) => {
  const handleRoleClassification = useCallback((
    algorithmSubtype: string, 
    graphData: any, 
    processedGraphData: any,
    communityLayout: boolean
  ) => {
    // Use the appropriate data source
    const dataToUse = communityLayout && processedGraphData ? processedGraphData : graphData;
    
    console.log(`Running role classification with algorithm: ${algorithmSubtype}`);
    
    // Use the runRoleClassification function to classify nodes
    const nodeRoles = runRoleClassification(algorithmSubtype, dataToUse);
    
    console.log('Role classification results:', nodeRoles);
    setRoles(nodeRoles);
  }, [setRoles]);

  return { handleRoleClassification };
};
