
// Helper functions for chart layout calculations

// Calculate community centers for layout in community detection mode
export const calculateCommunityCenters = (communities: {[key: string]: number}) => {
  const communityCenters: {[key: number]: {x: number, y: number}} = {};
  
  if (Object.keys(communities).length === 0) return communityCenters;
  
  // Count how many communities we have
  const communityCount = Math.max(...Object.values(communities)) + 1;
  const nodeCount = Object.keys(communities).length;
  
  // Define positions for distinct community clusters (in a circle formation).
  // For very large graphs (e.g. the 1024-node dataset) the default radius packs
  // all nodes into a tiny disc, so the force layout explodes off-screen. Scale the
  // radius up for large graphs; small datasets keep the original radius unchanged.
  const radius = nodeCount >= 1000 ? 520 : 180;
  
  for (let i = 0; i < communityCount; i++) {
    const angle = (i / communityCount) * 2 * Math.PI;
    communityCenters[i] = {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    };
  }
  
  return communityCenters;
};

// Calculate node position based on community center
export const calculateNodePosition = (nodeId: string, communities: {[key: string]: number}, communityCenters: {[key: number]: {x: number, y: number}}) => {
  if (!communities[nodeId] || !communityCenters[communities[nodeId]]) {
    return {};
  }
  
  // Get the center position of this node's community
  const communityId = communities[nodeId];
  const center = communityCenters[communityId];
  
  // Increased the offset range to spread nodes apart more within each cluster
  // This prevents node overlap while maintaining the cluster structure
  const offsetDistance = 35 + Math.random() * 60; // Increased from 20 + Math.random() * 40
  const offsetAngle = Math.random() * 2 * Math.PI;
  
  return {
    x: center.x + offsetDistance * Math.cos(offsetAngle),
    y: center.y + offsetDistance * Math.sin(offsetAngle)
    // Removed fixed: true to allow nodes to be draggable
  };
};

// Implements a BA-model inspired edge generation for community structure
export const generateBAModelCommunityEdges = (
  nodeIds: string[],
  options?: {
    densityFactor?: number;
    extraEdgesFactor?: number;
  }
): [string, string][] => {
  if (nodeIds.length <= 1) return [];
  
  // Initialize with a small connected network (usually 2-3 nodes)
  const edges: [string, string][] = [];
  const initialNodeCount = Math.min(3, nodeIds.length);
  
  // Connect initial nodes in a small complete graph
  for (let i = 0; i < initialNodeCount - 1; i++) {
    for (let j = i + 1; j < initialNodeCount; j++) {
      edges.push([nodeIds[i], nodeIds[j]]);
    }
  }
  
  // Track node degrees for preferential attachment
  const nodeDegrees: {[key: string]: number} = {};
  nodeIds.slice(0, initialNodeCount).forEach(nodeId => {
    nodeDegrees[nodeId] = initialNodeCount - 1; // Each initial node connected to all others
  });
  
  // Density factor - lower values create sparser networks.
  // Keep the historical default for normal datasets; callers can override it
  // for the ultra-large dataset only.
  const densityFactor = options?.densityFactor ?? 0.5;
  
  // For remaining nodes, use preferential attachment
  for (let i = initialNodeCount; i < nodeIds.length; i++) {
    const newNode = nodeIds[i];
    nodeDegrees[newNode] = 0;
    
    // Number of edges to add for this new node - reducing for less density
    // Instead of log2, use log2 * densityFactor for fewer edges
    const edgesToAdd = Math.min(
      Math.max(1, Math.floor(Math.log2(nodeIds.length) * densityFactor)),
      i // Cannot add more edges than existing nodes
    );
    
    // Create a probability distribution based on node degrees
    const existingNodes = nodeIds.slice(0, i);
    const totalDegree = existingNodes.reduce((sum, node) => sum + (nodeDegrees[node] || 0), 0);
    
    // Add m edges from the new node to existing nodes based on preferential attachment
    const addedTargets = new Set<string>();
    
    for (let e = 0; e < edgesToAdd; e++) {
      // Select a target node based on degree probability
      let targetNode = selectNodeByDegreePreference(existingNodes, nodeDegrees, totalDegree, addedTargets);
      
      if (targetNode && !addedTargets.has(targetNode)) {
        edges.push([newNode, targetNode]);
        addedTargets.add(targetNode);
        
        // Update degrees
        nodeDegrees[newNode]++;
        nodeDegrees[targetNode]++;
      }
    }
  }
  
  // Add some random "local bridges" for more realistic community structure (small world property).
  const extraEdgesFactor = options?.extraEdgesFactor ?? 0.03;
  const extraEdges = Math.floor(nodeIds.length * extraEdgesFactor);
  
  for (let i = 0; i < extraEdges; i++) {
    const sourceIndex = Math.floor(Math.random() * nodeIds.length);
    let targetIndex;
    do {
      targetIndex = Math.floor(Math.random() * nodeIds.length);
    } while (sourceIndex === targetIndex);
    
    const source = nodeIds[sourceIndex];
    const target = nodeIds[targetIndex];
    
    // Check if this edge already exists
    const edgeExists = edges.some(
      ([s, t]) => (s === source && t === target) || (s === target && t === source)
    );
    
    if (!edgeExists) {
      edges.push([source, target]);
    }
  }
  
  return edges;
};

// Helper function to select node based on preferential attachment
const selectNodeByDegreePreference = (
  nodes: string[],
  nodeDegrees: {[key: string]: number},
  totalDegree: number,
  excludeNodes: Set<string>
): string | null => {
  // If all nodes are excluded, return null
  if (excludeNodes.size >= nodes.length) return null;
  
  // Use weighted random selection based on degrees
  const r = Math.random() * totalDegree;
  let cumulativeProb = 0;
  
  for (const node of nodes) {
    if (excludeNodes.has(node)) continue;
    
    cumulativeProb += nodeDegrees[node];
    if (cumulativeProb >= r) {
      return node;
    }
  }
  
  // Fallback: select random non-excluded node
  const availableNodes = nodes.filter(node => !excludeNodes.has(node));
  return availableNodes[Math.floor(Math.random() * availableNodes.length)];
};
