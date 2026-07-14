import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  extractToolkitMetrics,
  getToolkitCsv,
  getToolkitLog,
  ParsedCsv,
  ToolkitMetric,
} from '../utils/toolkitData';

interface ToolkitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Option {
  id: string;
  label: string;
}

interface TabDef {
  id: string;
  label: string;
  algos: Option[];
  datasets: Option[];
}

// 两个页签：群组结构挖掘 / 网暴角色划分
const TABS: TabDef[] = [
  {
    id: 'groupMining',
    label: '基于链接预测的群组结构挖掘',
    algos: [
      { id: 'gcnSelfExpr', label: '基于GCN和自表达矩阵的算法' },
      { id: 'gatModularity', label: '基于GAT和模块度的算法' },
      { id: 'gcnDnnDual', label: '基于融合GCN和DNN的双重编码器算法' },
    ],
    datasets: [
      { id: 'dataset1', label: '社交网络数据集一' },
      { id: 'dataset2', label: '社交网络数据集二' },
    ],
  },
  {
    id: 'roleDivision',
    label: '网暴角色划分',
    algos: [
      { id: 'gatv2', label: 'GATv2' },
      { id: 'appnp', label: 'APPNP' },
    ],
    datasets: [{ id: 'dataset1', label: '社交网络数据集' }],
  },
];

const TABLE_PAGE_SIZE = 100;
const TASK_DURATION: Record<string, number> = {
  groupMining: 90_000,
  roleDivision: 60_000,
};

interface LogPlayback {
  lines: string[];
  deadlines: number[];
  startedAt: number;
  duration: number;
  rawLog: string | null;
  csv: ParsedCsv | null;
  taskId: string;
  revealedCount: number;
}

function findFirstLine(lines: string[], pattern: RegExp, fallback: number): number {
  const index = lines.findIndex((line) => pattern.test(line));
  return index >= 0 ? index : fallback;
}

function buildLogDeadlines(lines: string[], duration: number): number[] {
  if (lines.length === 0) return [];

  const trainingStart = findFirstLine(lines, /^(Epoch:|\[TRAIN\])/, lines.length);
  const trainingAnnouncement = findFirstLine(lines, /开始训练/, trainingStart);
  const stoppingStart = findFirstLine(
    lines,
    /Early stopping cluster train|Final model training done|\[INFO\] Early stopping/,
    lines.length
  );
  const evaluationStart = findFirstLine(
    lines,
    /Final testing|训练完成，开始在测试集上评估|\[EVAL\]/,
    lines.length
  );

  const deadlines = new Array<number>(lines.length);
  const introAt = 300;
  const trainingBeginAt = 4_500;
  const stoppingBeginAt = duration - 9_000;
  const evaluationBeginAt = duration - 4_500;
  const finishAt = duration - 500;

  // 初始化配置属于同一阶段，整批出现后留出几秒模拟模型和数据准备。
  for (let index = 0; index < trainingStart; index++) {
    deadlines[index] = index >= trainingAnnouncement
      ? trainingBeginAt - 300
      : introAt;
  }

  // 训练轮次占用绝大部分运行时间，并按原始日志顺序均匀推进。
  const trainingCount = Math.max(0, stoppingStart - trainingStart);
  for (let offset = 0; offset < trainingCount; offset++) {
    const progress = (offset + 1) / Math.max(trainingCount, 1);
    deadlines[trainingStart + offset] =
      trainingBeginAt + progress * (stoppingBeginAt - trainingBeginAt);
  }

  // 早停与模型保存信息快速连续输出，随后停顿再进入最终测试。
  const stoppingEnd = Math.min(evaluationStart, lines.length);
  const stoppingCount = Math.max(0, stoppingEnd - stoppingStart);
  for (let offset = 0; offset < stoppingCount; offset++) {
    const progress = (offset + 1) / Math.max(stoppingCount, 1);
    deadlines[stoppingStart + offset] =
      stoppingBeginAt + progress * 1_500;
  }

  // 最终评估阶段保持较慢节奏，让结果计算过程清晰可见。
  const evaluationCount = Math.max(0, lines.length - evaluationStart);
  for (let offset = 0; offset < evaluationCount; offset++) {
    const progress = (offset + 1) / Math.max(evaluationCount, 1);
    deadlines[evaluationStart + offset] =
      evaluationBeginAt + progress * (finishAt - evaluationBeginAt);
  }

  // 缺少标准阶段标记的兜底：确保每一行都有合法且递增的时间点。
  let previous = 0;
  for (let index = 0; index < deadlines.length; index++) {
    if (!Number.isFinite(deadlines[index])) {
      deadlines[index] = Math.max(previous, introAt);
    }
    deadlines[index] = Math.max(previous, deadlines[index]);
    previous = deadlines[index];
  }

  return deadlines;
}

function getLogLineClass(line: string): string {
  if (/\[DONE\]|测试完成|Final testing/.test(line)) return 'text-emerald-300 font-semibold';
  if (/\[EVAL\]|准确率|召回率|F1/.test(line)) return 'text-sky-300';
  if (/Model not improved|Early stopping/.test(line)) return 'text-amber-300';
  if (/^(Epoch:|\[TRAIN\])/.test(line)) return 'text-green-300';
  if (/^======|\[INFO\]/.test(line)) return 'text-cyan-200';
  return 'text-gray-300';
}

function isCorrectResult(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === '是'
    || normalized === '正确'
    || normalized === 'true'
    || normalized.includes('✓');
}

const ToolkitDialog: React.FC<ToolkitDialogProps> = ({ open, onOpenChange }) => {
  const [activeTabId, setActiveTabId] = useState(TABS[0].id);
  const activeTab = TABS.find((t) => t.id === activeTabId) || TABS[0];

  const [algo, setAlgo] = useState(TABS[0].algos[0].id);
  const [dataset, setDataset] = useState(TABS[0].datasets[0].id);

  const [running, setRunning] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<ToolkitMetric[] | null>(null);
  const [csv, setCsv] = useState<ParsedCsv | null>(null);
  const [tablePage, setTablePage] = useState(0);

  const playbackRef = useRef<LogPlayback | null>(null);
  const playbackTimerRef = useRef<number | null>(null);
  const logBottomRef = useRef<HTMLDivElement>(null);

  const clearPlayback = () => {
    if (playbackTimerRef.current !== null) {
      window.clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    playbackRef.current = null;
  };

  const syncPlayback = () => {
    const playback = playbackRef.current;
    if (!playback) return;

    const elapsed = Date.now() - playback.startedAt;
    let visibleCount = playback.revealedCount;
    while (
      visibleCount < playback.lines.length
      && playback.deadlines[visibleCount] <= elapsed
    ) {
      visibleCount++;
    }

    if (visibleCount !== playback.revealedCount) {
      playback.revealedCount = visibleCount;
      setLogLines(playback.lines.slice(0, visibleCount));
    }

    if (elapsed >= playback.duration) {
      setLogLines(playback.lines);
      setMetrics(extractToolkitMetrics(playback.taskId, playback.rawLog, playback.csv));
      setCsv(playback.csv);
      setRunning(false);
      clearPlayback();
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => syncPlayback();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      clearPlayback();
    };
  }, []);

  // Switching tab resets algo/dataset to that tab's first option
  const handleTabChange = (tabId: string) => {
    const tab = TABS.find((t) => t.id === tabId) || TABS[0];
    setActiveTabId(tabId);
    setAlgo(tab.algos[0].id);
    setDataset(tab.datasets[0].id);
  };

  // Reset results when switching task/algo/dataset
  useEffect(() => {
    clearPlayback();
    setRunning(false);
    setLogLines([]);
    setMetrics(null);
    setCsv(null);
    setTablePage(0);
  }, [activeTabId, algo, dataset]);

  // Auto-scroll log to bottom as lines stream in
  useEffect(() => {
    logBottomRef.current?.scrollIntoView({ block: 'end' });
  }, [logLines]);

  const handleRun = () => {
    clearPlayback();
    setMetrics(null);
    setCsv(null);
    setLogLines([]);
    setTablePage(0);
    setRunning(true);

    const raw = getToolkitLog(activeTabId, algo, dataset);
    const resultCsv = getToolkitCsv(activeTabId, algo, dataset);
    const lines = raw
      ? raw
          .replace(/^\uFEFF/, '')
          .replace(/\r\n?/g, '\n')
          .split('\n')
          .filter((line) => line.length > 0)
      : ['[WARN] 未找到该组合的运行日志文件（占位）。', '[INFO] 请将日志文件放入 src/data/toolkit/ 目录。'];
    const duration = TASK_DURATION[activeTabId] || 60_000;
    playbackRef.current = {
      lines,
      deadlines: buildLogDeadlines(lines, duration),
      startedAt: Date.now(),
      duration,
      rawLog: raw,
      csv: resultCsv,
      taskId: activeTabId,
      revealedCount: 0,
    };
    playbackTimerRef.current = window.setInterval(syncPlayback, 100);
  };

  const tablePageCount = csv ? Math.ceil(csv.rows.length / TABLE_PAGE_SIZE) : 0;
  const visibleRows = csv
    ? csv.rows.slice(tablePage * TABLE_PAGE_SIZE, (tablePage + 1) * TABLE_PAGE_SIZE)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] w-[96vw] h-[92vh] flex flex-col bg-[#0b1220] border-tech-blue/40 text-gray-200 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-blue-300">算法测试工具集</DialogTitle>
        </DialogHeader>

        {/* Task tabs */}
        <div className="flex border-b border-gray-700">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`px-4 py-1.5 text-sm font-medium ${
                activeTabId === t.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-md'
                  : 'text-gray-400 hover:text-white transition-colors'
              }`}
              onClick={() => handleTabChange(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Selectors + run */}
        <div className="flex flex-wrap items-end gap-3 text-sm">
          <div className="min-w-[320px] flex-1">
            <span className="mb-1 block text-gray-400">算法</span>
            <Select value={algo} onValueChange={setAlgo}>
              <SelectTrigger className="border-tech-blue/40 bg-tech-blue/20 text-gray-100 focus:ring-blue-500">
                <SelectValue placeholder="请选择算法" />
              </SelectTrigger>
              <SelectContent className="border-tech-blue/40 bg-[#0b1220] text-gray-100">
                {activeTab.algos.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="focus:bg-tech-blue/40 focus:text-white">
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[280px] flex-1">
            <span className="mb-1 block text-gray-400">数据集</span>
            <Select value={dataset} onValueChange={setDataset}>
              <SelectTrigger className="border-tech-blue/40 bg-tech-blue/20 text-gray-100 focus:ring-blue-500">
                <SelectValue placeholder="请选择数据集" />
              </SelectTrigger>
              <SelectContent className="border-tech-blue/40 bg-[#0b1220] text-gray-100">
                {activeTab.datasets.map((d) => (
                  <SelectItem key={d.id} value={d.id} className="focus:bg-tech-blue/40 focus:text-white">
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            onClick={handleRun}
            disabled={running}
            className={`ml-auto px-5 py-2 rounded-md text-sm font-medium self-end ${
              running ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            {running ? '运行中…' : '▶ 运行测试'}
          </button>
        </div>

        {/* Log + metrics */}
        <div className="grid grid-cols-3 gap-3 flex-[3] min-h-0">
          {/* Log */}
          <div className="col-span-2 flex flex-col min-h-0 border border-gray-700 rounded-md bg-black/40">
            <div className="px-3 py-1.5 text-xs font-bold text-gray-300 border-b border-gray-700 shrink-0">运行日志</div>
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                {logLines.length === 0 ? (
                  <span className="text-gray-500">选择算法与数据集后点击「运行测试」开始…</span>
                ) : (
                  logLines.map((line, index) => (
                    <div key={index} className={getLogLineClass(line)}>{line}</div>
                  ))
                )}
                {running && <span className="animate-pulse text-green-400">▌</span>}
                <div ref={logBottomRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Metrics */}
          <div className="col-span-1 flex flex-col min-h-0 border border-gray-700 rounded-md bg-tech-blue/10">
            <div className="px-3 py-1.5 text-xs font-bold text-gray-300 border-b border-gray-700 shrink-0">测试结果指标</div>
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-3 space-y-2 text-sm">
                {metrics ? (
                  metrics.map((m) => (
                    <div key={m.label} className="flex justify-between">
                      <span className="text-gray-400">{m.label}:</span>
                      <span className="text-blue-300 font-bold font-mono">{m.value}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500 text-xs">运行完成后显示指标。</span>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Detailed prediction table */}
        <div className="flex flex-col min-h-0 flex-[2] border border-gray-700 rounded-md">
          <div className="flex items-center justify-between px-3 py-1.5 text-xs font-bold text-gray-300 border-b border-gray-700 shrink-0">
            <span>详细预测结果{csv ? `（共 ${csv.rows.length} 条）` : ''}</span>
            {csv && tablePageCount > 1 && (
              <div className="flex items-center gap-2 font-normal">
                <button
                  onClick={() => setTablePage((page) => Math.max(0, page - 1))}
                  disabled={tablePage === 0}
                  className="rounded border border-gray-600 px-2 py-0.5 text-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  上一页
                </button>
                <span className="font-mono text-gray-400">
                  {tablePage + 1} / {tablePageCount}
                </span>
                <button
                  onClick={() => setTablePage((page) => Math.min(tablePageCount - 1, page + 1))}
                  disabled={tablePage >= tablePageCount - 1}
                  className="rounded border border-gray-600 px-2 py-0.5 text-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  下一页
                </button>
              </div>
            )}
          </div>
          <ScrollArea className="flex-1 min-h-0">
            {csv ? (
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[#0e1729]">
                  <tr>
                    {csv.headers.map((h, i) => (
                      <th key={i} className="px-3 py-1.5 text-left font-semibold text-gray-300 border-b border-gray-700">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, rowIndex) => (
                    <tr
                      key={tablePage * TABLE_PAGE_SIZE + rowIndex}
                      className="odd:bg-white/[0.02] hover:bg-white/[0.05]"
                    >
                      {row.map((cell, ci) => {
                        const isCorrectCol = csv.headers[ci]?.includes('是否')
                          || ci === csv.headers.length - 1;
                        const displayCell = isCorrectCol
                          ? isCorrectResult(cell) ? '✓' : '✕'
                          : cell;
                        const color = isCorrectCol
                          ? isCorrectResult(cell)
                            ? 'text-green-400'
                            : 'text-red-400'
                          : 'text-gray-200';
                        return (
                          <td key={ci} className={`px-3 py-1 font-mono ${color}`}>
                            {displayCell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-3 text-xs text-gray-500">运行完成后显示每条测试样本的预测明细。</div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToolkitDialog;
