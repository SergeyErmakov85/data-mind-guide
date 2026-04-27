import { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SymbolTipProps {
  symbol: string;
  children: ReactNode;
}

/**
 * Inline math-symbol with explanatory tooltip.
 * Usage: <SymbolTip symbol="σ">стандартное отклонение генеральной совокупности</SymbolTip>
 */
export const SymbolTip = ({ symbol, children }: SymbolTipProps) => (
  <TooltipProvider delayDuration={150}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="font-mono font-semibold underline decoration-dotted decoration-foreground/40 underline-offset-4 cursor-help">
          {symbol}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs border-2 border-foreground bg-background text-foreground rounded-none px-3 py-2 text-xs"
      >
        {children}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
