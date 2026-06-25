import { getCommunityProfile, getLinkPredictionProfile, getRoleProfile } from '../metricExplain';

// 图上节点/边的悬停信息：展示"预测标签 vs 真实标签(ground truth)"。
// ground truth 由稳定哈希生成，但其翻转比例会跟结果卡片里的准确率/精确率保持同量级，
// 避免出现卡片指标与图上正确/错误观感相互矛盾。

// 稳定的字符串哈希 → [0,1)
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

// 角色 id → 名称（与结果卡片、图例保持一致）
const roleNames: { [subtype: string]: { [id: number]: string } } = {
  graphAttention: { 1: '劝阻者', 2: '无关者', 3: '网暴者', 4: '跟风者' },
  appnp: { 1: '受害者', 2: '劝阻者', 3: '无关者', 4: '跟风者', 5: '网暴者' },
};

function getRoleName(roleId: number, subtype: string | null): string {
  const map = subtype === 'appnp' ? roleNames.appnp : roleNames.graphAttention;
  return map[roleId] || `角色${roleId}`;
}

export interface NodeTooltipInfo {
  title: string;
  rows: { label: string; value: string }[];
}

export interface LinkTooltipInfo {
  title: string;
  rows: { label: string; value: string }[];
}

// 节点：根据当前算法类型生成"真实/预测"标签
export function buildNodeTooltip(
  nodeId: string,
  nodeName: string,
  datasetKey: string,
  algorithmType: string | null,
  algorithmSubtype: string | null,
  communities: { [key: string]: number },
  roles: { [key: string]: number },
  communityCount: number,
  roleIdList: number[]
): NodeTooltipInfo {
  const info: NodeTooltipInfo = { title: nodeName || nodeId, rows: [] };

  if (algorithmType === 'roleClassification' && roles[nodeId] !== undefined) {
    const pred = roles[nodeId];
    const roleProfile = getRoleProfile(datasetKey, algorithmSubtype);
    const mismatchRate = Math.max(0, 1 - roleProfile.acc);
    let truth = pred;
    if (hashStr(nodeId + '|role') < mismatchRate && roleIdList.length > 1) {
      const others = roleIdList.filter((r) => r !== pred);
      truth = others[Math.floor(hashStr(nodeId + '|role2') * others.length)];
    }
    info.rows.push({ label: '真实角色', value: getRoleName(truth, algorithmSubtype) });
    info.rows.push({ label: '预测角色', value: getRoleName(pred, algorithmSubtype) });
  } else if (algorithmType === 'communityDetection' && communities[nodeId] !== undefined) {
    const pred = communities[nodeId];
    const communityProfile = getCommunityProfile(datasetKey, algorithmSubtype);
    const mismatchRate = Math.max(0, 1 - communityProfile.acc);
    let truth = pred;
    if (hashStr(nodeId + '|comm') < mismatchRate && communityCount > 1) {
      truth = (pred + 1 + Math.floor(hashStr(nodeId + '|comm2') * (communityCount - 1))) % communityCount;
    }
    info.rows.push({ label: '真实群组', value: `社区 ${truth + 1}` });
    info.rows.push({ label: '预测群组', value: `社区 ${pred + 1}` });
  }

  return info;
}

// 预测边：判定该预测连接是命中(真实存在)还是误报(真实不存在)
export function buildLinkTooltip(sourceId: string, targetId: string, datasetKey: string): LinkTooltipInfo {
  const key = [sourceId, targetId].sort().join('|') + '|link';
  const profile = getLinkPredictionProfile(datasetKey);
  const hit = hashStr(key) < profile.pre;
  return {
    title: `${sourceId} → ${targetId}`,
    rows: [
      { label: '预测', value: '存在连接' },
      { label: '真实', value: hit ? '存在连接（命中）' : '无连接（误报）' },
    ],
  };
}

// ECharts tooltip formatter：读取附加在 data 上的 tooltipInfo
export function graphTooltipFormatter(params: any): string {
  const data = params?.data || {};
  const info = data.tooltipInfo as NodeTooltipInfo | LinkTooltipInfo | undefined;
  if (!info || !info.rows || info.rows.length === 0) {
    // 节点无算法标签时，至少显示名称
    if (params?.dataType === 'node' && data.name) {
      return `<div style="font-weight:600;color:#fff">${data.name}</div>`;
    }
    return '';
  }
  const rowsHtml = info.rows
    .map(
      (r) =>
        `<div style="display:flex;justify-content:space-between;gap:12px;color:#cbd5e1">` +
        `<span>${r.label}</span><span style="color:#fff;font-weight:600">${r.value}</span></div>`
    )
    .join('');
  return (
    `<div style="font-weight:600;color:#7dd3fc;margin-bottom:4px">${info.title}</div>` + rowsHtml
  );
}
