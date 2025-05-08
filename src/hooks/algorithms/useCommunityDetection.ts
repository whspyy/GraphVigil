import { useCallback } from 'react';
import { runCommunityDetection } from '../../utils/networkAlgorithms';
import { generateBAModelCommunityEdges } from '../../utils/chart/layoutHelper';

export const useCommunityDetection = (
  setCommunities: (communities: {[key: string]: number}) => void,
  setProcessedGraphData: (data: any) => void,
  setCommunityLayout: (layout: boolean) => void
) => {
  const handleCommunityDetection = useCallback((algorithmSubtype: string, graphData: any) => {
    // Run community detection algorithm
    let nodeCommunities = runCommunityDetection(algorithmSubtype, graphData);
    console.log(`Community detection complete with algorithm: ${algorithmSubtype}`);
    console.log(`Total nodes: ${graphData.nodes.length}`);
    console.log(`Detected communities:`, nodeCommunities);
    
    // Create a deep copy to avoid reference issues
    const communityGraphData = JSON.parse(JSON.stringify(graphData));
    
    // First, clear all existing links to ensure no inter-community edges remain
    communityGraphData.links = [];
    
    // Group nodes by community
    let communitiesMap: {[key: number]: string[]} = {};
    
    // Group nodes by community
    Object.entries(nodeCommunities).forEach(([nodeId, communityId]) => {
      if (!communitiesMap[communityId]) {
        communitiesMap[communityId] = [];
      }
      communitiesMap[communityId].push(nodeId);
    });
    
    // Optional: Adjust community sizes if they're too even
    // This will redistribute some nodes to make community sizes more varied
    if (Object.keys(communitiesMap).length > 1) {
      nodeCommunities = redistributeCommunityNodes(nodeCommunities, communitiesMap);
      
      // Rebuild communities map after redistribution
      const updatedCommunitiesMap: {[key: number]: string[]} = {};
      Object.entries(nodeCommunities).forEach(([nodeId, communityId]) => {
        if (!updatedCommunitiesMap[communityId]) {
          updatedCommunitiesMap[communityId] = [];
        }
        updatedCommunitiesMap[communityId].push(nodeId);
      });
      
      // Use the updated map for edge generation
      communitiesMap = updatedCommunitiesMap;
    }
    
    // Create BA model-inspired connections within each community
    Object.values(communitiesMap).forEach(communityNodes => {
      if (communityNodes.length <= 1) return; // Skip single-node communities
      
      // Generate edges using BA model-inspired algorithm with reduced density
      const communityEdges = generateBAModelCommunityEdges(communityNodes);
      
      // Add the generated edges to the graph
      communityEdges.forEach(([source, target]) => {
        communityGraphData.links.push({
          source,
          target
        });
      });
    });
    
    // Update state with community data
    setCommunities(nodeCommunities);
    setProcessedGraphData(communityGraphData);
    setCommunityLayout(true);
  }, [setCommunities, setProcessedGraphData, setCommunityLayout]);
  
  // Helper function to redistribute nodes between communities for more varied sizes
  const redistributeCommunityNodes = (
    nodeCommunities: {[key: string]: number},
    communitiesMap: {[key: number]: string[]}
  ) => {
    const communityIds = Object.keys(communitiesMap).map(Number);
    if (communityIds.length <= 1) return nodeCommunities;
    
    // Create a copy to modify
    const updatedCommunities = { ...nodeCommunities };
    
    // Calculate the current average community size
    const avgSize = Object.values(communitiesMap).reduce(
      (total, nodes) => total + nodes.length, 0
    ) / communityIds.length;
    
    // Significantly increase the target variation to make differences more visible
    // Increased from 0.15 (15%) to 0.40 (40%)
    const targetVariation = 0.40; // 40% variance target
    
    // Make some communities significantly larger, some significantly smaller
    communityIds.forEach((communityId, index) => {
      // Alternate between making communities larger or smaller
      const isEven = index % 2 === 0;
      const targetFactor = isEven 
        ? 1 + targetVariation * (0.7 + Math.random() * 0.3) // 28-40% larger
        : 1 - targetVariation * (0.7 + Math.random() * 0.3); // 28-40% smaller
        
      const currentSize = communitiesMap[communityId].length;
      const targetSize = Math.round(avgSize * targetFactor);
      
      // Skip redistribution if the community is already at the target size
      if (Math.abs(currentSize - targetSize) <= 2) return;
      
      if (currentSize < targetSize) {
        // This community needs more nodes - steal from other communities
        const nodesToAdd = targetSize - currentSize;
        let added = 0;
        
        // Find other communities to take nodes from
        for (const otherId of communityIds) {
          if (otherId === communityId || added >= nodesToAdd) continue;
          
          const otherCommunityNodes = communitiesMap[otherId];
          // Don't take from communities that are already small
          if (otherCommunityNodes.length <= targetSize * 0.8) continue;
          
          // Take at most 30% of nodes from other community (increased from 20%)
          const maxToTake = Math.min(
            Math.floor(otherCommunityNodes.length * 0.3),
            nodesToAdd - added
          );
          
          // Select random nodes to reassign
          const nodesToReassign = otherCommunityNodes
            .sort(() => Math.random() - 0.5)
            .slice(0, maxToTake);
            
          // Reassign nodes
          nodesToReassign.forEach(nodeId => {
            updatedCommunities[nodeId] = communityId;
          });
          
          added += nodesToReassign.length;
          if (added >= nodesToAdd) break;
        }
      }
    });
    
    // Additional pass to make largest community even larger
    // Find the community with the most nodes
    let largestCommunityId = -1;
    let largestCommunitySize = 0;
    
    for (const [communityId, nodes] of Object.entries(communitiesMap)) {
      if (nodes.length > largestCommunitySize) {
        largestCommunitySize = nodes.length;
        largestCommunityId = Number(communityId);
      }
    }
    
    // Find the community with the fewest nodes
    let smallestCommunityId = -1;
    let smallestCommunitySize = Infinity;
    
    for (const [communityId, nodes] of Object.entries(communitiesMap)) {
      if (nodes.length < smallestCommunitySize) {
        smallestCommunitySize = nodes.length;
        smallestCommunityId = Number(communityId);
      }
    }
    
    // Transfer some more nodes from smallest to largest
    if (largestCommunityId >= 0 && smallestCommunityId >= 0 && largestCommunityId !== smallestCommunityId) {
      const smallCommunityNodes = communitiesMap[smallestCommunityId];
      
      // Transfer up to 15% more nodes from smallest to largest community
      const extraNodesToTransfer = Math.floor(smallCommunityNodes.length * 0.15);
      if (extraNodesToTransfer > 0) {
        const nodesToTransfer = smallCommunityNodes
          .sort(() => Math.random() - 0.5)
          .slice(0, extraNodesToTransfer);
          
        nodesToTransfer.forEach(nodeId => {
          updatedCommunities[nodeId] = largestCommunityId;
        });
      }
    }
    
    return updatedCommunities;
  };

  return { handleCommunityDetection };
};
