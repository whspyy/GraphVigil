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
        { name: '受害者', itemStyle: { color: colors.roleColors[0] } },
        { name: '劝阻者', itemStyle: { color: colors.roleColors[1] } },
        { name: '无关者', itemStyle: { color: colors.roleColors[2] } },
        { name: '跟风者', itemStyle: { color: colors.roleColors[3] } },
        { name: '网暴者', itemStyle: { color: colors.roleColors[4] } }
      ];
    } else {
      return [
        { name: '劝阻者', itemStyle: { color: colors.roleColors[0] } },
        { name: '无关者', itemStyle: { color: colors.roleColors[1] } },
        { name: '网暴者', itemStyle: { color: colors.roleColors[2] } },
        { name: '跟风者', itemStyle: { color: colors.roleColors[3] } }
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
