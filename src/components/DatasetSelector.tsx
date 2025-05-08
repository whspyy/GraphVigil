
import React, { useEffect } from 'react';

interface DatasetSelectorProps {
  selectedDataset: string;
  onSelectDataset: (dataset: string) => void;
}

const DatasetSelector: React.FC<DatasetSelectorProps> = ({ 
  selectedDataset, 
  onSelectDataset 
}) => {
  const datasets = [
    { id: 'dataset1', name: '社交网络数据集一(97 users)' },
    { id: 'dataset2', name: '社交网络数据集二(205 users)' },
    { id: 'dataset3', name: '社交网络数据集三(49 users)' }
  ];
  
  // 当用户选择数据集时，保存到localStorage并触发更新
  const handleSelectDataset = (datasetId: string) => {
    localStorage.removeItem('selectedDataset'); // 先清除旧数据
    localStorage.setItem('selectedDataset', datasetId);
    console.log(`Set dataset ${datasetId} in localStorage and triggering update`);
    onSelectDataset(datasetId);
  };

  // 初始化时从localStorage加载之前选择的数据集
  useEffect(() => {
    const storedDataset = localStorage.getItem('selectedDataset');
    if (storedDataset && storedDataset !== selectedDataset) {
      console.log(`Loading stored dataset from localStorage: ${storedDataset}`);
      onSelectDataset(storedDataset);
    }
  }, []);

  return (
    <div className="w-full">
      <h2 className="text-lg font-bold mb-1 text-blue-300 text-center">数据集</h2>
      <div className="space-y-1">
        {datasets.map(dataset => (
          <button
            key={dataset.id}
            className={`w-full py-1 px-2 rounded-md transition-colors text-xs ${
              selectedDataset === dataset.id 
                ? 'bg-tech-accent text-white' 
                : 'bg-tech-blue text-gray-300 hover:bg-blue-700'
            }`}
            onClick={() => handleSelectDataset(dataset.id)}
          >
            {dataset.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DatasetSelector;
