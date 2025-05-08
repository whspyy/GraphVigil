
import { useEffect } from 'react';
import { useLinkPrediction } from './algorithms/useLinkPrediction';
import { useCommunityDetection } from './algorithms/useCommunityDetection';
import { useRoleClassification } from './algorithms/useRoleClassification';
import { useAlgorithmTimer } from './algorithms/useAlgorithmTimer';
import { useCommunityLayoutReset } from './algorithms/useCommunityLayoutReset';

export const useAlgorithmEffect = (
  algorithmRunning: boolean,
  algorithmType: string | null,
  algorithmSubtype: string | null,
  graphData: any,
  processedGraphData: any,
  communityLayout: boolean,
  setPredictedLinks: (links: any[]) => void,
  setCommunities: (communities: {[key: string]: number}) => void,
  setRoles: (roles: {[key: string]: number}) => void,
  setProcessedGraphData: (data: any) => void,
  setCommunityLayout: (layout: boolean) => void,
  onAlgorithmComplete: () => void,
  selectedDataset: string
) => {
  const { handleLinkPrediction } = useLinkPrediction(setPredictedLinks, selectedDataset);
  const { handleCommunityDetection } = useCommunityDetection(
    setCommunities, 
    setProcessedGraphData, 
    setCommunityLayout
  );
  const { handleRoleClassification } = useRoleClassification(setRoles);
  const { getRunTime } = useAlgorithmTimer();

  useEffect(() => {
    if (!algorithmRunning || !algorithmType || !algorithmSubtype) return;
    
    const runTime = getRunTime(algorithmType, algorithmSubtype);
    
    const timer = setTimeout(() => {
      if (algorithmType === 'linkPrediction') {
        handleLinkPrediction(algorithmSubtype, graphData);
      } else if (algorithmType === 'communityDetection') {
        handleCommunityDetection(algorithmSubtype, graphData);
      } else if (algorithmType === 'roleClassification') {
        handleRoleClassification(algorithmSubtype, graphData, processedGraphData, communityLayout);
      }
      
      onAlgorithmComplete();
    }, runTime);
    
    return () => clearTimeout(timer);
  }, [
    algorithmRunning, 
    algorithmType, 
    algorithmSubtype, 
    graphData, 
    processedGraphData, 
    onAlgorithmComplete, 
    communityLayout, 
    handleLinkPrediction,
    handleCommunityDetection,
    handleRoleClassification,
    getRunTime
  ]);
};

export { useCommunityLayoutReset };
