import { CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProgressBadgeProps {
  completed: boolean;
  className?: string;
}

export const ProgressBadge = ({ completed, className }: ProgressBadgeProps) => (
  <Badge
    variant={completed ? 'default' : 'outline'}
    className={cn('gap-1', className)}
  >
    {completed ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
    {completed ? 'Пройдено' : 'Не пройдено'}
  </Badge>
);

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
}

export const ProgressBar = ({ value, className }: ProgressBarProps) => (
  <div className={cn('h-2 bg-muted rounded-full overflow-hidden', className)}>
    <div
      className="h-full bg-primary rounded-full transition-all duration-500"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
