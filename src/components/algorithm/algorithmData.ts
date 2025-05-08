
export const algorithms = {
  linkPrediction: [
    { 
      id: 'gcnMplp', 
      name: 'GCN-MPLP算法',
      description: '基于图卷积神经网络（GCN）和改进的消息传递神经网络（MPNN）构建，并对两种节点标记方法进行了改进和整合，引入至算法中，以提高对用户关系的理解。'
    }
  ],
  communityDetection: [
    { 
      id: 'gcn', 
      name: '图卷积算法',
      description: '采用GCN提取社交网络用户的复杂特征，采用MLP对特征进行聚类，适用于用户关系密切的社交网络。'
    },
    { 
      id: 'secomm', 
      name: 'SEComm算法',
      description: '在GCN的基础上，采用DNN额外提取用户的属性特征，适用于用户个人信息丰富的社交网络。'
    },
    { 
      id: 'gat', 
      name: 'GAT算法',
      description: '采用GAT提取社交网络用户特征，利用注意力机制解决不同用户影响不同的问题，适用于异构社区网络。'
    }
  ],
  roleClassification: [
    { 
      id: 'graphAttention', 
      name: '图注意力算法',
      description: '通过赋予不同邻居不同的权重，更精准地捕捉社交网络中用户之间的关系特征。'
    },
    { 
      id: 'appnp', 
      name: 'APPNP算法',
      description: '基于传播机制的图神经网络算法。结合节点特征和多次信息传播，更稳定地识别社交网络中的用户角色。'
    }
  ]
};

export type AlgorithmType = keyof typeof algorithms;
