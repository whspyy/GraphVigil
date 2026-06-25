import React from 'react';
import { X } from 'lucide-react';
import {
  Card,
  CardContent
} from '../../ui/card';
import MetricValue from '../MetricValue';
import { getRoleMetrics } from '../../../utils/metricExplain';

interface RoleClassificationResultProps {
  algorithmSubtype: string | null;
  onClose: () => void;
  nodeRoles?: {[key: string]: number};
  selectedDataset: string;
}

const RoleClassificationResult: React.FC<RoleClassificationResultProps> = ({
  algorithmSubtype,
  onClose,
  nodeRoles = {},
  selectedDataset
}) => {
  const performanceMetrics = getRoleMetrics(selectedDataset, algorithmSubtype);
  const calculateRolePercentages = () => {
    const roleCounts: {[key: number]: number} = {};
    const totalNodes = Object.keys(nodeRoles).length;

    Object.values(nodeRoles).forEach(role => {
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    const percentages: {[key: number]: number} = {};
    Object.entries(roleCounts).forEach(([role, count]) => {
      percentages[Number(role)] = (count / totalNodes) * 100;
    });

    return percentages;
  };

  const rolePercentages = calculateRolePercentages();
  
  return (
    <div className="algorithm-result text-gray-300 mt-0">
      <div className="flex justify-between items-center mb-0.5">
        <h4 className="font-bold text-blue-300 text-[15px]">角色分类结果</h4>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-blue-300 transition-all duration-300 rounded-full p-1 hover:bg-gray-800/50"
        >
          <X size={16} className="hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
      <p className="text-xs mb-0.5">{algorithmSubtype === 'graphAttention' ? '算法成功将用户分为4种不同角色，在图中以不同颜色显示。' : '算法成功将用户分为5种不同角色，在图中以不同颜色显示。'}</p>
      
      <Card className="mt-0.5 bg-tech-blue bg-opacity-20 border-tech-blue/30">
        <CardContent className="p-1">
          <div className="mb-0.5">
            <h5 className="text-xs font-bold text-white mb-0">角色占比</h5>
            {algorithmSubtype === 'graphAttention' ? (
              <div className="grid grid-cols-4 gap-0.5 text-xs mb-0">
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">网暴者</span>
                  <span className="text-[#9c27b0] font-bold">{rolePercentages[3]?.toFixed(0) || 0}%</span>
                </div>
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">跟风者</span>
                  <span className="text-[#ff6d00] font-bold">{rolePercentages[4]?.toFixed(0) || 0}%</span>
                </div>
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">劝阻者</span>
                  <span className="text-[#5470C6] font-bold">{rolePercentages[1]?.toFixed(0) || 0}%</span>
                </div>
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">无关者</span>
                  <span className="text-[#00c853] font-bold">{rolePercentages[2]?.toFixed(0) || 0}%</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-0.5 text-xs mb-0">
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">网暴者</span>
                  <span className="text-[#ffc107] font-bold">{rolePercentages[5]?.toFixed(0) || 0}%</span>
                </div>
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">跟风者</span>
                  <span className="text-[#ff6d00] font-bold">{rolePercentages[4]?.toFixed(0) || 0}%</span>
                </div>
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">受害者</span>
                  <span className="text-[#5470C6] font-bold">{rolePercentages[1]?.toFixed(0) || 0}%</span>
                </div>
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">劝阻者</span>
                  <span className="text-[#00c853] font-bold">{rolePercentages[2]?.toFixed(0) || 0}%</span>
                </div>
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">无关者</span>
                  <span className="text-[#9c27b0] font-bold">{rolePercentages[3]?.toFixed(0) || 0}%</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-0.5">
            <h5 className="text-xs font-bold text-white mb-0">性能指标<span className="ml-1 text-[10px] font-normal text-gray-400">（悬停查看计算过程）</span></h5>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">准确率:</span>
                <MetricValue value={performanceMetrics.accuracy.display} explain={performanceMetrics.accuracy.explain} className="text-blue-300 font-bold" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">召回率:</span>
                <MetricValue value={performanceMetrics.recall.display} explain={performanceMetrics.recall.explain} className="text-blue-300 font-bold" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">精确率:</span>
                <MetricValue value={performanceMetrics.precision.display} explain={performanceMetrics.precision.explain} className="text-blue-300 font-bold" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">F1值:</span>
                <MetricValue value={performanceMetrics.f1.display} explain={performanceMetrics.f1.explain} className="text-blue-300 font-bold" />
              </div>
            </div>
          </div>
          
          <div className="mt-0 text-xs pb-0">
            <h5 className="font-bold text-white mb-0">分类结论</h5>
            <p className="text-gray-300">
              {algorithmSubtype === 'graphAttention' 
                ? '图注意力算法通过考虑不同节点间的影响权重，成功识别出网络中的不同角色，尤其对高影响力节点的识别准确率更高。' 
                : 'APPNP算法利用信息多次传播机制，提高了网络节点特征的利用效率，整体表现出稳定的分类效果。'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleClassificationResult;
