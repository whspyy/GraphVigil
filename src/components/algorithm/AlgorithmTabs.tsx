
import React from 'react';

interface AlgorithmTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const AlgorithmTabs: React.FC<AlgorithmTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'linkPrediction', label: '链接预测' },
    { id: 'communityDetection', label: '群组划分' },
    { id: 'roleClassification', label: '角色分类' }
  ];

  return (
    <div className="flex border-b border-gray-700 mb-1">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`text-base px-3 py-1 ${
            activeTab === tab.id 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-md font-medium' 
              : 'text-gray-400 hover:text-white transition-colors font-medium'
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AlgorithmTabs;
