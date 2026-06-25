import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';
import type { MetricExplain } from '../../utils/metricExplain';

interface MetricValueProps {
  value: string;
  explain: MetricExplain;
  className?: string;
}

const FractionView: React.FC<{
  numerator: number;
  denominator: number;
  numeratorDesc: string;
  denominatorDesc: string;
}> = ({ numerator, denominator, numeratorDesc, denominatorDesc }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="inline-flex flex-col items-center leading-tight">
      <span className="px-2 font-mono text-base text-white">{numerator.toLocaleString()}</span>
      <span className="my-0.5 h-px w-full min-w-[64px] bg-gray-300" />
      <span className="px-2 font-mono text-base text-white">{denominator.toLocaleString()}</span>
    </div>
    <div className="mt-1 space-y-0.5 text-[11px] text-gray-300">
      <div>分子 = {numeratorDesc}</div>
      <div>分母 = {denominatorDesc}</div>
    </div>
  </div>
);

const MetricValue: React.FC<MetricValueProps> = ({ value, explain, className }) => {
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <span className={`cursor-help border-b border-dotted border-current/50 ${className || ''}`}>
          {value}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        className="max-w-[240px] border-tech-blue/50 bg-[#0b1220] text-gray-200"
      >
        {explain.kind === 'fraction' && (
          <FractionView
            numerator={explain.numerator}
            denominator={explain.denominator}
            numeratorDesc={explain.numeratorDesc}
            denominatorDesc={explain.denominatorDesc}
          />
        )}
        {explain.kind === 'formula' && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-white">{explain.expr}</div>
            {explain.steps.map((s, i) => (
              <div key={i} className="font-mono text-[11px] text-gray-300">
                {s}
              </div>
            ))}
          </div>
        )}
        {explain.kind === 'text' && (
          <div className="text-[11px] leading-relaxed text-gray-200">{explain.text}</div>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

export default MetricValue;
