
import { useState, useEffect } from 'react';
import dataset1 from '../data/dataset1.json';
import dataset2 from '../data/dataset2.json';
import dataset3 from '../data/dataset3.json';
import dataset1UserDetails from '../data/dataset1_userDetails.json';
import dataset2UserDetails from '../data/dataset2_userDetails.json';
import dataset3UserDetails from '../data/dataset3_userDetails.json';

export const useGraphData = (selectedDataset: string = 'dataset1') => {
  const [graphData, setGraphData] = useState(dataset1);
  const [processedGraphData, setProcessedGraphData] = useState<any>(null);
  const [predictedLinks, setPredictedLinks] = useState<any[]>([]);
  const [communities, setCommunities] = useState<{[key: string]: number}>({});
  const [roles, setRoles] = useState<{[key: string]: number}>({});
  const [communityLayout, setCommunityLayout] = useState<boolean>(false);
  const [userDetailsData, setUserDetailsData] = useState<any[]>(dataset1UserDetails);
  // Add a force refresh trigger to completely recreate the chart
  const [forceRefresh, setForceRefresh] = useState<number>(0);

  useEffect(() => {
    if (!selectedDataset) return;
    
    let data;
    let userDetails;
    
    // Select the correct dataset and user details based on the selected dataset
    switch (selectedDataset) {
      case 'dataset1':
        data = dataset1;
        userDetails = dataset1UserDetails;
        console.log("Loading dataset1 with user details count:", dataset1UserDetails.length);
        break;
      case 'dataset2':
        data = dataset2;
        userDetails = dataset2UserDetails;
        console.log("Loading dataset2 with user details count:", dataset2UserDetails.length);
        break;
      case 'dataset3':
        data = dataset3;
        userDetails = dataset3UserDetails;
        console.log("Loading dataset3 with user details count:", dataset3UserDetails.length);
        break;
      default:
        data = dataset1;
        userDetails = dataset1UserDetails;
    }
    
    // Make sure we create a clean copy of the data
    const resetData = {
      nodes: data.nodes.map(node => ({ ...node, category: 0 })),
      links: data.links.map(link => ({ ...link }))
    };
    
    // Reset all state to default values
    setGraphData(resetData);
    setUserDetailsData(userDetails);
    setPredictedLinks([]);
    setCommunities({});
    setRoles({});
    setCommunityLayout(false);
    setProcessedGraphData(null);
    
    // Force a complete chart instance refresh
    setForceRefresh(prev => prev + 1);
    
    console.log(`Dataset switched to ${selectedDataset}, user details count:`, userDetails.length);
  }, [selectedDataset]);

  return {
    graphData,
    setGraphData,
    processedGraphData,
    setProcessedGraphData,
    predictedLinks,
    setPredictedLinks,
    communities,
    setCommunities,
    roles,
    setRoles,
    communityLayout,
    setCommunityLayout,
    userDetailsData,
    selectedDataset,
    forceRefresh
  };
};
