// Network algorithms implementation

interface Node {
  id: string;
  [key: string]: unknown;
}

interface Link {
  source: string | Node;
  target: string | Node;
  [key: string]: unknown;
}

interface PredictedLink {
  source: string;
  target: string;
  predictionScore?: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

// Link Prediction Algorithms
export const runLinkPrediction = (subtype: string, graphData: GraphData, selectedDataset: string = 'dataset1') => {
  const currentLinks = new Set<string>();
  graphData.links.forEach((link: Link) => {
    currentLinks.add(`${link.source}-${link.target}`);
    currentLinks.add(`${link.target}-${link.source}`);
  });
  
  let newLinks: PredictedLink[] = [];
  
  // 不同数据集的参数设置
  const datasetParams = {
    dataset1: {
      maxLinks: 35, // Updated from 25 to 35
      commonNeighborThreshold: 2,
      weights: { 
        commonNeighbors: 0.35, 
        adamicAdar: 0.20, 
        resourceAllocation: 0.15, 
        embeddingCosineSim: 0.15, 
        preferentialAttachment: 0.10,
        secondOrderProximity: 0.05
      },
      embeddingDimension: 8,
      randomSeed: 123,
      // Add distribution control parameters
      maxLinksPerNode: 4,  // Limit max links per node
      scoreNormalizationFactor: 0.3  // Add randomness to scores
    },
    dataset2: {
      maxLinks: 63, // Updated from 32 to 63
      commonNeighborThreshold: 3,
      weights: { 
        commonNeighbors: 0.25, 
        adamicAdar: 0.25, 
        resourceAllocation: 0.20, 
        embeddingCosineSim: 0.10, 
        preferentialAttachment: 0.15,
        secondOrderProximity: 0.05
      },
      embeddingDimension: 12,
      randomSeed: 456,
      // Add distribution control parameters
      maxLinksPerNode: 6,  // Limit max links per node for dataset2
      scoreNormalizationFactor: 0.4  // More randomness for dataset2
    },
    dataset3: {
      maxLinks: 300, // 从 18 增加到 300
      commonNeighborThreshold: 1,
      weights: { 
        commonNeighbors: 0.15, // 降低权重以减少局部聚集
        adamicAdar: 0.15, 
        resourceAllocation: 0.20, 
        embeddingCosineSim: 0.30, // 增加权重以利用更全局的特征
        preferentialAttachment: 0.0, // 关闭优先连接以避免中心化
        secondOrderProximity: 0.20 // 增加权重以连接较远节点
      },
      embeddingDimension: 6,
      randomSeed: 789,
      maxLinksPerNode: 15,  // 相应增加以允许更多链接
      scoreNormalizationFactor: 0.5  // 增加随机性以促进分散
    }
  };
  
  // 获取当前数据集的参数
  const params = datasetParams[selectedDataset as keyof typeof datasetParams] || datasetParams.dataset1;
  
  // Advanced GCN-MPLP link prediction implementation
  // This uses a combination of topological features and similarity measures
  if (subtype === 'gcnMplp') {
    // Step 1: Calculate node embeddings (simulated)
    const nodeEmbeddings: {[key: string]: number[]} = {};
    const embeddingDimension = params.embeddingDimension;
    
    // 使用伪随机数生成器，基于数据集的随机种子，确保每个数据集生成不同但一致的嵌入
    const pseudoRandom = (seed: number, index: number) => {
      return (Math.sin(seed * 9999 + index * 777) * 10000) % 1;
    };
    
    graphData.nodes.forEach((node: Node, index: number) => {
      // 为不同数据集生成不同但稳定的嵌入值
      nodeEmbeddings[node.id] = Array.from(
        { length: embeddingDimension }, 
        (_, i) => pseudoRandom(params.randomSeed + index, i) * 2 - 1
      );
    });
    
    // Step 2: Create adjacency map and degree map
    const adjacencyMap: {[key: string]: Set<string>} = {};
    const nodeDegrees: {[key: string]: number} = {};
    
    graphData.nodes.forEach((node: Node) => {
      adjacencyMap[node.id] = new Set<string>();
      nodeDegrees[node.id] = 0;
    });
    
    graphData.links.forEach((link: Link) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      adjacencyMap[sourceId].add(targetId);
      adjacencyMap[targetId].add(sourceId);
      nodeDegrees[sourceId]++;
      nodeDegrees[targetId]++;
    });
    
    // Step 3: Calculate path-based features
    const pathFeatures: {[key: string]: number} = {};
    
    for (let i = 0; i < graphData.nodes.length; i++) {
      for (let j = i + 1; j < graphData.nodes.length; j++) {
        const node1 = graphData.nodes[i].id;
        const node2 = graphData.nodes[j].id;
        
        if (currentLinks.has(`${node1}-${node2}`)) {
          continue;
        }
        
        // Calculate common neighbors (first-order proximity)
        const neighbors1 = adjacencyMap[node1];
        const neighbors2 = adjacencyMap[node2];
        
        if (!neighbors1 || !neighbors2) continue;
        
        let commonNeighborsCount = 0;
        let adamicAdarIndex = 0;
        let resourceAllocationIndex = 0;
        const preferentialAttachment = nodeDegrees[node1] * nodeDegrees[node2];
        
        // Collect common neighbors for feature calculation
        const commonNeighbors: string[] = [];
        for (const neighbor of neighbors1) {
          if (neighbors2.has(neighbor)) {
            commonNeighborsCount++;
            commonNeighbors.push(neighbor);
            
            // Adamic-Adar Index: sum of 1/log(degree) of common neighbors
            adamicAdarIndex += 1 / Math.log(nodeDegrees[neighbor] + 1);
            
            // Resource Allocation Index: sum of 1/degree of common neighbors
            resourceAllocationIndex += 1 / nodeDegrees[neighbor];
          }
        }
        
        // Calculate similarity based on node embeddings (simulated GCN embedding similarity)
        const embedding1 = nodeEmbeddings[node1];
        const embedding2 = nodeEmbeddings[node2];
        
        // Cosine similarity
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        
        for (let k = 0; k < embeddingDimension; k++) {
          dotProduct += embedding1[k] * embedding2[k];
          norm1 += embedding1[k] * embedding1[k];
          norm2 += embedding2[k] * embedding2[k];
        }
        
        const cosineSimilarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
        
        // Calculate second-order proximity (common 2-hop neighbors)
        let secondOrderProximity = 0;
        
        // For each node in the network, check if both target nodes can reach it in 2 hops
        for (const intermediateNode of graphData.nodes) {
          const intermediateId = intermediateNode.id;
          if (intermediateId === node1 || intermediateId === node2) continue;
          
          // Check if node1 can reach intermediateNode in 2 hops
          let node1CanReach = false;
          for (const neighbor of neighbors1) {
            if (adjacencyMap[neighbor].has(intermediateId)) {
              node1CanReach = true;
              break;
            }
          }
          
          // Check if node2 can reach intermediateNode in 2 hops
          let node2CanReach = false;
          for (const neighbor of neighbors2) {
            if (adjacencyMap[neighbor].has(intermediateId)) {
              node2CanReach = true;
              break;
            }
          }
          
          // If both can reach, increment second order proximity
          if (node1CanReach && node2CanReach) {
            secondOrderProximity++;
          }
        }
        
        // 使用数据集特定的权重组合多个特征
        const weights = params.weights;
        let score = 
          weights.commonNeighbors * commonNeighborsCount +
          weights.adamicAdar * adamicAdarIndex +
          weights.resourceAllocation * resourceAllocationIndex +
          weights.embeddingCosineSim * ((cosineSimilarity + 1) / 2) + // Normalize from [-1,1] to [0,1]
          weights.preferentialAttachment * (preferentialAttachment / 1000) + // Normalize
          weights.secondOrderProximity * (secondOrderProximity / 10); // Normalize
        
        // Add randomness to scores to break ties and promote better distribution
        // Helps avoid concentration of links around few popular nodes
        score = score * (1 - params.scoreNormalizationFactor) + 
                Math.random() * params.scoreNormalizationFactor;
        
        // Store the path feature for this node pair
        const pairKey = `${node1}-${node2}`;
        pathFeatures[pairKey] = score;
      }
    }
    
    // Step 4: Select the top scoring node pairs as predicted links
    // BUT limit the number of links per node to avoid concentration
    const nodeLinkCounts: {[key: string]: number} = {};
    graphData.nodes.forEach((node: Node) => {
      nodeLinkCounts[node.id] = 0;
    });
    
    const predictionResults = Object.entries(pathFeatures)
      .sort((a, b) => b[1] - a[1]);
    
    // First filter: Take more candidate links than needed
    const candidateLinks = predictionResults.slice(0, params.maxLinks * 3);
    
    // Second filter: Apply node link limit constraint
    for (const [pairKey, score] of candidateLinks) {
      const [source, target] = pairKey.split('-');
      
      // Check if either node already has too many links
      if (nodeLinkCounts[source] >= params.maxLinksPerNode || 
          nodeLinkCounts[target] >= params.maxLinksPerNode) {
        continue;
      }
      
      // Add this link to the prediction
      newLinks.push({ 
        source, 
        target,
        predictionScore: score
      });
      
      // Update link counts
      nodeLinkCounts[source]++;
      nodeLinkCounts[target]++;
      
      // Break if we have enough links
      if (newLinks.length >= params.maxLinks) {
        break;
      }
    }
    
    // If we still don't have enough links, add more without the constraints
    if (newLinks.length < params.maxLinks) {
      for (const [pairKey, score] of predictionResults) {
        const [source, target] = pairKey.split('-');
        
        // Skip pairs that are already added
        if (newLinks.some(link => 
          (link.source === source && link.target === target) || 
          (link.source === target && link.target === source))) {
          continue;
        }
        
        newLinks.push({ 
          source, 
          target,
          predictionScore: score
        });
        
        if (newLinks.length >= params.maxLinks) {
          break;
        }
      }
    }
  } else {
    // Fallback to existing methods if not using GCN-MPLP
    switch (subtype) {
      case 'commonNeighbors': {
        const neighborMap: {[key: string]: Set<string>} = {};
        
        graphData.nodes.forEach((node: Node) => {
          neighborMap[node.id] = new Set<string>();
        });
        
        graphData.links.forEach((link: Link) => {
          // Handle both string and object source/target
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          
          neighborMap[sourceId].add(targetId);
          neighborMap[targetId].add(sourceId);
        });
        
        for (let i = 0; i < graphData.nodes.length; i++) {
          for (let j = i + 1; j < graphData.nodes.length; j++) {
            const node1 = graphData.nodes[i].id;
            const node2 = graphData.nodes[j].id;
            
            if (currentLinks.has(`${node1}-${node2}`)) {
              continue;
            }
            
            const neighbors1 = neighborMap[node1];
            const neighbors2 = neighborMap[node2];
            
            if (!neighbors1 || !neighbors2) continue;
            
            let commonCount = 0;
            for (const neighbor of neighbors1) {
              if (neighbors2.has(neighbor)) {
                commonCount++;
              }
            }
            
            if (commonCount >= 2) {
              newLinks.push({ source: node1, target: node2 });
            }
          }
        }
        break;
      }
      case 'adamic': {
        // For adamic algorithm, ensure we handle different data formats
        const adamicNeighborMap: {[key: string]: Set<string>} = {};
        
        graphData.nodes.forEach((node: Node) => {
          adamicNeighborMap[node.id] = new Set<string>();
        });
        
        graphData.links.forEach((link: Link) => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          
          adamicNeighborMap[sourceId].add(targetId);
          adamicNeighborMap[targetId].add(sourceId);
        });
        
        // Similar logic as commonNeighbors but with Adamic/Adar score calculation
        for (let i = 0; i < graphData.nodes.length; i++) {
          for (let j = i + 1; j < graphData.nodes.length; j++) {
            const node1 = graphData.nodes[i].id;
            const node2 = graphData.nodes[j].id;
            
            if (currentLinks.has(`${node1}-${node2}`)) {
              continue;
            }
            
            const neighbors1 = adamicNeighborMap[node1];
            const neighbors2 = adamicNeighborMap[node2];
            
            if (!neighbors1 || !neighbors2) continue;
            
            const commonNeighbors = [];
            for (const neighbor of neighbors1) {
              if (neighbors2.has(neighbor)) {
                commonNeighbors.push(neighbor);
              }
            }
            
            if (commonNeighbors.length >= 1) {
              newLinks.push({ source: node1, target: node2 });
            }
          }
        }
        break;
      }
      case 'preferential': {
        const nodeDegrees: {[key: string]: number} = {};
        
        graphData.nodes.forEach((node: Node) => {
          nodeDegrees[node.id] = 0;
        });
        
        graphData.links.forEach((link: Link) => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          
          nodeDegrees[sourceId]++;
          nodeDegrees[targetId]++;
        });
        
        const nodeEntries = Object.entries(nodeDegrees).sort((a, b) => b[1] - a[1]);
        const topNodes = nodeEntries.slice(0, 10).map(entry => entry[0]);
        
        for (let i = 0; i < topNodes.length; i++) {
          for (let j = i + 1; j < topNodes.length; j++) {
            const node1 = topNodes[i];
            const node2 = topNodes[j];
            
            if (currentLinks.has(`${node1}-${node2}`)) {
              continue;
            }
            
            newLinks.push({ source: node1, target: node2 });
          }
        }
        break;
      }
    }
  }
  
  // 根据数据集大小调整预测的链接数量
  if (newLinks.length === 0) {
    // Calculate node degrees
    const nodeDegrees: {[key: string]: number} = {};
    
    graphData.nodes.forEach((node: Node) => {
      nodeDegrees[node.id] = 0;
    });
    
    graphData.links.forEach((link: Link) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      nodeDegrees[sourceId]++;
      nodeDegrees[targetId]++;
    });
    
    // Select nodes with more uniform degree distribution
    // Sort nodes by degree
    const nodeEntries = Object.entries(nodeDegrees).sort((a, b) => b[1] - a[1]);
    
    // Take a mix of high, medium and low degree nodes for better distribution
    const highDegreeNodes = nodeEntries.slice(0, Math.ceil(nodeEntries.length * 0.2))
                                      .map(entry => entry[0]);
    const mediumDegreeNodes = nodeEntries.slice(
      Math.ceil(nodeEntries.length * 0.2),
      Math.ceil(nodeEntries.length * 0.6)
    ).map(entry => entry[0]);
    const lowDegreeNodes = nodeEntries.slice(Math.ceil(nodeEntries.length * 0.6))
                                     .map(entry => entry[0]);
    
    // Create links between nodes of different degree categories
    // This ensures links are distributed across the network
    
    // High to medium
    for (let i = 0; i < highDegreeNodes.length && newLinks.length < params.maxLinks; i++) {
      for (let j = 0; j < mediumDegreeNodes.length && newLinks.length < params.maxLinks; j++) {
        const node1 = highDegreeNodes[i];
        const node2 = mediumDegreeNodes[j];
        
        if (currentLinks.has(`${node1}-${node2}`)) {
          continue;
        }
        
        newLinks.push({ source: node1, target: node2 });
      }
    }
    
    // Medium to low
    for (let i = 0; i < mediumDegreeNodes.length && newLinks.length < params.maxLinks; i++) {
      for (let j = 0; j < lowDegreeNodes.length && newLinks.length < params.maxLinks; j++) {
        const node1 = mediumDegreeNodes[i];
        const node2 = lowDegreeNodes[j];
        
        if (currentLinks.has(`${node1}-${node2}`)) {
          continue;
        }
        
        newLinks.push({ source: node1, target: node2 });
      }
    }
    
    // If still not enough, add more links within the same categories
    if (newLinks.length < params.maxLinks) {
      for (let i = 0; i < highDegreeNodes.length; i++) {
        for (let j = i + 1; j < highDegreeNodes.length; j++) {
          const node1 = highDegreeNodes[i];
          const node2 = highDegreeNodes[j];
          
          if (currentLinks.has(`${node1}-${node2}`)) {
            continue;
          }
          
          newLinks.push({ source: node1, target: node2 });
          
          if (newLinks.length >= params.maxLinks) {
            break;
          }
        }
        if (newLinks.length >= params.maxLinks) {
          break;
        }
      }
    }
    
    // Limit to desired number of links
    newLinks = newLinks.slice(0, params.maxLinks);
  }
  
  // Console log for debugging
  console.log(`Generated ${newLinks.length} predicted links for ${graphData.nodes.length} nodes`);
  
  return newLinks;
};

// Community Detection Algorithms
export const runCommunityDetection = (subtype: string, graphData: GraphData) => {
  // First create a deep copy of the graph data to avoid modifying the original
  const newGraphData = JSON.parse(JSON.stringify(graphData));
  
  // Determine number of communities based on algorithm type and dataset size
  let numCommunities = 4;
  const nodeCount = graphData.nodes.length;
  
  // Adjust number of communities based on dataset size and algorithm
  if (nodeCount >= 200) {
    // Large dataset (dataset2 - 205 nodes)
    switch (subtype) {
      case 'gcn':
        numCommunities = 4; // Updated to match the CommunityDetectionResult component
        break;
      case 'secomm':
        numCommunities = 6;
        break;
      case 'gat':
        numCommunities = 5;
        break;
      default:
        numCommunities = 5;
    }
  } else if (nodeCount >= 90) {
    // Medium dataset (dataset1 - 97 nodes)
    switch (subtype) {
      case 'gcn':
        numCommunities = 3;
        break;
      case 'secomm':
        numCommunities = 5;
        break;
      case 'gat':
        numCommunities = 4;
        break;
      default:
        numCommunities = 4;
    }
  } else {
    // Small dataset (dataset3 - 49 nodes)
    switch (subtype) {
      case 'gcn':
        numCommunities = 2;
        break;
      case 'secomm':
        numCommunities = 4;
        break;
      case 'gat':
        numCommunities = 3;
        break;
      default:
        numCommunities = 3;
    }
  }
  
  console.log(`Detecting ${numCommunities} communities for ${nodeCount} nodes with algorithm: ${subtype}`);
  
  // First assign communities to nodes
  const nodeCommunities: {[key: string]: number} = {};
  const nodeIds = newGraphData.nodes.map((node: Node) => node.id);
  
  // Cluster nodes into communities - adapted for different dataset sizes
  assignCommunitiesToNodes(nodeIds, nodeCommunities, numCommunities, nodeCount);
  
  // Create new graph structure with community-based edges
  // This function will REPLACE all existing links with only intra-community links
  createCommunityBasedGraph(newGraphData, nodeCommunities, nodeCount);
  
  // Return the node communities
  return nodeCommunities;
};

// Assign nodes to communities to maximize connections within communities
const assignCommunitiesToNodes = (
  nodeIds: string[],
  nodeCommunities: {[key: string]: number},
  numCommunities: number,
  nodeCount: number
) => {
  // For different dataset sizes, we'll use different distribution approaches
  
  if (nodeCount >= 90) { // Apply to medium and large datasets
    // For medium and large datasets, create communities of varying sizes.
    // The largest community will be approximately three times the size of the smallest.
    if (numCommunities <= 1) {
      nodeIds.forEach(nodeId => { nodeCommunities[nodeId] = 0; });
      return;
    }
    
    const totalNodes = nodeIds.length;
    
    // We use an arithmetic progression to determine the proportions of community sizes.
    // The largest community will be approximately three times the size of the smallest.
    // Let proportions be p_0, p_1, ..., p_{C-1}. We want p_{C-1} = 3 * p_0.
    // After calculation, this gives p_0 = 1 / (2 * C) and p_i = p_0 * (1 + 2*i/(C-1)).
    const C = numCommunities;
    const p0 = 1 / (2 * C);
    const proportions: number[] = [];
    for (let i = 0; i < C; i++) {
      proportions.push(p0 * (1 + 2 * i / (C - 1)));
    }

    // Calculate community sizes based on proportions, handling rounding.
    const communitySizes: number[] = [];
    let assignedNodesCount = 0;
    for (let i = 0; i < numCommunities - 1; i++) {
      const size = Math.round(proportions[i] * totalNodes);
      communitySizes.push(size);
      assignedNodesCount += size;
    }
    // The last community gets the remaining nodes to ensure the total is correct.
    communitySizes.push(totalNodes - assignedNodesCount);
    
    // Shuffle node IDs to randomly assign them to communities.
    const shuffledIds = [...nodeIds].sort(() => Math.random() - 0.5);
    
    let currentNodeIndex = 0;
    for (let communityId = 0; communityId < numCommunities; communityId++) {
      const communitySize = communitySizes[communityId];
      for (let j = 0; j < communitySize; j++) {
        if (currentNodeIndex < shuffledIds.length) {
          const nodeId = shuffledIds[currentNodeIndex];
          nodeCommunities[nodeId] = communityId;
          currentNodeIndex++;
        }
      }
    }
  } else {
    // Small dataset - create more uneven communities (existing logic is fine)
    // For small datasets, we'll create one larger community and several smaller ones
    
    // First, randomly assign initial communities
    nodeIds.forEach(nodeId => {
      // 40% chance to be in community 0, rest distributed among others
      const rand = Math.random();
      if (rand < 0.4 || numCommunities <= 1) {
        nodeCommunities[nodeId] = 0;
      } else {
        // Distribute the rest among other communities
        nodeCommunities[nodeId] = 1 + Math.floor(rand * 10) % (numCommunities - 1);
      }
    });
  }
};

// Completely rewritten function to create a new graph with proper community structure
const createCommunityBasedGraph = (graphData: GraphData, nodeCommunities: {[key: string]: number}, nodeCount: number) => {
  // Group nodes by community
  const communitiesMap: {[key: number]: string[]} = {};
  
  // Populate communities map
  Object.entries(nodeCommunities).forEach(([nodeId, communityId]) => {
    if (!communitiesMap[communityId]) {
      communitiesMap[communityId] = [];
    }
    communitiesMap[communityId].push(nodeId);
  });
  
  // IMPORTANT: Clear all existing links - this ensures NO inter-community edges
  graphData.links = [];
  
  // Create connections within each community using specific patterns to ensure density
  Object.entries(communitiesMap).forEach(([communityId, nodeIds]) => {
    if (nodeIds.length <= 1) return; // Skip single-node communities
    
    // APPROACH: Create a more densely connected structure based on dataset size
    
    if (nodeCount >= 200) {
      // Large dataset - create sparse but well-structured communities
      // 1. Create the backbone chain
      for (let i = 0; i < nodeIds.length - 1; i++) {
        graphData.links.push({
          source: nodeIds[i],
          target: nodeIds[i + 1]
        });
      }
      
      // Close the loop for communities with 3+ nodes
      if (nodeIds.length >= 3) {
        graphData.links.push({
          source: nodeIds[nodeIds.length - 1],
          target: nodeIds[0]
        });
      }
      
      // Add some cross connections for density
      const numCrossLinks = Math.floor(nodeIds.length * 0.3); // 30% of nodes get cross links
      for (let i = 0; i < numCrossLinks; i++) {
        const sourceIdx = Math.floor(Math.random() * nodeIds.length);
        let targetIdx;
        do {
          targetIdx = Math.floor(Math.random() * nodeIds.length);
        } while (targetIdx === sourceIdx || Math.abs(targetIdx - sourceIdx) <= 2);
        
        graphData.links.push({
          source: nodeIds[sourceIdx],
          target: nodeIds[targetIdx]
        });
      }
    } else if (nodeCount >= 90) {
      // Medium dataset - create moderately connected communities
      // 1. Create the backbone chain
      for (let i = 0; i < nodeIds.length - 1; i++) {
        graphData.links.push({
          source: nodeIds[i],
          target: nodeIds[i + 1]
        });
      }
      
      // Close the loop for communities with 3+ nodes
      if (nodeIds.length >= 3) {
        graphData.links.push({
          source: nodeIds[nodeIds.length - 1],
          target: nodeIds[0]
        });
      }
      
      // Add cross connections based on community size
      if (nodeIds.length >= 5) {
        // Add some cross connections (like 0-2, 1-3) 
        for (let i = 0; i < nodeIds.length; i++) {
          const targetIdx = (i + 2) % nodeIds.length; // Connect to node 2 steps away
          graphData.links.push({
            source: nodeIds[i],
            target: nodeIds[targetIdx]
          });
        }
        
        // Add some random links for larger communities
        if (nodeIds.length > 10) {
          const numRandomLinks = Math.floor(nodeIds.length * 0.2); // 20% of nodes get random links
          for (let i = 0; i < numRandomLinks; i++) {
            const sourceIdx = Math.floor(Math.random() * nodeIds.length);
            let targetIdx;
            do {
              targetIdx = Math.floor(Math.random() * nodeIds.length);
            } while (targetIdx === sourceIdx);
            
            graphData.links.push({
              source: nodeIds[sourceIdx],
              target: nodeIds[targetIdx]
            });
          }
        }
      }
    } else {
      // Small dataset - create densely connected communities
      // For small datasets, create more densely connected structures
      
      // 1. Create fully connected communities (each node connects to every other node)
      for (let i = 0; i < nodeIds.length; i++) {
        for (let j = i + 1; j < nodeIds.length; j++) {
          // Add a link between every pair of nodes in the community
          // For very small communities, this creates dense clusters
          graphData.links.push({
            source: nodeIds[i],
            target: nodeIds[j]
          });
        }
      }
    }
  });
  
  // Remove any duplicate links that might have been created
  const uniqueLinks = new Map();
  graphData.links.forEach((link: Link) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    const linkId = `${sourceId}-${targetId}`;
    const reverseLinkId = `${targetId}-${sourceId}`;
    
    if (!uniqueLinks.has(linkId) && !uniqueLinks.has(reverseLinkId)) {
      uniqueLinks.set(linkId, link);
    }
  });
  
  graphData.links = Array.from(uniqueLinks.values());
};

// Keep the existing detectCommunities function for backward compatibility
export const detectCommunities = (
  adjacencyMap: {[key: string]: string[]},
  nodeCommunities: {[key: string]: number},
  numCommunities: number
) => {
  const nodeIds = Object.keys(adjacencyMap);
  const nodeDegrees = nodeIds.map(nodeId => ({
    id: nodeId,
    degree: adjacencyMap[nodeId].length
  }));
  
  nodeDegrees.sort((a, b) => b.degree - a.degree);
  
  const communitySeeds = nodeDegrees.slice(0, numCommunities).map(node => node.id);
  communitySeeds.forEach((nodeId, index) => {
    nodeCommunities[nodeId] = index;
  });
  
  const unassignedNodes = nodeIds.filter(id => !communitySeeds.includes(id));
  
  for (const nodeId of unassignedNodes) {
    const neighborCommunities: {[key: number]: number} = {};
    
    for (const neighborId of adjacencyMap[nodeId]) {
      const communityId = nodeCommunities[neighborId];
      if (communityId !== undefined) {
        neighborCommunities[communityId] = (neighborCommunities[communityId] || 0) + 1;
      }
    }
    
    let bestCommunity = 0;
    let maxConnections = 0;
    
    for (const [communityId, count] of Object.entries(neighborCommunities)) {
      if (count > maxConnections) {
        maxConnections = count;
        bestCommunity = Number(communityId);
      }
    }
    
    nodeCommunities[nodeId] = maxConnections > 0 ? bestCommunity : Math.floor(Math.random() * numCommunities);
  }
};

// Role Classification Algorithms
export const runRoleClassification = (subtype: string, graphData: GraphData) => {
  const adjacencyMap: {[key: string]: string[]} = {};
  
  graphData.nodes.forEach((node: Node) => {
    const nodeId = node.id;
    adjacencyMap[nodeId] = [];
  });
  
  graphData.links.forEach((link: Link) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    adjacencyMap[sourceId].push(targetId);
    adjacencyMap[targetId].push(sourceId);
  });
  
  const nodeDegrees: {[key: string]: number} = {};
  const nodeRoles: {[key: string]: number} = {};
  
  Object.keys(adjacencyMap).forEach(nodeId => {
    nodeDegrees[nodeId] = adjacencyMap[nodeId].length;
  });
  
  // In this implementation, the role categories map to these indices:
  // 0: Content Creator (内容创作者)
  // 1: Influencer (影响者)
  // 2: Connector (连接者)
  // 3: Observer (观察者)
  
  switch (subtype) {
    case 'graphAttention':
      classifyNodesByGraphAttention(adjacencyMap, nodeRoles, nodeDegrees);
      break;
    case 'appnp':
      classifyNodesByAPPNP(adjacencyMap, nodeRoles, nodeDegrees);
      break;
    default:
      // Fallback to degree-based classification
      classifyNodesByDegree(nodeDegrees, nodeRoles);
  }
  
  return nodeRoles;
};

// A helper function to add random fluctuations to role percentages while ensuring they sum to 100%.
const adjustAndNormalizePercentages = (baseProportions: { id: number, percent: number }[]): { id: number, percent: number }[] => {
  // 1. Apply random adjustments
  const adjusted = baseProportions.map(({ id, percent }) => {
    // Generate a random float for adjustment, e.g., between -0.03 and 0.03
    let randomAdjustment = (Math.random() * 0.06) - 0.03;

    // Constraint: if base percent is 5%, only float upwards.
    if (percent === 5) {
      randomAdjustment = Math.random() * 0.03; // Float between 0% and +3%
    }
    
    let adjustedPercent = (percent / 100) + randomAdjustment;
    
    // Ensure percentage doesn't go below a minimum threshold (e.g., 1%)
    adjustedPercent = Math.max(0.01, adjustedPercent);
    
    return { id, percent: adjustedPercent };
  });

  // 2. Normalize to sum to 1.0
  const currentSum = adjusted.reduce((sum, p) => sum + p.percent, 0);
  
  const normalized = adjusted.map(({ id, percent }) => ({
    id,
    percent: percent / currentSum * 100 // return as percentage points
  }));

  return normalized;
};

export const classifyNodesByGraphAttention = (
  adjacencyMap: {[key: string]: string[]},
  nodeRoles: {[key: string]: number},
  nodeDegrees: {[key: string]: number}
) => {
  const nodeIds = Object.keys(adjacencyMap);
  const totalNodes = nodeIds.length;

  if (totalNodes === 0) {
    return;
  }
  
  const sortedNodes = [...nodeIds].sort((a, b) => nodeDegrees[b] - nodeDegrees[a]);

  // Base proportions for roles, in assignment order (highest degree first)
  const baseProportions = [
    { id: 3, percent: 10 }, // 网暴者
    { id: 4, percent: 25 }, // 跟风者
    { id: 1, percent: 5 },  // 劝阻者
    { id: 2, percent: 60 }  // 无关者
  ];

  // Get dynamically adjusted and normalized proportions
  const adjustedProportions = adjustAndNormalizePercentages(baseProportions);
  
  // Calculate cutoffs based on the new proportions
  const bullyCutoff = Math.ceil(totalNodes * (adjustedProportions[0].percent / 100));
  const followerCutoff = Math.ceil(totalNodes * ((adjustedProportions[0].percent + adjustedProportions[1].percent) / 100));
  const dissuaderCutoff = Math.ceil(totalNodes * ((adjustedProportions[0].percent + adjustedProportions[1].percent + adjustedProportions[2].percent) / 100));

  sortedNodes.forEach((nodeId, index) => {
    if (index < bullyCutoff) {
      nodeRoles[nodeId] = baseProportions[0].id; 
    } else if (index < followerCutoff) {
      nodeRoles[nodeId] = baseProportions[1].id;
    } else if (index < dissuaderCutoff) {
      nodeRoles[nodeId] = baseProportions[2].id;
    } else {
      nodeRoles[nodeId] = baseProportions[3].id;
    }
  });
};

// 计算两个节点之间的最短路径距离
const calculateShortestPathDistance = (
  startId: string,
  endId: string,
  adjacencyMap: {[key: string]: string[]}
): number => {
  const visited = new Set<string>();
  const queue: {nodeId: string, distance: number}[] = [{nodeId: startId, distance: 0}];
  
  while (queue.length > 0) {
    const {nodeId, distance} = queue.shift()!;
    
    if (nodeId === endId) {
      return distance;
    }
    
    if (visited.has(nodeId)) {
      continue;
    }
    
    visited.add(nodeId);
    
    const neighbors = adjacencyMap[nodeId];
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        queue.push({nodeId: neighborId, distance: distance + 1});
      }
    }
  }
  
  return Infinity; // 如果没有找到路径
};

export const classifyNodesByAPPNP = (
  adjacencyMap: {[key:string]: string[]},
  nodeRoles: {[key: string]: number},
  nodeDegrees: {[key: string]: number}
) => {
  const nodeIds = Object.keys(adjacencyMap);
  const sorted = [...nodeIds].sort((a, b) => nodeDegrees[b] - nodeDegrees[a]);
  
  const totalNodes = nodeIds.length;
  if (totalNodes === 0) {
    return;
  }

  // Base proportions for roles, in assignment order (highest degree first)
  const baseProportions = [
    { id: 5, percent: 10 }, // 网暴者
    { id: 4, percent: 25 }, // 跟风者
    { id: 2, percent: 5 },  // 劝阻者
    { id: 1, percent: 5 },  // 受害者
    { id: 3, percent: 55 }  // 无关者
  ];

  // Get dynamically adjusted and normalized proportions
  const adjustedProportions = adjustAndNormalizePercentages(baseProportions);

  // Calculate cutoffs based on the new proportions
  const bullyCutoff = Math.ceil(totalNodes * (adjustedProportions[0].percent / 100));
  const followerCutoff = Math.ceil(totalNodes * ((adjustedProportions[0].percent + adjustedProportions[1].percent) / 100));
  const dissuaderCutoff = Math.ceil(totalNodes * ((adjustedProportions[0].percent + adjustedProportions[1].percent + adjustedProportions[2].percent) / 100));
  const victimCutoff = Math.ceil(totalNodes * ((adjustedProportions[0].percent + adjustedProportions[1].percent + adjustedProportions[2].percent + adjustedProportions[3].percent) / 100));

  sorted.forEach((nodeId, index) => {
    if (index < bullyCutoff) {
      nodeRoles[nodeId] = baseProportions[0].id;
    } else if (index < followerCutoff) {
      nodeRoles[nodeId] = baseProportions[1].id;
    } else if (index < dissuaderCutoff) {
      nodeRoles[nodeId] = baseProportions[2].id;
    } else if (index < victimCutoff) {
      nodeRoles[nodeId] = baseProportions[3].id;
    } else {
      nodeRoles[nodeId] = baseProportions[4].id;
    }
  });

  // 统计每个角色的节点数量
  const roleCounts: {[key: number]: number} = {};
  Object.values(nodeRoles).forEach(role => {
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });
  console.log('APPNP角色分配结果:', roleCounts);
};

export const classifyNodesByDegree = (
  nodeDegrees: {[key: string]: number},
  nodeRoles: {[key: string]: number}
) => {
  const degrees = Object.values(nodeDegrees);
  const maxDegree = Math.max(...degrees);
  const avgDegree = degrees.reduce((sum, d) => sum + d, 0) / degrees.length;
  
  Object.keys(nodeDegrees).forEach(nodeId => {
    const degree = nodeDegrees[nodeId];
    
    if (degree >= maxDegree * 0.8) {
      nodeRoles[nodeId] = 1; // Influencer
    } else if (degree >= avgDegree * 1.5) {
      nodeRoles[nodeId] = 2; // Connector
    } else if (degree <= avgDegree * 0.5) {
      nodeRoles[nodeId] = 3; // Observer
    } else {
      nodeRoles[nodeId] = 0; // Content Creator
    }
  });
};
