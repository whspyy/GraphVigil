import { ChartColors, ChartNodeData } from './types';

// Process and format node data for visualization
export const processNode = (
  node: any,
  selectedUser: string | null,
  highlightNodes: Set<string>,
  communities: {[key: string]: number},
  roles: {[key: string]: number},
  algorithmType: string | null,
  algorithmSubtype: string | null,
  isCommunityLayout: boolean,
  communityCenters: {[key: number]: {x: number, y: number}},
  colors: ChartColors
): ChartNodeData => {
  const nodeId = typeof node.id === 'object' ? node.id.id : node.id;
  const isSelectedUser = nodeId === selectedUser;
  const isConnectedUser = highlightNodes.has(nodeId) && !isSelectedUser;
  
  // For community layout, position nodes around their community center
  let nodePosition = {};
  if (isCommunityLayout && communities[nodeId] !== undefined) {
    // Get the center position of this node's community
    const communityId = communities[nodeId];
    const center = communityCenters[communityId];
    
    if (center) {
      // Add some random offset around the community center
      const offsetDistance = 30 + Math.random() * 50;
      const offsetAngle = Math.random() * 2 * Math.PI;
      
      nodePosition = {
        x: center.x + offsetDistance * Math.cos(offsetAngle),
        y: center.y + offsetDistance * Math.sin(offsetAngle)
        // Removed fixed: true to allow nodes to be dragged
      };
    }
  }
  
  // Determine node color based on roles first, community second
  let categoryIndex = 0;
  let nodeColor;
  
  if (algorithmType === 'roleClassification' && roles && roles[nodeId] !== undefined) {
    // For role classification, use roles for category and color
    const role = roles[nodeId];
    console.log('处理节点:', {
      nodeId,
      role,
      algorithmSubtype,
      originalCategoryIndex: categoryIndex
    });
    
    // 对于APPNP，角色1-5直接映射到类别0-4
    // 对于Graph Attention，角色1-4直接映射到类别0-3
    categoryIndex = role - 1;
    // 确保categoryIndex在有效范围内
    categoryIndex = Math.min(categoryIndex, colors.roleColors.length - 1);
    nodeColor = colors.roleColors[categoryIndex];
    
    console.log('节点处理结果:', {
      nodeId,
      finalCategoryIndex: categoryIndex,
      nodeColor,
      role
    });
  } else if (algorithmType === 'communityDetection') {
    // For community detection, use default blue color
    nodeColor = colors.communityNeutralColor;
    categoryIndex = 0;
  } else {
    // Default color
    nodeColor = '#5470C6'; // changed from #2962ff
  }
  
  return {
    id: nodeId,
    name: node.name,
    category: categoryIndex,
    symbolSize: isSelectedUser ? 26 : (isConnectedUser ? 19 : 12),
    itemStyle: {
      borderWidth: isSelectedUser ? 3 : (isConnectedUser ? 2 : 0),
      borderColor: isSelectedUser ? '#fff' : '#ddd',
      // Use the determined color for the node
      color: nodeColor
    },
    // Add emphasis properties for highlighting effect
    emphasis: {
      itemStyle: {
        // Keep the color the same when highlighted
        color: nodeColor
      }
    },
    ...nodePosition
  };
};
