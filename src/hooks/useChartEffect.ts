import { useEffect, useRef, RefObject, useCallback } from 'react';
import * as echarts from 'echarts';
import { createChartOption } from '../utils/chart/chartOptions';

export const useChartEffect = (
  chartRef: RefObject<HTMLDivElement>,
  chartInstance: React.MutableRefObject<echarts.ECharts | null>,
  graphData: any,
  selectedDataset: string,
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
  // Keep latest selectedUser without forcing a full chart rebuild
  const selectedUserRef = useRef(selectedUser);
  selectedUserRef.current = selectedUser;

  // Build the full ECharts option for the current state + a given selected user
  const buildOption = useCallback((activeUser: string | null) => {
    let displayData;

    if (communityLayout && processedGraphData) {
      displayData = JSON.parse(JSON.stringify(processedGraphData));
    } else {
      displayData = JSON.parse(JSON.stringify(graphData));

      if (algorithmComplete && algorithmType === 'linkPrediction') {
        const markedPredictedLinks = predictedLinks.map(link => ({
          ...link,
          isPredicted: true
        }));
        displayData.links = [...displayData.links, ...markedPredictedLinks];
      }
    }

    const categories: {name: string}[] = [];
    if (algorithmType === 'roleClassification' && algorithmComplete) {
      categories.push({ name: '劝阻者' });
      categories.push({ name: '无关者' });
      categories.push({ name: '网暴者' });
      categories.push({ name: '跟风者' });
    } else {
      categories.push({ name: '用户' });
    }

    const enlargedNodes: Set<string> = new Set();
    const highlightEdges: Set<string> = new Set();

    if (activeUser) {
      enlargedNodes.add(activeUser);
      displayData.links.forEach((link: any) => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;

        if (sourceId === activeUser) {
          enlargedNodes.add(targetId);
          highlightEdges.add(`${sourceId}-${targetId}`);
        } else if (targetId === activeUser) {
          enlargedNodes.add(sourceId);
          highlightEdges.add(`${sourceId}-${targetId}`);
        }
      });
    }

    return createChartOption(
      displayData,
      activeUser,
      selectedDataset,
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
  }, [graphData, selectedDataset, algorithmComplete, predictedLinks, communities, roles, algorithmType, algorithmSubtype, communityLayout, processedGraphData]);

  // Full rebuild: only when data / algorithm / dataset change (NOT on node selection).
  // This preserves the force-layout "spread out" animation for algorithm runs.
  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }

    chartInstance.current = echarts.init(chartRef.current);
    chartInstance.current.setOption(buildOption(selectedUserRef.current));

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildOption, onUserSelect, chartRef, forceRefresh]);

  // Lightweight highlight update: on node selection only, merge styles into the
  // existing instance without re-initializing or restarting the force layout.
  useEffect(() => {
    if (!chartInstance.current) return;
    chartInstance.current.setOption(buildOption(selectedUser), { lazyUpdate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);
};
