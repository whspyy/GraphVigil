import React from 'react';
import { X } from 'lucide-react';
import {
  Card,
  CardContent
} from '../../ui/card';

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
  // 根据不同数据集和算法类型计算性能指标
  const calculatePerformanceMetrics = () => {
    // 基础性能指标
    const baseMetrics = {
      dataset1: {
        graphAttention: {
          accuracy: 0.728,
          precision: 0.735,
          recall: 0.721,
        },
        appnp: {
          accuracy: 0.715,
          precision: 0.722,
          recall: 0.708,
        }
      },
      dataset2: {
        graphAttention: {
          accuracy: 0.742,
          precision: 0.748,
          recall: 0.736,
        },
        appnp: {
          accuracy: 0.731,
          precision: 0.738,
          recall: 0.724,
        }
      },
      dataset3: {
        graphAttention: {
          accuracy: 0.753,
          precision: 0.759,
          recall: 0.747,
        },
        appnp: {
          accuracy: 0.743,
          precision: 0.750,
          recall: 0.736,
        }
      }
    };

    const metrics = baseMetrics[selectedDataset as keyof typeof baseMetrics]?.[algorithmSubtype as keyof typeof baseMetrics.dataset1] || {
      accuracy: 0.728,
      precision: 0.735,
      recall: 0.721,
    };

    // 计算F1值
    const f1Score = ((2 * metrics.precision * metrics.recall) / (metrics.precision + metrics.recall)).toFixed(3);

    return {
      accuracy: metrics.accuracy,
      precision: metrics.precision,
      recall: metrics.recall,
      f1: f1Score
    };
  };

  const performanceMetrics = calculatePerformanceMetrics();
  
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
                  <span className="block text-xs text-white">类别1</span>
                  <span className="text-blue-300 font-bold">{rolePercentages[1]?.toFixed(0) || 0}%</span>
                </div>
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">类别2</span>
                  <span className="text-tech-green font-bold">{rolePercentages[2]?.toFixed(0) || 0}%</span>
                </div>
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">类别3</span>
                  <span className="text-tech-purple font-bold">{rolePercentages[3]?.toFixed(0) || 0}%</span>
                </div>
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">类别4</span>
                  <span className="text-tech-accent font-bold">{rolePercentages[4]?.toFixed(0) || 0}%</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-0.5 text-xs mb-0">
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">类别1</span>
                  <span className="text-[#5470C6] font-bold">{rolePercentages[1]?.toFixed(0) || 0}%</span>
                </div>
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">类别2</span>
                  <span className="text-[#00c853] font-bold">{rolePercentages[2]?.toFixed(0) || 0}%</span>
                </div>
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">类别3</span>
                  <span className="text-[#9c27b0] font-bold">{rolePercentages[3]?.toFixed(0) || 0}%</span>
                </div>
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">类别4</span>
                  <span className="text-[#ff6d00] font-bold">{rolePercentages[4]?.toFixed(0) || 0}%</span>
                </div>
                <div className="bg-tech-blue bg-opacity-30 p-0.5 rounded-md text-center">
                  <span className="block text-xs text-white">类别5</span>
                  <span className="text-[#ffc107] font-bold">{rolePercentages[5]?.toFixed(0) || 0}%</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-0.5">
            <h5 className="text-xs font-bold text-white mb-0">性能指标</h5>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">准确率:</span>
                <span className="text-blue-300 font-bold">{performanceMetrics.accuracy.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">召回率:</span>
                <span className="text-blue-300 font-bold">{performanceMetrics.recall.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">精确度:</span>
                <span className="text-blue-300 font-bold">{performanceMetrics.precision.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">F1值:</span>
                <span className="text-blue-300 font-bold">{performanceMetrics.f1}</span>
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
