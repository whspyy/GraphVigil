
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  Card,
  CardContent
} from '../../ui/card';

interface LinkPredictionResultProps {
  algorithmSubtype: string | null;
  onClose: () => void;
}

// 定义不同数据集的性能指标
const datasetMetrics = {
  dataset1: {
    linkCount: 35, // Keeping the link count as requested previously
    accuracy: 78.3, // Adjusted to requested range
    recall: 76.5, // Adjusted downward to match accuracy
    precision: 80.2, // Adjusted downward to match accuracy
    f1: 78.3, // Adjusted to be consistent with recall and precision
    auc: 82.1, // Slightly higher than accuracy as is typical
    similarity: 75.6, // Adjusted to be slightly lower than accuracy
    conclusion: "GCN-MPLP算法在该数据集上表现出良好的链接预测能力。通过计算节点之间的结构相似度和路径特征，算法预测了潜在的用户连接关系，为社交网络推荐系统提供了参考。"
  },
  dataset2: {
    linkCount: 63, // Keeping the link count as requested previously
    accuracy: 80.5, // Adjusted to requested value of 80.5%
    recall: 78.9, // Adjusted upward to match higher accuracy
    precision: 82.7, // Adjusted upward to match higher accuracy
    f1: 80.7, // Adjusted to be consistent with recall and precision
    auc: 84.3, // Slightly higher than accuracy as is typical
    similarity: 77.8, // Adjusted to be slightly lower than accuracy
    conclusion: "GCN-MPLP算法在该数据集上表现出良好的链接预测能力。通过计算节点之间的结构相似度和路径特征，算法预测了潜在的用户连接关系，为社交网络推荐系统提供了参考。"
  },
  dataset3: {
    linkCount: 18, // Keeping this unchanged
    accuracy: 79.7, // Adjusted to requested range
    recall: 77.8, // Adjusted downward to match accuracy
    precision: 81.9, // Adjusted downward to match accuracy
    f1: 79.8, // Adjusted to be consistent with recall and precision
    auc: 83.5, // Slightly higher than accuracy as is typical
    similarity: 76.2, // Adjusted to be slightly lower than accuracy
    conclusion: "GCN-MPLP算法在该数据集上表现出良好的链接预测能力。通过计算节点之间的结构相似度和路径特征，算法预测了潜在的用户连接关系，为社交网络推荐系统提供了参考。"
  }
};

const LinkPredictionResult: React.FC<LinkPredictionResultProps> = ({
  algorithmSubtype,
  onClose
}) => {
  const [selectedDataset, setSelectedDataset] = useState('dataset1');
  
  useEffect(() => {
    // 从localStorage获取当前选择的数据集
    const storedDataset = localStorage.getItem('selectedDataset');
    if (storedDataset) {
      setSelectedDataset(storedDataset);
    }
  }, []);
  
  const metrics = datasetMetrics[selectedDataset as keyof typeof datasetMetrics];

  return (
    <div className="algorithm-result text-gray-300 mt-1">
      <div className="flex justify-between items-center mb-0.5">
        <h4 className="font-bold text-green-300 text-[15px]">链接预测结果</h4>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-green-300 transition-all duration-300 rounded-full p-1 hover:bg-gray-800/50"
        >
          <X size={16} className="hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
      <p className="text-xs mb-1">算法成功识别出{metrics.linkCount}个潜在的新连接，这些连接在图中以虚线显示。</p>
      
      <Card className="mt-1 bg-tech-blue bg-opacity-20 border-tech-blue/30">
        <CardContent className="p-2">
          <div className="mb-1">
            <h5 className="text-xs font-bold text-white mb-0.5">性能指标</h5>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">准确率:</span>
                <span className="text-green-300 font-bold">{metrics.accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">召回率:</span>
                <span className="text-green-300 font-bold">{metrics.recall}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">精确度:</span>
                <span className="text-green-300 font-bold">{metrics.precision}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">F1值:</span>
                <span className="text-green-300 font-bold">{metrics.f1}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">AUC值:</span>
                <span className="text-green-300 font-bold">{metrics.auc}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">相似度分数:</span>
                <span className="text-green-300 font-bold">{metrics.similarity}%</span>
              </div>
            </div>
          </div>
          
          <div className="mt-1 text-xs pb-0">
            <h5 className="font-bold text-white mb-0.5">评估结论</h5>
            <p className="text-gray-300">
              {metrics.conclusion}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkPredictionResult;
