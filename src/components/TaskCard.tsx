import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, RotateCcw } from 'lucide-react';
import { addProgress, hasProgress } from '@/lib/progress';

interface TaskCardProps {
  taskId: string;
  courseId?: string;
  index: number;
  question: ReactNode;
  hint?: ReactNode;
  /** Either a numeric answer (with tolerance) or a discrete string match */
  answer: number | string;
  tolerance?: number;
  /** Display label for input field */
  inputLabel?: string;
  /** Suffix shown after the input (e.g., "балла") */
  suffix?: string;
  explanation?: ReactNode;
}

export const TaskCard = ({
  taskId,
  courseId = 'descriptive',
  index,
  question,
  hint,
  answer,
  tolerance = 0.05,
  inputLabel = 'Ваш ответ',
  suffix,
  explanation,
}: TaskCardProps) => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>(
    hasProgress(courseId, taskId) ? 'correct' : 'idle',
  );
  const [showExplanation, setShowExplanation] = useState(status === 'correct');

  const check = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    let ok = false;
    if (typeof answer === 'number') {
      const num = parseFloat(trimmed.replace(',', '.'));
      ok = !isNaN(num) && Math.abs(num - answer) <= tolerance;
    } else {
      ok = trimmed.toLowerCase() === answer.toLowerCase();
    }
    if (ok) {
      setStatus('correct');
      setShowExplanation(true);
      addProgress(courseId, taskId);
    } else {
      setStatus('wrong');
    }
  };

  const reset = () => {
    setValue('');
    setStatus('idle');
    setShowExplanation(false);
  };

  return (
    <div
      className={`border-3 rounded-none p-5 md:p-6 bg-card space-y-4 transition-colors ${
        status === 'correct'
          ? 'border-foreground bg-success/5'
          : status === 'wrong'
            ? 'border-destructive'
            : 'border-foreground'
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="kicker">{`// ${String(index).padStart(2, '0')} — задача`}</div>
        {status === 'correct' && (
          <span className="kicker text-success flex items-center gap-1">
            <Check className="w-3 h-3" /> решено
          </span>
        )}
      </div>

      <div className="text-sm md:text-base leading-relaxed">{question}</div>

      {hint && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-mono uppercase tracking-wider">
            подсказка
          </summary>
          <div className="mt-2 pl-2 border-l-2 border-foreground/30">{hint}</div>
        </details>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="kicker block mb-1">{inputLabel}</label>
          <div className="flex items-center gap-2">
            <Input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (status === 'wrong') setStatus('idle');
              }}
              onKeyDown={(e) => e.key === 'Enter' && check()}
              disabled={status === 'correct'}
              className="font-mono tabular-nums border-3 border-foreground rounded-none"
            />
            {suffix && (
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {suffix}
              </span>
            )}
          </div>
        </div>

        {status !== 'correct' ? (
          <Button onClick={check} className="btn-primary">
            Проверить
          </Button>
        ) : (
          <Button variant="outline" onClick={reset} className="rounded-none border-3 gap-2">
            <RotateCcw className="w-3 h-3" /> Заново
          </Button>
        )}
      </div>

      {status === 'wrong' && (
        <div className="flex items-center gap-2 text-destructive font-mono text-xs uppercase tracking-wider">
          <X className="w-4 h-4" /> Неверно — попробуйте ещё раз
        </div>
      )}

      {showExplanation && explanation && (
        <div className="border-l-3 border-foreground pl-4 text-sm text-foreground/80">
          <div className="kicker mb-1">Решение</div>
          {explanation}
        </div>
      )}
    </div>
  );
};
