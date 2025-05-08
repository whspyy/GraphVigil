import React, { useState, useEffect } from 'react';
import AlgorithmTabs from './algorithm/AlgorithmTabs';
import AlgorithmOptions from './algorithm/AlgorithmOptions';
import AlgorithmProgress from './algorithm/AlgorithmProgress';
import AlgorithmResult from './algorithm/AlgorithmResult';
import { algorithms, AlgorithmType } from './algorithm/algorithmData';

interface AlgorithmPanelProps {
  onRunAlgorithm: (type: string, subtype: string) => void;
  algorithmRunning: boolean;
  algorithmComplete: boolean;
  algorithmType: string | null;
  algorithmSubtype: string | null;
  selectedDataset: string;
  nodeRoles?: {[key: string]: number};
}

const AlgorithmPanel: React.FC<AlgorithmPanelProps> = ({
  onRunAlgorithm,
  algorithmRunning,
  algorithmComplete,
  algorithmType,
  algorithmSubtype,
  selectedDataset,
  nodeRoles = {}
}) => {
  const [activeTab, setActiveTab] = useState<AlgorithmType>('linkPrediction');
  
  // 为每种算法类型存储其完成状态和子类型
  const [resultStates, setResultStates] = useState<{
    [key in AlgorithmType]?: {
      complete: boolean;
      subtype: string | null;
    }
  }>({});

  const handleRunAlgorithm = (subtype: string) => {
    onRunAlgorithm(activeTab, subtype);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as AlgorithmType);
  };
  
  // 当算法完成时更新对应算法类型的结果状态
  React.useEffect(() => {
    if (algorithmComplete && algorithmType && algorithmSubtype) {
      setResultStates(prev => ({
        ...prev,
        [algorithmType]: {
          complete: true,
          subtype: algorithmSubtype
        }
      }));
    }
  }, [algorithmComplete, algorithmType, algorithmSubtype]);

  // 添加新的useEffect，监听selectedDataset的变化
  useEffect(() => {
    // 当数据集变化时，清除所有算法结果
    setResultStates({});
  }, [selectedDataset]);

  // 处理关闭算法结果
  const handleCloseResult = (algorithmType: string) => {
    setResultStates(prev => {
      const newState = { ...prev };
      if (newState[algorithmType as AlgorithmType]) {
        newState[algorithmType as AlgorithmType] = {
          complete: false,
          subtype: null
        };
      }
      return newState;
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-lg font-bold mb-0.5 text-blue-300 text-center">算法演示</h2>
      
      <AlgorithmTabs 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      />
      
      <AlgorithmOptions 
        activeTab={activeTab}
        algorithms={algorithms[activeTab]}
        onRunAlgorithm={handleRunAlgorithm}
        algorithmRunning={algorithmRunning}
      />
      
      <AlgorithmProgress 
        algorithmRunning={algorithmRunning}
        algorithmComplete={algorithmComplete}
        algorithmType={algorithmType}
        algorithmSubtype={algorithmSubtype}
      />
      
      <AlgorithmResult 
        algorithmComplete={resultStates[activeTab]?.complete || false}
        algorithmType={activeTab}
        algorithmSubtype={resultStates[activeTab]?.subtype || null}
        activeTab={activeTab}
        onClose={handleCloseResult}
        selectedDataset={selectedDataset}
        nodeRoles={nodeRoles}
      />
    </div>
  );
};

export default AlgorithmPanel;
