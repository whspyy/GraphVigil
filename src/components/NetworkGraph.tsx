import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { useGraphData } from '../hooks/useGraphData';
import { useAlgorithmEffect, useCommunityLayoutReset } from '../hooks/useAlgorithmEffect';
import { useChartEffect } from '../hooks/useChartEffect';

interface NetworkGraphProps {
  selectedDataset: string;
  selectedUser: string | null;
  onUserSelect: (userId: string) => void;
  algorithmType: string | null;
  algorithmSubtype: string | null;
  algorithmRunning: boolean;
  algorithmComplete: boolean;
  onAlgorithmComplete: () => void;
  onRolesUpdate: (roles: {[key: string]: number}) => void;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ 
  selectedDataset, 
  selectedUser, 
  onUserSelect,
  algorithmType,
  algorithmSubtype,
  algorithmRunning,
  algorithmComplete,
  onAlgorithmComplete,
  onRolesUpdate
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  const {
    graphData,
    processedGraphData,
    predictedLinks,
    communities,
    roles,
    communityLayout,
    setProcessedGraphData,
    setPredictedLinks,
    setCommunities,
    setRoles,
    setCommunityLayout,
    userDetailsData,
    forceRefresh
  } = useGraphData(selectedDataset);

  // Algorithm execution effect
  useAlgorithmEffect(
    algorithmRunning,
    algorithmType,
    algorithmSubtype,
    graphData,
    processedGraphData,
    communityLayout,
    setPredictedLinks,
    setCommunities,
    setRoles,
    setProcessedGraphData,
    setCommunityLayout,
    onAlgorithmComplete,
    selectedDataset
  );

  // Reset community layout when changing algorithm type
  useCommunityLayoutReset(algorithmType, setCommunityLayout);

  // Chart rendering effect
  useChartEffect(
    chartRef,
    chartInstance,
    graphData,
    selectedUser,
    algorithmComplete,
    predictedLinks,
    communities,
    roles,
    algorithmType,
    algorithmSubtype,
    onUserSelect,
    communityLayout,
    processedGraphData,
    forceRefresh
  );

  // Add effect to notify parent of roles updates
  useEffect(() => {
    if (roles && Object.keys(roles).length > 0) {
      onRolesUpdate(roles);
    }
  }, [roles, onRolesUpdate]);

  return (
    <div className="w-full h-full">
      <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default NetworkGraph;
