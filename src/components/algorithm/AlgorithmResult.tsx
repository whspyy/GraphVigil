import React from 'react';
import LinkPredictionResult from './results/LinkPredictionResult';
import CommunityDetectionResult from './results/CommunityDetectionResult';
import RoleClassificationResult from './results/RoleClassificationResult';

interface AlgorithmResultProps {
  algorithmComplete: boolean;
  algorithmType: string | null;
  algorithmSubtype: string | null;
  activeTab: string;
  onClose: (algorithmType: string) => void;
  selectedDataset: string;
  nodeRoles?: {[key: string]: number};
}

const AlgorithmResult: React.FC<AlgorithmResultProps> = ({
  algorithmComplete,
  algorithmType,
  algorithmSubtype,
  activeTab,
  onClose,
  selectedDataset,
  nodeRoles = {}
}) => {
  // 只显示已完成且当前标签页匹配的算法结果
  if (!algorithmComplete || !algorithmType || !algorithmSubtype) return null;

  const handleClose = () => {
    onClose(algorithmType || '');
  };

  switch (algorithmType) {
    case 'linkPrediction':
      return <LinkPredictionResult algorithmSubtype={algorithmSubtype} onClose={handleClose} />;
    case 'communityDetection':
      return <CommunityDetectionResult 
        algorithmSubtype={algorithmSubtype} 
        onClose={handleClose} 
        selectedDataset={selectedDataset}
      />;
    case 'roleClassification':
      return <RoleClassificationResult 
        algorithmSubtype={algorithmSubtype} 
        onClose={handleClose}
        nodeRoles={nodeRoles}
        selectedDataset={selectedDataset}
      />;
    default:
      return null;
  }
};

export default AlgorithmResult;
