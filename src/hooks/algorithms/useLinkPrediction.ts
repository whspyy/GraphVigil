
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
    
    // Check distribution of links across nodes
    const nodeInNewLinks = new Map<string, number>();
    
    // Count how many new links each node is involved in
    markedLinks.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      nodeInNewLinks.set(sourceId, (nodeInNewLinks.get(sourceId) || 0) + 1);
      nodeInNewLinks.set(targetId, (nodeInNewLinks.get(targetId) || 0) + 1);
    });
    
    // Calculate distribution statistics for logging
    const linkCounts = Array.from(nodeInNewLinks.values());
    const maxLinksPerNode = Math.max(...linkCounts, 0);
    const avgLinksPerNode = linkCounts.length > 0 
      ? linkCounts.reduce((sum, count) => sum + count, 0) / linkCounts.length
      : 0;
    
    console.log(`Generated ${markedLinks.length} predicted links for ${selectedDataset}`);
    console.log(`Link distribution: avg=${avgLinksPerNode.toFixed(2)}, max=${maxLinksPerNode}`);
    
    setPredictedLinks(markedLinks);
  }, [setPredictedLinks, selectedDataset]);

  return { handleLinkPrediction };
};
