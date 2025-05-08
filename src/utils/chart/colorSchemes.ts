// Color schemes for different chart elements
export const getChartColors = () => {
  // Define role-based colors for node categories
  const roleColors = [
    '#5470C6', // 类别1 - blue (changed from #2962ff)
    '#00c853', // 类别2 - green
    '#9c27b0', // 类别3 - purple
    '#ff6d00', // 类别4 - orange
    '#ffc107'  // 类别5 - yellow
  ];
  
  // Community-based colors - more colors for more communities
  const communityColors = [
    '#5470C6', // Blue (changed from #2962ff)
    '#00c853', // Green
    '#9c27b0', // Purple
    '#ff6d00', // Orange
    '#00bcd4', // Cyan
    '#ffc107', // Amber
    '#e91e63', // Pink
    '#3f51b5', // Indigo
    '#8bc34a', // Light Green
    '#795548'  // Brown
  ];
  
  // Default blue color for community detection (all nodes same color)
  const communityNeutralColor = '#5470C6'; // changed from #2962ff

  return {
    roleColors,
    communityColors,
    communityNeutralColor
  };
};
