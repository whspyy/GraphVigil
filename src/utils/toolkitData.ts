// 工具集测试台的数据加载：按 {task}_{algoN}_{datasetN} 匹配 log 与 csv。
// 用户后续把真实文件放到 src/data/toolkit/ 即可被自动匹配，无需改代码。

// 以原始字符串形式导入所有占位/真实数据文件
const logModules = import.meta.glob('../data/toolkit/*.log.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const csvModules = import.meta.glob('../data/toolkit/*.csv', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function findByKey(modules: Record<string, string>, key: string): string | null {
  const match = Object.keys(modules).find((p) => p.includes(key));
  return match ? modules[match] : null;
}

export function getToolkitLog(task: string, algo: string, dataset: string): string | null {
  return findByKey(logModules, `${task}_${algo}_${dataset}.log`);
}

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

export function getToolkitCsv(task: string, algo: string, dataset: string): ParsedCsv | null {
  const raw = findByKey(csvModules, `${task}_${algo}_${dataset}.csv`);
  if (!raw) return null;
  return parseCsv(raw);
}

// 轻量 CSV 解析（支持双引号包裹的字段、逗号分隔）
export function parseCsv(raw: string): ParsedCsv {
  const lines = raw.replace(/\r\n/g, '\n').trim().split('\n').filter((l) => l.length > 0);
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

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}
