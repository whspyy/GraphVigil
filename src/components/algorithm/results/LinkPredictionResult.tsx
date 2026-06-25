
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  Card,
  CardContent
} from '../../ui/card';
import MetricValue from '../MetricValue';
import { getLinkPredictionMetrics } from '../../../utils/metricExplain';

interface LinkPredictionResultProps {
  algorithmSubtype: string | null;
  onClose: () => void;
}

const conclusion =
  'GCN-MPLP算法在该数据集上表现出良好的链接预测能力。通过计算节点之间的结构相似度和路径特征，算法预测了潜在的用户连接关系，为社交网络推荐系统提供了参考。';

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

  const metrics = getLinkPredictionMetrics(selectedDataset);
  const summaryText =
    selectedDataset === 'dataset4'
      ? `算法在完整超大型网络中预测出 ${metrics.linkCount} 个潜在新连接；图中以 ${metrics.visibleLinkCount} 条代表性虚线展示其中一部分。`
      : `算法成功识别出 ${metrics.linkCount} 个潜在的新连接，这些连接在图中以虚线显示。`;

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
      <p className="text-xs mb-1">{summaryText}</p>
      
      <Card className="mt-1 bg-tech-blue bg-opacity-20 border-tech-blue/30">
        <CardContent className="p-2">
          <div className="mb-1">
            <h5 className="text-xs font-bold text-white mb-0.5">性能指标<span className="ml-1 text-[10px] font-normal text-gray-400">（悬停查看计算过程）</span></h5>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">准确率:</span>
                <MetricValue value={metrics.accuracy.display} explain={metrics.accuracy.explain} className="text-green-300 font-bold" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">召回率:</span>
                <MetricValue value={metrics.recall.display} explain={metrics.recall.explain} className="text-green-300 font-bold" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">精确率:</span>
                <MetricValue value={metrics.precision.display} explain={metrics.precision.explain} className="text-green-300 font-bold" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">F1值:</span>
                <MetricValue value={metrics.f1.display} explain={metrics.f1.explain} className="text-green-300 font-bold" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">AUC值:</span>
                <MetricValue value={metrics.auc.display} explain={metrics.auc.explain} className="text-green-300 font-bold" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">相似度分数:</span>
                <MetricValue value={metrics.similarity.display} explain={metrics.similarity.explain} className="text-green-300 font-bold" />
              </div>
            </div>
          </div>
          
          <div className="mt-1 text-xs pb-0">
            <h5 className="font-bold text-white mb-0.5">评估结论</h5>
            <p className="text-gray-300">
              {conclusion}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkPredictionResult;
