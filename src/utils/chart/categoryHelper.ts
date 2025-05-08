import { ChartCategory, ChartColors } from './types';

// Generate and format categories for visualization
export const generateCategories = (
  algorithmType: string | null,
  colors: ChartColors,
  originalCategories: {name: string}[],
  algorithmSubtype?: string | null
): ChartCategory[] => {
  if (algorithmType === 'roleClassification') {
    if (algorithmSubtype === 'appnp') {
      return [
        { name: '类别1', itemStyle: { color: colors.roleColors[0] } },
        { name: '类别2', itemStyle: { color: colors.roleColors[1] } },
        { name: '类别3', itemStyle: { color: colors.roleColors[2] } },
        { name: '类别4', itemStyle: { color: colors.roleColors[3] } },
        { name: '类别5', itemStyle: { color: colors.roleColors[4] } }
      ];
    } else {
      return [
        { name: '类别1', itemStyle: { color: colors.roleColors[0] } },
        { name: '类别2', itemStyle: { color: colors.roleColors[1] } },
        { name: '类别3', itemStyle: { color: colors.roleColors[2] } },
        { name: '类别4', itemStyle: { color: colors.roleColors[3] } }
      ];
    }
  } else if (algorithmType === 'communityDetection') {
    return [{ name: '用户', itemStyle: { color: colors.communityNeutralColor } }];
  } else {
    return originalCategories.map((cat) => ({
      ...cat,
      itemStyle: { color: '#5470C6' }
    }));
  }
};
