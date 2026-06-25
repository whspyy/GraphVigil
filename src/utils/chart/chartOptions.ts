import * as echarts from 'echarts';
import type { ECBasicOption } from 'echarts/types/dist/shared';
import { calculateCommunityCenters } from './layoutHelper';
import { processNode } from './nodeHelper';
import { processLink } from './linkHelper';
import { generateCategories } from './categoryHelper';
import { getChartColors } from './colorSchemes';
import { graphTooltipFormatter } from './tooltipHelper';

export const createChartOption = (
  displayData: any,
  selectedUser: string | null,
  selectedDataset: string,
  categories: {name: string}[],
  predictedLinks: any[],
  highlightNodes: Set<string>,
  highlightEdges: Set<string>,
  isCommunityLayout: boolean = false,
  communities: {[key: string]: number} = {},
  roles: {[key: string]: number} = {},
  algorithmType: string | null = null,
  algorithmSubtype: string | null = null
): ECBasicOption => {
  // Get color schemes
  const colors = getChartColors();
  
  // Calculate community centers for layout when in community detection mode
  const communityCenters = calculateCommunityCenters(communities);
  
  // Generate simplified categories for visualization
  let displayCategories = categories;
  
  // Handle categories based on algorithm type
  if (algorithmType === 'communityDetection') {
    // For community detection, use a single "用户" category
    displayCategories = [{ name: '用户' }];
  } else if (algorithmType === 'roleClassification') {
    // For role classification, use the predefined role categories
    if (algorithmSubtype === 'appnp') {
      // APPNP has 5 categories
      displayCategories = [
        { name: '受害者' },
        { name: '劝阻者' },
        { name: '无关者' },
        { name: '跟风者' },
        { name: '网暴者' }
      ];
    } else {
      // Graph Attention has 4 categories
      displayCategories = [
        { name: '劝阻者' },
        { name: '无关者' },
        { name: '网暴者' },
        { name: '跟风者' }
      ];
    }
  }
  
  return {
    legend: [{
      data: displayCategories.map(category => category.name),
      textStyle: {
        color: '#fff'
      },
      // Move legend higher up
      top: '1%',
      left: 'center',
      type: 'scroll'
    }],
    tooltip: {
      trigger: 'item',
      confine: true,
      enterable: false,
      backgroundColor: 'rgba(11, 18, 32, 0.95)',
      borderColor: 'rgba(82, 112, 198, 0.5)',
      borderWidth: 1,
      textStyle: { color: '#e5e7eb', fontSize: 12 },
      formatter: graphTooltipFormatter
    },
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'cubicInOut',
    series: [{
      name: 'Social Network',
      type: 'graph',
      layout: 'force', // Always use force layout, even for community layout
      data: displayData.nodes.map((node: any) => 
        processNode(node, selectedUser, highlightNodes, selectedDataset, communities, roles, algorithmType, algorithmSubtype, isCommunityLayout, communityCenters, colors)
      ),
      links: displayData.links.map((link: any) => 
        processLink(link, highlightEdges, predictedLinks, algorithmType, selectedDataset)
      ),
      categories: generateCategories(algorithmType, colors, categories, algorithmSubtype),
      roam: true,
      label: {
        show: false,
        position: 'right'
      },
      force: {
        // Increase repulsion and edge length for better visualization
        repulsion: 100,
        edgeLength: 100
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 5
        }
      }
    }]
  };
};
