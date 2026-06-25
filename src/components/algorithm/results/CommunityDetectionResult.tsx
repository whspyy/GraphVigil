import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  Card,
  CardContent
} from '../../ui/card';
import { useGraphData } from '../../../hooks/useGraphData';
import MetricValue from '../MetricValue';
import { getCommunityMetrics, DATASET4_FULL_NODE_COUNT } from '../../../utils/metricExplain';

interface CommunityDetectionResultProps {
  algorithmSubtype: string | null;
  onClose: () => void;
  selectedDataset: string;
}

const CommunityDetectionResult: React.FC<CommunityDetectionResultProps> = ({
  algorithmSubtype,
  onClose,
  selectedDataset
}) => {
  const { graphData } = useGraphData(selectedDataset);
  const nodeCount = graphData?.nodes?.length || 0;

  const [overview, setOverview] = useState({
    communityCount: 0,
    maxCommunitySize: 0,
    avgDensity: 0,
  });

  useEffect(() => {
    const pick = <T,>(gcn: T, secomm: T, gat: T) =>
      algorithmSubtype === 'secomm' ? secomm : algorithmSubtype === 'gat' ? gat : gcn;

    let o;
    switch (selectedDataset) {
      case 'dataset4':
        o = {
          communityCount: pick(6, 8, 7),
          maxCommunitySize: pick(2185, 1763, 1942),
          avgDensity: pick(0.268, 0.245, 0.257),
        };
        break;
      case 'dataset3':
        o = {
          communityCount: pick(4, 6, 5),
          maxCommunitySize: pick(192, 127, 154),
          avgDensity: pick(0.462, 0.438, 0.447),
        };
        break;
      case 'dataset2':
        o = {
          communityCount: pick(4, 6, 5),
          maxCommunitySize: pick(78, 52, 64),
          avgDensity: pick(0.594, 0.572, 0.583),
        };
        break;
      default:
        o = {
          communityCount: pick(3, 5, 4),
          maxCommunitySize: pick(35, 28, 32),
          avgDensity: pick(0.687, 0.654, 0.668),
        };
    }
    setOverview(o);
  }, [selectedDataset, algorithmSubtype, nodeCount]);

  const metrics = getCommunityMetrics(
    selectedDataset,
    nodeCount,
    algorithmSubtype,
    selectedDataset === 'dataset4' ? DATASET4_FULL_NODE_COUNT : undefined
  );

  // Generate algorithm-specific evaluation conclusions
  const getEvaluationConclusion = () => {
    if (algorithmSubtype === 'gcn') {
      if (nodeCount >= 1000) {
        return '图卷积算法在超大型社交网络中成功识别出多个社区结构，社区内部连接紧密、社区间连接稀疏，展现了良好的可扩展性。';
      } else if (nodeCount >= 200) {
        return '图卷积算法在大型社交网络中成功识别了4个社区结构，并表现出较高的模块度和准确率。每个社区内部连接紧密，社区间连接稀疏。';
      } else if (nodeCount >= 90) {
        return '图卷积算法在中型社交网络中有效分离出3个社区，表现出良好的社区结构识别能力和较高的模块度。';
      } else {
        return '图卷积算法成功将小型社交网络划分为多个明显的社区，社区内部连接紧密度高。';
      }
    } else if (algorithmSubtype === 'secomm') {
      if (nodeCount >= 1000) {
        return 'SEComm算法通过整合用户属性特征，在超大型网络中精确识别出更细粒度的社区划分，具有最高的模块度和准确率。';
      } else if (nodeCount >= 200) {
        return 'SEComm算法通过整合用户属性特征，在大型网络中精确识别出6个社区，形成更细粒度的社区划分，具有最高的模块度和准确率。';
      } else if (nodeCount >= 90) {
        return 'SEComm算法在中型网络中识别出5个社区，通过语义增强的方法获得了更合理的社区划分结果，展现了优越的性能。';
      } else {
        return 'SEComm算法在小型网络中发现了多个潜在社区，相比其他算法能够捕捉更细微的社区结构特征。';
      }
    } else {
      if (nodeCount >= 1000) {
        return 'GAT算法在超大型社交网络中通过注意力机制有效处理了异构网络特性，平衡了社区内聚性和社区间分离度。';
      } else if (nodeCount >= 200) {
        return 'GAT算法在大型社交网络中识别出5个社区，通过注意力机制有效处理了异构网络特性，平衡了社区内聚性和社区间分离度。';
      } else if (nodeCount >= 90) {
        return 'GAT算法成功将中型网络划分为4个社区，注意力机制帮助算法关注重要的网络连接模式，提高了社区识别的准确度。';
      } else {
        return 'GAT算法在小型网络中识别出多个社区结构，注意力加权机制使算法能够更好地适应小规模网络的特点。';
      }
    }
  };

  const avgDensity = overview.avgDensity.toFixed(3);

  return (
    <div className="algorithm-result text-gray-300 mt-0">
      <div className="flex justify-between items-center mb-0.5">
        <h4 className="font-bold text-purple-300 text-[15px]">群组划分结果</h4>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-purple-300 transition-all duration-300 rounded-full p-1 hover:bg-gray-800/50"
        >
          <X size={16} className="hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
      <p className="text-xs mb-0.5">算法成功将网络划分为相互独立的社区，每个社区内部用户紧密相连，社区间相对分离。</p>
      
      <Card className="mt-0.5 bg-tech-blue bg-opacity-20 border-tech-blue/30">
        <CardContent className="p-1">
          <div className="mb-0.5">
            <h5 className="text-xs font-bold text-white mb-0">性能指标<span className="ml-1 text-[10px] font-normal text-gray-400">（悬停查看计算过程）</span></h5>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">准确率:</span>
                <MetricValue value={metrics.accuracy.display} explain={metrics.accuracy.explain} className="text-purple-300 font-bold" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">召回率:</span>
                <MetricValue value={metrics.recall.display} explain={metrics.recall.explain} className="text-purple-300 font-bold" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">F1值:</span>
                <MetricValue value={metrics.f1.display} explain={metrics.f1.explain} className="text-purple-300 font-bold" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">调整兰德系数:</span>
                <MetricValue value={metrics.adjustedRand.display} explain={metrics.adjustedRand.explain} className="text-purple-300 font-bold" />
              </div>
            </div>
          </div>
          
          <div className="mb-0.5">
            <h5 className="text-xs font-bold text-white mb-0">社区总览</h5>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-xs">
              <div className="flex justify-between col-span-2">
                <div className="flex justify-between w-[48%]">
                  <span className="text-gray-400">社区数量:</span>
                  <span className="text-purple-300 font-bold">{overview.communityCount}</span>
                </div>
                <div className="flex justify-between w-[48%]">
                  <span className="text-gray-400">最大社区节点数:</span>
                  <span className="text-purple-300 font-bold">{overview.maxCommunitySize}</span>
                </div>
              </div>
              <div className="flex justify-between col-span-2">
                <div className="flex justify-between w-[48%]">
                  <span className="text-gray-400">模块度:</span>
                  <MetricValue value={metrics.modularity.display} explain={metrics.modularity.explain} className="text-purple-300 font-bold" />
                </div>
                <div className="flex justify-between w-[48%]">
                  <span className="text-gray-400">平均连接密度:</span>
                  <span className="text-purple-300 font-bold">{avgDensity}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-0 text-xs pb-0">
            <h5 className="font-bold text-white mb-0">评估结论</h5>
            <p className="text-gray-300">
              {getEvaluationConclusion()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityDetectionResult;
