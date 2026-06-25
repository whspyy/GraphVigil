
import { useCallback } from 'react';
import { runLinkPrediction } from '../../utils/networkAlgorithms';

export const useLinkPrediction = (
  setPredictedLinks: (links: any[]) => void,
  selectedDataset: string
) => {
  const handleLinkPrediction = useCallback((algorithmSubtype: string, graphData: any) => {
    // Run link prediction algorithm
    const newLinks = runLinkPrediction(algorithmSubtype, graphData, selectedDataset);

    // Add isPredicted flag to all predicted links
    const markedLinks = newLinks.map(link => ({
      ...link,
      isPredicted: true
    }));

    setPredictedLinks(markedLinks);
  }, [setPredictedLinks, selectedDataset]);

  return { handleLinkPrediction };
};
