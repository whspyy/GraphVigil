
import type { ECBasicOption } from 'echarts/types/dist/shared';

export interface ChartNodeData {
  id: string;
  name: string;
  category: number;
  symbolSize: number;
  itemStyle: {
    borderWidth: number;
    borderColor: string;
    color: string;
  };
  emphasis?: {
    itemStyle?: {
      color?: string;
    }
  };
  x?: number;
  y?: number;
  fixed?: boolean;
}

export interface ChartLinkData {
  source: string;
  target: string;
  lineStyle: {
    width: number;
    color: string;
    type: string;
    curveness: number;
  };
}

export interface ChartCategory {
  name: string;
  itemStyle?: {
    color: string;
  };
}

export interface ChartColors {
  roleColors: string[];
  communityColors: string[];
  communityNeutralColor: string;
}
