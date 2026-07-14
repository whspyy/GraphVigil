// 工具集测试台的数据加载：优先匹配用户提供的中文真实文件，
// 同时保留旧英文占位文件作为兜底。
const logModules = import.meta.glob('../data/toolkit/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const csvModules = import.meta.glob('../data/toolkit/*.csv', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

interface ToolkitFiles {
  log: string;
  csv: string;
}

const toolkitFiles: Record<string, ToolkitFiles> = {
  groupMining_gcnSelfExpr_dataset1: {
    log: '基于链接预测的群组结构挖掘-基于GCN和自表达矩阵的算法-网暴事件社交网络数据集一-运行日志.txt',
    csv: '基于链接预测的群组结构挖掘-基于GCN和自表达矩阵的算法-网暴事件社交网络数据集一-详细预测结果.csv',
  },
  groupMining_gcnSelfExpr_dataset2: {
    log: '基于链接预测的群组结构挖掘-基于GCN和自表达矩阵的算法-网暴事件社交网络数据集二-运行日志.txt',
    csv: '基于链接预测的群组结构挖掘-基于GCN和自表达矩阵的算法-网暴事件社交网络数据集二-详细预测结果.csv',
  },
  groupMining_gatModularity_dataset1: {
    log: '基于链接预测的群组结构挖掘-基于GAT和模块度的算法-网暴事件社交网络数据集一-运行日志.txt',
    csv: '基于链接预测的群组结构挖掘-基于GAT和模块度的算法-网暴事件社交网络数据集一-详细预测结果.csv',
  },
  groupMining_gatModularity_dataset2: {
    log: '基于链接预测的群组结构挖掘-基于GAT和模块度的算法-网暴事件社交网络数据集二-运行日志.txt',
    csv: '基于链接预测的群组结构挖掘-基于GAT和模块度的算法-网暴事件社交网络数据集二-详细预测结果.csv',
  },
  groupMining_gcnDnnDual_dataset1: {
    log: '基于链接预测的群组结构挖掘-基于融合GCN和DNN的双重编码器算法-网暴事件社交网络数据集一-运行日志.txt',
    csv: '基于链接预测的群组结构挖掘-基于融合GCN和DNN的双重编码器算法-网暴事件社交网络数据集一-详细预测结果.csv',
  },
  groupMining_gcnDnnDual_dataset2: {
    log: '基于链接预测的群组结构挖掘-基于融合GCN和DNN的双重编码器算法-网暴事件社交网络数据集二-运行日志.txt',
    csv: '基于链接预测的群组结构挖掘-基于融合GCN和DNN的双重编码器算法-网暴事件社交网络数据集二-详细预测结果.csv',
  },
  roleDivision_gatv2_dataset1: {
    log: '网暴角色划分-运行日志-GATv2.txt',
    csv: '网暴角色划分-详细预测结果-GATv2.csv',
  },
  roleDivision_appnp_dataset1: {
    log: '网暴角色划分-运行日志-APPNP.txt',
    csv: '网暴角色划分-详细预测结果-APPNP.csv',
  },
};

function findByKey(modules: Record<string, string>, key: string): string | null {
  const match = Object.keys(modules).find((p) => p.includes(key));
  return match ? modules[match] : null;
}

function findByFilename(modules: Record<string, string>, filename: string): string | null {
  const match = Object.keys(modules).find((path) => path.endsWith(`/${filename}`));
  return match ? modules[match] : null;
}

function getFileConfig(task: string, algo: string, dataset: string): ToolkitFiles | undefined {
  return toolkitFiles[`${task}_${algo}_${dataset}`];
}

export function getToolkitLog(task: string, algo: string, dataset: string): string | null {
  const config = getFileConfig(task, algo, dataset);
  const raw = config ? findByFilename(logModules, config.log) : null;
  return raw || findByKey(logModules, `${task}_${algo}_${dataset}.log`);
}

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

export function getToolkitCsv(task: string, algo: string, dataset: string): ParsedCsv | null {
  const config = getFileConfig(task, algo, dataset);
  const raw = (config ? findByFilename(csvModules, config.csv) : null)
    || findByKey(csvModules, `${task}_${algo}_${dataset}.csv`);
  if (!raw) return null;
  return parseCsv(raw);
}

export interface ToolkitMetric {
  label: string;
  value: string;
}

const toPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

function readLastNumber(raw: string, pattern: RegExp): number | null {
  const matches = Array.from(raw.matchAll(pattern));
  if (matches.length === 0) return null;
  const value = Number(matches[matches.length - 1][1]);
  return Number.isFinite(value) ? value : null;
}

function getClassificationStats(csv: ParsedCsv) {
  const truthIndex = csv.headers.findIndex((header) => header.includes('真实'));
  const predictionIndex = csv.headers.findIndex(
    (header) => header.includes('预测') && !header.includes('是否')
  );
  if (truthIndex < 0 || predictionIndex < 0 || csv.rows.length === 0) return null;

  const rows = csv.rows.filter(
    (row) => row[truthIndex] !== undefined && row[predictionIndex] !== undefined
  );
  const correct = rows.filter((row) => row[truthIndex] === row[predictionIndex]).length;

  return {
    total: rows.length,
    correct,
    wrong: rows.length - correct,
    accuracy: correct / rows.length,
  };
}

export function extractToolkitMetrics(
  task: string,
  rawLog: string | null,
  csv: ParsedCsv | null
): ToolkitMetric[] {
  if (!csv) return [];

  const stats = getClassificationStats(csv);
  if (!stats) return [];

  const cleanLog = (rawLog || '').replace(/^\uFEFF/, '').replace(/\r/g, '');
  const trainingEpoch =
    readLastNumber(cleanLog, /Final model training done at epoch\s+(\d+)/g)
    ?? readLastNumber(cleanLog, /Early stopping at epoch\s+(\d+)/g);
  const loggedTestCount =
    readLastNumber(cleanLog, /节点总数\s*[:：]\s*(\d+)/g)
    ?? readLastNumber(cleanLog, /测试节点数\s*[:：]\s*(\d+)/g);
  const communityCount = readLastNumber(cleanLog, /社区数量\s*[:：]\s*(\d+)/g);

  const metrics: ToolkitMetric[] = [];
  if (trainingEpoch !== null) metrics.push({ label: '训练轮次', value: `${trainingEpoch}` });
  if (task === 'groupMining' && communityCount !== null) {
    metrics.push({ label: '社区数量', value: `${communityCount}` });
  }
  metrics.push(
    { label: '测试节点数', value: `${loggedTestCount ?? stats.total}` },
    { label: '预测正确', value: `${stats.correct}` },
    { label: '预测错误', value: `${stats.wrong}` },
    { label: '准确率', value: toPercent(stats.accuracy) }
  );
  return metrics;
}

// 轻量 CSV 解析（支持双引号包裹的字段、逗号分隔）
export function parseCsv(raw: string): ParsedCsv {
  const normalized = raw.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const lines = normalized.trim().split('\n').filter((line) => line.length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };

  const headers = parseLine(lines[0]).map((header) => header.replace(/^\uFEFF/, ''));
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}
