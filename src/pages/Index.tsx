import React, { useState } from 'react';
import NetworkGraph from '../components/NetworkGraph';
import DatasetSelector from '../components/DatasetSelector';
import UserList from '../components/UserList';
import UserDetail from '../components/UserDetail';
import AlgorithmPanel from '../components/AlgorithmPanel';
import FloatingPanelSelector from '../components/FloatingPanelSelector';
import ToolkitDialog from '../components/ToolkitDialog';
import { useIsMobile } from '../hooks/use-mobile';

const Index = () => {
  const [selectedDataset, setSelectedDataset] = useState<string>('dataset1');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [algorithmType, setAlgorithmType] = useState<string | null>(null);
  const [algorithmSubtype, setAlgorithmSubtype] = useState<string | null>(null);
  const [algorithmRunning, setAlgorithmRunning] = useState<boolean>(false);
  const [algorithmComplete, setAlgorithmComplete] = useState<boolean>(false);
  const [nodeRoles, setNodeRoles] = useState<{[key: string]: number}>({});
  const [toolkitOpen, setToolkitOpen] = useState<boolean>(false);
  
  // Add state for panel visibility
  const [visiblePanels, setVisiblePanels] = useState({
    dataset: true,
    algorithm: true,
    userList: true,
    userDetail: true
  });

  const isMobile = useIsMobile();

  const handleSelectDataset = (dataset: string) => {
    setSelectedDataset(dataset);
    setSelectedUser(null);
    setAlgorithmType(null);
    setAlgorithmSubtype(null);
    setAlgorithmComplete(false);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
  };

  const handleRunAlgorithm = (type: string, subtype: string) => {
    setAlgorithmType(type);
    setAlgorithmSubtype(subtype);
    setAlgorithmRunning(true);
    setAlgorithmComplete(false);
  };

  const handleAlgorithmComplete = () => {
    setAlgorithmRunning(false);
    setAlgorithmComplete(true);
  };

  const handleRolesUpdate = (roles: {[key: string]: number}) => {
    setNodeRoles(roles);
  };

  const handleTogglePanel = (panel: keyof typeof visiblePanels) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };

  return (
    <div className="min-h-screen flex flex-col h-screen">
      {/* Header */}
      <header className="py-1 border-b border-blue-900 flex items-center px-4">
        {/* Logo container */}
        <div className="header-container">
          {/* Logo on the left */}
          <img 
            src="/交大.png" 
            alt="上海交通大学" 
            className="logo"
          />
          
          {/* Centered title */}
          <h1 className="title text-2xl font-bold text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              多维信息融合的网络暴力群组层级结构及关键节点发现软件
            </span>
          </h1>
        </div>

        {/* Toolkit button on the right */}
        <button
          onClick={() => setToolkitOpen(true)}
          className="ml-auto shrink-0 z-10 whitespace-nowrap px-5 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 transition-colors shadow"
        >
          工具集
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 p-2 relative flex h-[calc(100vh-48px)]">
        {/* Graph visualization takes the full area as background */}
        <div className="absolute inset-0 z-0 p-2">
          <NetworkGraph 
            selectedDataset={selectedDataset}
            selectedUser={selectedUser}
            onUserSelect={handleUserSelect}
            algorithmType={algorithmType}
            algorithmSubtype={algorithmSubtype}
            algorithmRunning={algorithmRunning}
            algorithmComplete={algorithmComplete}
            onAlgorithmComplete={handleAlgorithmComplete}
            onRolesUpdate={handleRolesUpdate}
          />
        </div>

        {/* Floating panels with absolute positioning */}
        <div className="w-full h-full z-10 pointer-events-none relative">
          {/* Left top panel - Dataset selector */}
          {visiblePanels.dataset && (
            <div className="absolute left-0 top-0 w-1/4 h-1/5 glass-panel p-1.5 pointer-events-auto">
              <DatasetSelector 
                selectedDataset={selectedDataset}
                onSelectDataset={handleSelectDataset}
              />
            </div>
          )}
          
          {/* Left bottom panel - Algorithm panel - moved 10px down and height reduced by 10px */}
          {visiblePanels.algorithm && (
            <div className="absolute left-0 bottom-0 w-1/4 h-[calc(80%-10px)] glass-panel p-1.5 pointer-events-auto overflow-hidden mt-10">
              <AlgorithmPanel 
                onRunAlgorithm={handleRunAlgorithm}
                algorithmRunning={algorithmRunning}
                algorithmComplete={algorithmComplete}
                algorithmType={algorithmType}
                algorithmSubtype={algorithmSubtype}
                selectedDataset={selectedDataset}
                nodeRoles={nodeRoles}
              />
            </div>
          )}

          {/* Right top panel - User list - height reduced by 5px */}
          {visiblePanels.userList && (
            <div className="absolute right-0 top-0 w-1/4 h-[calc(50%-5px)] glass-panel p-1.5 pointer-events-auto">
              <UserList 
                selectedDataset={selectedDataset}
                selectedUser={selectedUser}
                onUserSelect={handleUserSelect}
              />
            </div>
          )}
          
          {/* Right bottom panel - User details - moved down by 10px and height reduced by 5px */}
          {visiblePanels.userDetail && (
            <div className="absolute right-0 bottom-0 w-1/4 h-[calc(50%-5px)] glass-panel p-1.5 pointer-events-auto mt-10">
              <UserDetail 
                selectedUser={selectedUser}
                selectedDataset={selectedDataset}/>
            </div>
          )}
        </div>

        {/* Floating panel selector */}
        <FloatingPanelSelector 
          visiblePanels={visiblePanels} 
          onTogglePanel={handleTogglePanel} 
        />
      </main>

      {/* Standalone algorithm testing toolkit */}
      <ToolkitDialog open={toolkitOpen} onOpenChange={setToolkitOpen} />
    </div>
  );
};

export default Index;
