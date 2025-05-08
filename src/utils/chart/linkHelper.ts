import { ChartLinkData } from './types';

// Process and format link data for visualization
export const processLink = (
  link: any,
  highlightEdges: Set<string>,
  predictedLinks: any[],
  algorithmType: string | null = null
): ChartLinkData => {
  // Handle both string and object representations of source and target
  const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
  const targetId = typeof link.target === 'object' ? link.target.id : link.target;
  const linkId = `${sourceId}-${targetId}`;
  
  // Check if this is a predicted link - but only relevant for link prediction algorithm
  const isPredicted = link.isPredicted || predictedLinks.some(
    (pl) => (pl.source === sourceId && pl.target === targetId) || 
            (pl.source === targetId && pl.target === sourceId)
  );
  
  // Determine the color based on whether it's a predicted link AND algorithm type
  // For community detection and role classification, make all links use the default color
  const linkColor = (algorithmType === 'communityDetection' || algorithmType === 'roleClassification') ? '#aaa' : 
                    (isPredicted ? '#ff9800' : '#aaa');
  
  // For community detection and role classification, always force solid lines regardless of isPredicted flag
  const linkType = (algorithmType === 'communityDetection' || algorithmType === 'roleClassification') ? 'solid' : 
                   (isPredicted ? 'dashed' : 'solid');
  
  return {
    source: sourceId,
    target: targetId,
    lineStyle: {
      width: highlightEdges.has(linkId) ? 5 : 2,
      color: linkColor,
      type: linkType,
      curveness: 0.2
    }
  };
};
