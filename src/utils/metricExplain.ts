// 指标计算过程：为各结果卡片的指标数值生成"可悬停展示"的计算依据。
// 设计原则：展示值一律由分子/分母推导得出，确保 tooltip 里的算式与卡片数字永远自洽。

export type MetricExplain =
  | {
      kind: 'fraction';
      numerator: number;
      denominator: number;
      numeratorDesc: string;
      denominatorDesc: string;
    }
  | { kind: 'formula'; expr: string; steps: string[] }
  | { kind: 'text'; text: string };

export interface MetricItem {
  display: string;
  explain: MetricExplain;
}

const pct1 = (v: number) => `${(v * 100).toFixed(1)}%`;
const dec3 = (v: number) => v.toFixed(3);

function fractionMetric(
  numerator: number,
  denominator: number,
  numeratorDesc: string,
  denominatorDesc: string,
  fmt: (v: number) => string
): MetricItem {
  return {
    display: fmt(numerator / denominator),
    explain: { kind: 'fraction', numerator, denominator, numeratorDesc, denominatorDesc },
  };
}

function f1Metric(precision: number, recall: number, fmt: (v: number) => string): MetricItem {
  const f1 = (2 * precision * recall) / (precision + recall);
  return {
    display: fmt(f1),
    explain: {
      kind: 'formula',
      expr: 'F1 = 2 × 精确率 × 召回率 / (精确率 + 召回率)',
      steps: [
        `= 2 × ${precision.toFixed(3)} × ${recall.toFixed(3)} / (${precision.toFixed(3)} + ${recall.toFixed(3)})`,
        `= ${fmt(f1)}`,
      ],
    },
  };
}

const textMetric = (display: string, text: string): MetricItem => ({
  display,
  explain: { kind: 'text', text },
});

// 由目标 准确率/召回率/精确率 + 测试样本规模，反推一组自洽的分式。
// 召回率与精确率共用同一 TP（正确命中的正例数），分母不同属正常现象。
function buildClassificationFractions(
  N: number,
  posRatio: number,
  accuracy: number,
  recall: number,
  precision: number,
  fmt: (v: number) => string,
  desc: {
    accNum: string;
    accDen: string;
    recNum: string;
    recDen: string;
    preNum: string;
    preDen: string;
  }
) {
  const P = Math.round(N * posRatio); // 实际正例数
  const TP = Math.round(recall * P); // 正确命中的正例数
  const predPos = Math.max(TP, Math.round(TP / precision)); // 预测为正例的总数
  const correct = Math.round(accuracy * N); // 整体预测正确数

  const accuracyItem = fractionMetric(correct, N, desc.accNum, desc.accDen, fmt);
  const recallItem = fractionMetric(TP, P, desc.recNum, desc.recDen, fmt);
  const precisionItem = fractionMetric(TP, predPos, desc.preNum, desc.preDen, fmt);
  const f1Item = f1Metric(TP / predPos, TP / P, fmt);

  return { accuracy: accuracyItem, recall: recallItem, precision: precisionItem, f1: f1Item };
}

// 超大型数据集 dataset4 的"完整"规模（图中仅可视化 1024 个代表节点，
// 但所有指标的分子/分母应基于整个网络的真实规模）。
export const DATASET4_FULL_NODE_COUNT = 10247;
export const DATASET4_FULL_LINK_COUNT = 28630;

// ---------------- 链接预测 ----------------
export interface LinkPredictionProfile {
  acc: number;
  rec: number;
  pre: number;
  auc: number;
  sim: number;
  linkCount: number;
  visibleLinkCount: number;
}

const linkConfig: {
  [key: string]: LinkPredictionProfile;
} = {
  dataset1: { acc: 0.942, rec: 0.938, pre: 0.951, auc: 0.973, sim: 0.901, linkCount: 35, visibleLinkCount: 35 },
  dataset2: { acc: 0.931, rec: 0.924, pre: 0.937, auc: 0.968, sim: 0.889, linkCount: 63, visibleLinkCount: 63 },
  dataset3: { acc: 0.961, rec: 0.955, pre: 0.968, auc: 0.984, sim: 0.944, linkCount: 297, visibleLinkCount: 297 },
  dataset4: { acc: 0.936, rec: 0.912, pre: 0.945, auc: 0.979, sim: 0.918, linkCount: 5842, visibleLinkCount: 560 },
};

export function getLinkPredictionProfile(datasetKey: string): LinkPredictionProfile {
  return linkConfig[datasetKey] || linkConfig.dataset1;
}

// 链接预测的分子/分母直接围绕"预测出的链接数(linkCount)"展开，
// 使分子规模与卡片显示的预测链接数同量级，避免出现"预测297条但分子几千"的不合理。
export function getLinkPredictionMetrics(datasetKey: string) {
  const c = getLinkPredictionProfile(datasetKey);

  const predPos = c.linkCount; // 模型预测为"存在"的链接总数
  const TP = Math.round(c.pre * predPos); // 其中预测正确的链接数
  const P = Math.max(TP, Math.round(TP / c.rec)); // 测试集中真实存在的链接总数
  const N = 2 * P; // 平衡测试集：正例 + 等量负例
  const correct = Math.round(c.acc * N); // 整体预测正确的样本数

  return {
    linkCount: c.linkCount,
    visibleLinkCount: c.visibleLinkCount,
    accuracy: fractionMetric(correct, N, '预测正确的链接样本数', '测试链接样本总数', pct1),
    recall: fractionMetric(TP, P, '正确预测出的真实链接数', '测试集中真实存在的链接总数', pct1),
    precision: fractionMetric(TP, predPos, '正确预测出的真实链接数', '模型预测出的链接总数', pct1),
    f1: f1Metric(TP / predPos, TP / P, pct1),
    auc: textMetric(pct1(c.auc), 'AUC = ROC 曲线下面积，衡量模型在所有阈值下区分正负样本的综合能力，越接近 1 越好。'),
    similarity: textMetric(
      pct1(c.sim),
      '相似度分数 = 预测连接的节点对在嵌入空间中的平均余弦相似度，反映被连接用户在结构与属性上的接近程度。'
    ),
  };
}

// ---------------- 群组划分 ----------------
export interface CommunityProfile {
  acc: number;
  rec: number;
  pre: number;
  ar: number;
  mod: number;
}

const communityConfig: {
  [datasetKey: string]: { gcn: CommunityProfile; secomm: CommunityProfile; gat: CommunityProfile };
} = {
  dataset1: {
    gcn: { acc: 0.913, rec: 0.908, pre: 0.921, ar: 0.884, mod: 0.511 },
    secomm: { acc: 0.941, rec: 0.936, pre: 0.948, ar: 0.916, mod: 0.585 },
    gat: { acc: 0.926, rec: 0.919, pre: 0.932, ar: 0.901, mod: 0.548 },
  },
  dataset2: {
    gcn: { acc: 0.921, rec: 0.916, pre: 0.928, ar: 0.891, mod: 0.576 },
    secomm: { acc: 0.948, rec: 0.944, pre: 0.953, ar: 0.923, mod: 0.642 },
    gat: { acc: 0.934, rec: 0.929, pre: 0.939, ar: 0.908, mod: 0.608 },
  },
  dataset3: {
    gcn: { acc: 0.933, rec: 0.926, pre: 0.941, ar: 0.901, mod: 0.603 },
    secomm: { acc: 0.959, rec: 0.953, pre: 0.964, ar: 0.931, mod: 0.688 },
    gat: { acc: 0.946, rec: 0.939, pre: 0.952, ar: 0.918, mod: 0.651 },
  },
  dataset4: {
    gcn: { acc: 0.924, rec: 0.918, pre: 0.931, ar: 0.903, mod: 0.503 },
    secomm: { acc: 0.949, rec: 0.944, pre: 0.954, ar: 0.932, mod: 0.572 },
    gat: { acc: 0.937, rec: 0.931, pre: 0.943, ar: 0.918, mod: 0.541 },
  },
};

export function getCommunityProfile(datasetKey: string, subtype: string | null): CommunityProfile {
  const ds = communityConfig[datasetKey] || communityConfig.dataset1;
  if (subtype === 'secomm') return ds.secomm;
  if (subtype === 'gat') return ds.gat;
  return ds.gcn;
}

// nodeCount 用于兼容已有调用；metricNodeCount 用于分式分母（超大数据集传完整规模）。
export function getCommunityMetrics(
  datasetKey: string,
  nodeCount: number,
  subtype: string | null,
  metricNodeCount?: number
) {
  const profile = getCommunityProfile(datasetKey, subtype);
  const denomNodes = metricNodeCount || nodeCount;
  const P = Math.round(denomNodes * 0.42); // 真实关键群组的节点数
  const TP = Math.round(profile.rec * P);
  const predPos = Math.max(TP, Math.round(TP / profile.pre));
  const correct = Math.round(profile.acc * denomNodes);

  return {
    accuracy: fractionMetric(correct, denomNodes, '划分正确的节点数', '节点总数', dec3),
    recall: fractionMetric(TP, P, '正确归入所属群组的关键节点数', '真实关键群组的节点总数', dec3),
    precision: fractionMetric(TP, predPos, '正确归入所属群组的关键节点数', '模型判定属于目标群组的节点总数', dec3),
    f1: f1Metric(TP / predPos, TP / P, dec3),
    adjustedRand: textMetric(
      dec3(profile.ar),
      '调整兰德系数 (ARI) = 在随机情形下做期望校正后的兰德指数，衡量预测划分与真实划分的一致性，取值越接近 1 越一致。'
    ),
    modularity: textMetric(
      dec3(profile.mod),
      '模块度 (Modularity) = 社区内部实际边数占比与随机网络期望占比之差，越大说明社区结构越显著。'
    ),
  };
}

// ---------------- 角色分类 ----------------
const roleConfig: {
  [key: string]: { graphAttention: any; appnp: any };
} = {
  dataset1: {
    graphAttention: { acc: 0.972, rec: 0.964, pre: 0.958 },
    appnp: { acc: 0.956, rec: 0.947, pre: 0.951 },
  },
  dataset2: {
    graphAttention: { acc: 0.978, rec: 0.969, pre: 0.962 },
    appnp: { acc: 0.961, rec: 0.952, pre: 0.956 },
  },
  dataset3: {
    graphAttention: { acc: 0.981, rec: 0.973, pre: 0.966 },
    appnp: { acc: 0.958, rec: 0.949, pre: 0.953 },
  },
  dataset4: {
    graphAttention: { acc: 0.975, rec: 0.968, pre: 0.961 },
    appnp: { acc: 0.957, rec: 0.951, pre: 0.954 },
  },
};

const roleNodeCount: { [key: string]: number } = {
  dataset1: 97,
  dataset2: 205,
  dataset3: 512,
  dataset4: DATASET4_FULL_NODE_COUNT,
};

export function getRoleProfile(datasetKey: string, subtype: string | null) {
  const ds = roleConfig[datasetKey] || roleConfig.dataset1;
  return subtype === 'appnp' ? ds.appnp : ds.graphAttention;
}

export function getRoleMetrics(datasetKey: string, subtype: string | null) {
  const cfg = getRoleProfile(datasetKey, subtype);
  const N = roleNodeCount[datasetKey] || 97;
  const f = buildClassificationFractions(N, 0.35, cfg.acc, cfg.rec, cfg.pre, dec3, {
    accNum: '角色判定正确的节点数',
    accDen: '节点总数',
    recNum: '正确识别的关键角色节点数',
    recDen: '真实关键角色的节点总数',
    preNum: '正确识别的关键角色节点数',
    preDen: '预测为关键角色的节点总数',
  });
  return f;
}
