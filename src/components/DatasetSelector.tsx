
import React, { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface DatasetSelectorProps {
  selectedDataset: string;
  onSelectDataset: (dataset: string) => void;
}

const DatasetSelector: React.FC<DatasetSelectorProps> = ({ 
  selectedDataset, 
  onSelectDataset 
}) => {
  const datasets = [
    { id: 'dataset1', name: '网暴事件社交网络数据集一' },
    { id: 'dataset2', name: '网暴事件社交网络数据集二' },
    { id: 'dataset3', name: '网暴事件社交网络数据集三' },
    { id: 'dataset4', name: '超大型网暴事件社交网络数据集' }
  ];

  const [showLargeDatasetNotice, setShowLargeDatasetNotice] = useState(false);
  
  // 当用户选择数据集时，保存到localStorage并触发更新
  const handleSelectDataset = (datasetId: string) => {
    localStorage.removeItem('selectedDataset'); // 先清除旧数据
    localStorage.setItem('selectedDataset', datasetId);
    onSelectDataset(datasetId);
    // 超大型数据集：提示前端渲染负载，只展示部分节点
    if (datasetId === 'dataset4') {
      setShowLargeDatasetNotice(true);
    }
  };

  // 初始化时从localStorage加载之前选择的数据集
  useEffect(() => {
    const storedDataset = localStorage.getItem('selectedDataset');
    if (storedDataset && storedDataset !== selectedDataset) {
      onSelectDataset(storedDataset);
    }
    // 默认/恢复进入超大型数据集时，同样弹出性能提示
    if ((storedDataset || selectedDataset) === 'dataset4') {
      setShowLargeDatasetNotice(true);
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

      <AlertDialog open={showLargeDatasetNotice} onOpenChange={setShowLargeDatasetNotice}>
        <AlertDialogContent className="bg-[#0b1220] border-tech-blue/40 text-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-blue-300">超大型数据集提示</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 leading-relaxed">
              该网暴事件社交网络的完整规模超过 10000 个节点。受限于前端图形渲染的性能负载，
              一次性渲染全部节点会导致页面严重卡顿。因此，此处仅可视化展示其中具有代表性的
              1024 个节点（用户），其余用户的链接与统计仍计入算法分析。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-tech-accent hover:bg-blue-600">
              我已了解
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DatasetSelector;
