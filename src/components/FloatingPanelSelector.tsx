
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

// Define the type first, before using it
type VisiblePanelsType = {
  dataset: boolean;
  algorithm: boolean;
  userList: boolean;
  userDetail: boolean;
};

interface FloatingPanelSelectorProps {
  visiblePanels: VisiblePanelsType;
  onTogglePanel: (panel: keyof VisiblePanelsType) => void;
}

const FloatingPanelSelector = ({ visiblePanels, onTogglePanel }: FloatingPanelSelectorProps) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 glass-panel px-4 py-2 rounded-full shadow-lg">
      <div className="flex items-center gap-4">
        {/* 数据选择按钮 */}
        <button
          onClick={() => onTogglePanel('dataset')}
          className={`rounded-full w-10 h-10 flex items-center justify-center transition-all ${
            visiblePanels.dataset 
              ? 'bg-blue-900/50 border-2 border-blue-400 text-blue-300' 
              : 'bg-gray-800/50 border border-gray-700 text-gray-500'
          }`}
          aria-label="Toggle dataset panel"
        >
          {visiblePanels.dataset ? <Eye className="h-3 w-3 absolute opacity-40" /> : <EyeOff className="h-3 w-3 absolute opacity-40" />}
          <span className="text-xs font-bold">数据</span>
        </button>

        {/* 功能演示按钮 */}
        <button
          onClick={() => onTogglePanel('algorithm')}
          className={`rounded-full w-10 h-10 flex items-center justify-center transition-all ${
            visiblePanels.algorithm 
              ? 'bg-blue-900/50 border-2 border-blue-400 text-blue-300' 
              : 'bg-gray-800/50 border border-gray-700 text-gray-500'
          }`}
          aria-label="Toggle algorithm panel"
        >
          {visiblePanels.algorithm ? <Eye className="h-3 w-3 absolute opacity-40" /> : <EyeOff className="h-3 w-3 absolute opacity-40" />}
          <span className="text-xs font-bold">算法</span>
        </button>

        {/* 用户列表按钮 */}
        <button
          onClick={() => onTogglePanel('userList')}
          className={`rounded-full w-10 h-10 flex items-center justify-center transition-all ${
            visiblePanels.userList 
              ? 'bg-blue-900/50 border-2 border-blue-400 text-blue-300' 
              : 'bg-gray-800/50 border border-gray-700 text-gray-500'
          }`}
          aria-label="Toggle user list panel"
        >
          {visiblePanels.userList ? <Eye className="h-3 w-3 absolute opacity-40" /> : <EyeOff className="h-3 w-3 absolute opacity-40" />}
          <span className="text-xs font-bold">列表</span>
        </button>

        {/* 用户详情按钮 */}
        <button
          onClick={() => onTogglePanel('userDetail')}
          className={`rounded-full w-10 h-10 flex items-center justify-center transition-all ${
            visiblePanels.userDetail 
              ? 'bg-blue-900/50 border-2 border-blue-400 text-blue-300' 
              : 'bg-gray-800/50 border border-gray-700 text-gray-500'
          }`}
          aria-label="Toggle user detail panel"
        >
          {visiblePanels.userDetail ? <Eye className="h-3 w-3 absolute opacity-40" /> : <EyeOff className="h-3 w-3 absolute opacity-40" />}
          <span className="text-xs font-bold">信息</span>
        </button>
      </div>
    </div>
  );
};

export default FloatingPanelSelector;
