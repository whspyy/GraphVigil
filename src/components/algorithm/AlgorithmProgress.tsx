import React, { useState, useEffect } from 'react';
import { Progress } from '../ui/progress';
import { algorithms } from './algorithmData';

interface AlgorithmProgressProps {
  algorithmRunning: boolean;
  algorithmComplete: boolean;
  algorithmType: string | null;
  algorithmSubtype: string | null;
}

const AlgorithmProgress: React.FC<AlgorithmProgressProps> = ({ 
  algorithmRunning, 
  algorithmComplete, 
  algorithmType, 
  algorithmSubtype 
}) => {
  const [progress, setProgress] = useState(0);
  
  // Get algorithm name for display
  let algorithmName = '';
  if (algorithmType && algorithmSubtype) {
    const subtypes = algorithms[algorithmType as keyof typeof algorithms] || [];
    const selectedAlgorithm = subtypes.find(alg => alg.id === algorithmSubtype);
    algorithmName = selectedAlgorithm?.name || '';
  }
  
  useEffect(() => {
    if (!algorithmRunning) {
      setProgress(0);
      return;
    }
    
    let totalRunTime = 1500; // default 1.5 seconds
    
    if (algorithmType === 'linkPrediction') {
      totalRunTime = 2000; // 2 seconds for link prediction
    } else if (algorithmType === 'communityDetection') {
      // Vary time based on community detection algorithm
      if (algorithmSubtype === 'gcn') totalRunTime = 2500;
      else if (algorithmSubtype === 'secomm') totalRunTime = 3500;
      else if (algorithmSubtype === 'gat') totalRunTime = 3000;
    } else if (algorithmType === 'roleClassification') {
      // Vary time based on role classification algorithm
      if (algorithmSubtype === 'graphAttention') totalRunTime = 4000;
      else if (algorithmSubtype === 'appnp') totalRunTime = 4500;
    }
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const calculatedProgress = Math.min((elapsedTime / totalRunTime) * 100, 99); // Cap at 99% until complete
      setProgress(Math.floor(calculatedProgress));
      
      if (elapsedTime >= totalRunTime) {
        clearInterval(interval);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [algorithmRunning, algorithmType, algorithmSubtype]);
  
  if (!algorithmRunning) return null;
  
  return (
    <div className="mt-1">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs text-gray-300">正在运行{algorithmName}...</span>
        <span className="text-xs text-blue-300">{progress}%</span>
      </div>
      <Progress value={progress} className="h-1 bg-gray-700" />
    </div>
  );
};

export default AlgorithmProgress;
