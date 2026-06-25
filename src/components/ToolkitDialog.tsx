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
import { getToolkitLog, getToolkitCsv, ParsedCsv } from '../utils/toolkitData';
import {
  getCommunityMetrics,
  getRoleMetrics,
} from '../utils/metricExplain';

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
      { id: 'dataset1', label: '网暴事件社交网络数据集一' },
      { id: 'dataset2', label: '网暴事件社交网络数据集二' },
    ],
  },
  {
    id: 'roleDivision',
    label: '网暴角色划分',
    algos: [
      { id: 'gatv2', label: 'GATv2' },
      { id: 'appnp', label: 'APPNP' },
    ],
    datasets: [{ id: 'dataset1', label: '网暴事件社交网络数据集' }],
  },
];

type MetricRow = { label: string; value: string };

function getMetricsFor(taskId: string, algo: string, dataset: string): MetricRow[] {
  if (taskId === 'groupMining') {
    const nodeCount = dataset === 'dataset2' ? 205 : 97;
    const subtype = algo === 'gatModularity' ? 'gat' : algo === 'gcnDnnDual' ? 'secomm' : 'gcn';
    const m = getCommunityMetrics(dataset, nodeCount, subtype);
    return [
      { label: '准确率', value: m.accuracy.display },
      { label: '召回率', value: m.recall.display },
      { label: '精确率', value: m.precision.display },
      { label: 'F1值', value: m.f1.display },
      { label: '调整兰德系数', value: m.adjustedRand.display },
      { label: '模块度', value: m.modularity.display },
    ];
  }
  // 网暴角色划分 —— 使用角色分类类指标
  const m = getRoleMetrics('dataset1', algo === 'appnp' ? 'appnp' : 'graphAttention');
  return [
    { label: '准确率', value: m.accuracy.display },
    { label: '召回率', value: m.recall.display },
    { label: '精确率', value: m.precision.display },
    { label: 'F1值', value: m.f1.display },
  ];
}

const ToolkitDialog: React.FC<ToolkitDialogProps> = ({ open, onOpenChange }) => {
  const [activeTabId, setActiveTabId] = useState(TABS[0].id);
  const activeTab = TABS.find((t) => t.id === activeTabId) || TABS[0];

  const [algo, setAlgo] = useState(TABS[0].algos[0].id);
  const [dataset, setDataset] = useState(TABS[0].datasets[0].id);

  const [running, setRunning] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<MetricRow[] | null>(null);
  const [csv, setCsv] = useState<ParsedCsv | null>(null);

  const timersRef = useRef<number[]>([]);
  const logBottomRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  // Switching tab resets algo/dataset to that tab's first option
  const handleTabChange = (tabId: string) => {
    const tab = TABS.find((t) => t.id === tabId) || TABS[0];
    setActiveTabId(tabId);
    setAlgo(tab.algos[0].id);
    setDataset(tab.datasets[0].id);
  };

  // Reset results when switching task/algo/dataset
  useEffect(() => {
    clearTimers();
    setRunning(false);
    setLogLines([]);
    setMetrics(null);
    setCsv(null);
  }, [activeTabId, algo, dataset]);

  // Auto-scroll log to bottom as lines stream in
  useEffect(() => {
    logBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logLines]);

  const handleRun = () => {
    clearTimers();
    setMetrics(null);
    setCsv(null);
    setLogLines([]);
    setRunning(true);

    const raw = getToolkitLog(activeTabId, algo, dataset);
    const lines = raw
      ? raw.replace(/\r\n/g, '\n').split('\n')
      : ['[WARN] 未找到该组合的运行日志文件（占位）。', '[INFO] 请将日志文件放入 src/data/toolkit/ 目录。'];

    let acc: string[] = [];
    lines.forEach((line, idx) => {
      const t = window.setTimeout(() => {
        acc = [...acc, line];
        setLogLines([...acc]);
        if (idx === lines.length - 1) {
          const t2 = window.setTimeout(() => {
            setMetrics(getMetricsFor(activeTabId, algo, dataset));
            setCsv(getToolkitCsv(activeTabId, algo, dataset));
            setRunning(false);
          }, 300);
          timersRef.current.push(t2);
        }
      }, 120 * idx);
      timersRef.current.push(t);
    });
  };

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
              <div className="p-3 font-mono text-[11px] leading-relaxed text-green-300 whitespace-pre-wrap">
                {logLines.length === 0 ? (
                  <span className="text-gray-500">选择算法与数据集后点击「运行测试」开始…</span>
                ) : (
                  logLines.map((l, i) => <div key={i}>{l}</div>)
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
          <div className="px-3 py-1.5 text-xs font-bold text-gray-300 border-b border-gray-700 shrink-0">
            详细预测结果{csv ? `（共 ${csv.rows.length} 条）` : ''}
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
                  {csv.rows.map((row, ri) => (
                    <tr key={ri} className="odd:bg-white/[0.02] hover:bg-white/[0.05]">
                      {row.map((cell, ci) => {
                        const isCorrectCol = ci === csv.headers.length - 1;
                        const color = isCorrectCol
                          ? cell.includes('✓')
                            ? 'text-green-400'
                            : 'text-red-400'
                          : 'text-gray-200';
                        return (
                          <td key={ci} className={`px-3 py-1 font-mono ${color}`}>
                            {cell}
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
