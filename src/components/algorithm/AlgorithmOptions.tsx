import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Algorithm {
  id: string;
  name: string;
  description: string;
}

interface AlgorithmOptionsProps {
  activeTab: string;
  algorithms: Algorithm[];
  onRunAlgorithm: (subtype: string) => void;
  algorithmRunning: boolean;
}

const AlgorithmOptions: React.FC<AlgorithmOptionsProps> = ({ 
  activeTab,
  algorithms, 
  onRunAlgorithm,
  algorithmRunning
}) => {
  // Function to determine if special styling should be applied
  const getNameClassName = (algorithmId: string, algorithmName: string) => {
    // Increase font size for GCN-MPLP algorithm specifically, but slightly smaller than before
    if (algorithmName === "GCN-MPLP算法") {
      return "font-bold text-base text-white"; // Changed from text-lg to text-base (medium size)
    }
    // Both role classification algorithms should use the same font size as community detection
    return "font-bold text-sm text-white";
  };

  const getDescClassName = (algorithmId: string, algorithmName: string) => {
    // Increase font size for GCN-MPLP algorithm specifically, but slightly smaller than before
    if (algorithmName === "GCN-MPLP算法") {
      return "text-sm text-gray-300 my-0.5"; // Changed from text-base to text-sm (medium size)
    }
    // Reduce the line spacing for all algorithm descriptions
    return "text-xs text-gray-300 my-0.5";
  };

  return (
    <ScrollArea className="flex-1 pr-1">
      <div className="space-y-0 pr-1"> {/* Further reduced from space-y-0.5 to space-y-0 to minimize vertical spacing between algorithm cards */}
        {algorithms.map(algorithm => (
          <div key={algorithm.id} className="p-1.5 bg-tech-blue bg-opacity-20 rounded-lg mb-0.5"> {/* Added mb-0.5 for minimal spacing and reduced padding from p-2 to p-1.5 */}
            <h3 className={getNameClassName(algorithm.id, algorithm.name)}>{algorithm.name}</h3>
            <p className={getDescClassName(algorithm.id, algorithm.name)}>{algorithm.description}</p>
            <button
              className="btn text-xs py-0.5 px-2 mb-0 mt-0" /* Reduced py-1 to py-0.5 and added mt-0 */
              disabled={algorithmRunning}
              onClick={() => onRunAlgorithm(algorithm.id)}
            >
              运行算法
            </button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default AlgorithmOptions;
