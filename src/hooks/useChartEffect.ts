import { useEffect, RefObject } from 'react';
import * as echarts from 'echarts';
import { createChartOption } from '../utils/chart/chartOptions';

export const useChartEffect = (
  chartRef: RefObject<HTMLDivElement>,
  chartInstance: React.MutableRefObject<echarts.ECharts | null>,
  graphData: any,
  selectedUser: string | null,
  algorithmComplete: boolean,
  predictedLinks: any[],
  communities: {[key: string]: number},
  roles: {[key: string]: number},
  algorithmType: string | null,
  algorithmSubtype: string | null,
  onUserSelect: (userId: string) => void,
  communityLayout: boolean,
  processedGraphData: any,
  forceRefresh?: number
) => {
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Dispose the existing chart instance to fully recreate it
    if (chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }
    
    // Create a new chart instance
    chartInstance.current = echarts.init(chartRef.current);
    
    const updateChart = () => {
      if (!chartInstance.current) return;

      // Critical fix: Ensure we're using the correct data source
      let displayData;
      
      if (communityLayout && processedGraphData) {
        // Use the processed data with community structure
        displayData = JSON.parse(JSON.stringify(processedGraphData));
      } else {
        // Use the original data
        displayData = JSON.parse(JSON.stringify(graphData));
        
        // Add predicted links if in link prediction mode
        if (algorithmComplete && algorithmType === 'linkPrediction') {
          // Add isPredicted flag to all predicted links for display purposes
          const markedPredictedLinks = predictedLinks.map(link => ({
            ...link,
            isPredicted: true
          }));
          displayData.links = [...displayData.links, ...markedPredictedLinks];
        }
      }
      
      // Define categories for visual style
      const categories: {name: string}[] = [];
      if (algorithmType === 'roleClassification' && algorithmComplete) {
        categories.push({ name: '类别1' });
        categories.push({ name: '类别2' });
        categories.push({ name: '类别3' });
        categories.push({ name: '类别4' });
      } else if (algorithmType === 'communityDetection' && algorithmComplete) {
        // For community detection, use a single "用户" category
        categories.push({ name: '用户' });
      } else {
        categories.push({ name: '用户' });
      }
      
      // Set of nodes to be enlarged (selected and connected nodes)
      const enlargedNodes: Set<string> = new Set();
      const highlightEdges: Set<string> = new Set();
      
      if (selectedUser) {
        enlargedNodes.add(selectedUser);
        displayData.links.forEach((link: any) => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          
          if (sourceId === selectedUser) {
            enlargedNodes.add(targetId);
            highlightEdges.add(`${sourceId}-${targetId}`);
          } else if (targetId === selectedUser) {
            enlargedNodes.add(sourceId);
            highlightEdges.add(`${sourceId}-${targetId}`);
          }
        });
      }
      
      const option = createChartOption(
        displayData,
        selectedUser,
        categories,
        predictedLinks,
        enlargedNodes,
        highlightEdges,
        communityLayout,
        communities,
        roles,
        algorithmType,
        algorithmSubtype
      );
      
      chartInstance.current!.setOption(option);
    };
    
    updateChart();
    
    chartInstance.current.on('click', function(params) {
      if (params.dataType === 'node') {
        const data = params.data as { id: string };
        onUserSelect(data.id);
      }
    });
    
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [graphData, selectedUser, algorithmComplete, predictedLinks, communities, roles, algorithmType, algorithmSubtype, onUserSelect, communityLayout, processedGraphData, chartRef, forceRefresh]);
};
