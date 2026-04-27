import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { MathFormula } from '@/components/MathFormula';
import {
  GlassDialog,
  GlassDialogContent,
  GlassDialogTitle,
  GlassDialogDescription,
  GlassDialogFooter,
} from '@/components/ui/glass-dialog';

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'calculation' | 'interpretation';
  question: string;
  formula?: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  /** For calculation: accepted tolerance */
  tolerance?: number;
}

interface QuizProps {
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

export const Quiz = ({ title, description, questions }: QuizProps) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[current];

  const checkAnswer = () => {
    let isCorrect = false;
    if (q.type === 'calculation') {
      const numAnswer = parseFloat(inputValue.replace(',', '.'));
      const expected = typeof q.correctAnswer === 'number' ? q.correctAnswer : parseFloat(String(q.correctAnswer));
      const tol = q.tolerance ?? 0.01;
      isCorrect = !isNaN(numAnswer) && Math.abs(numAnswer - expected) <= tol;
    } else {
      isCorrect = selected === String(q.correctAnswer);
    }
    setCorrect(isCorrect);
    if (isCorrect) setScore(s => s + 1);
    setAnswered(true);
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setInputValue('');
      setAnswered(false);
      setCorrect(false);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setInputValue('');
    setAnswered(false);
    setCorrect(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-4">
          <Trophy className={`w-16 h-16 mx-auto ${pct >= 70 ? 'text-success' : 'text-warning'}`} />
          <h3 className="font-heading text-2xl font-bold">{pct >= 70 ? 'Отлично!' : 'Можно лучше!'}</h3>
          <p className="text-muted-foreground text-lg">Результат: {score} из {questions.length} ({pct}%)</p>
          <Button onClick={restart} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" /> Пройти ещё раз
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant="secondary">{current + 1} / {questions.length}</Badge>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium">{q.question}</p>
        {q.formula && <MathFormula formula={q.formula} display />}

        {/* Multiple choice / interpretation */}
        {(q.type === 'multiple-choice' || q.type === 'interpretation') && q.options && (
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const letter = String(i);
              const isSelected = selected === letter;
              const isCorrectOpt = answered && letter === String(q.correctAnswer);
              const isWrong = answered && isSelected && !correct;
              return (
                <button
                  key={i}
                  onClick={() => !answered && setSelected(letter)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors text-sm ${
                    isCorrectOpt ? 'border-success bg-success/10' :
                    isWrong ? 'border-destructive bg-destructive/10' :
                    isSelected ? 'border-primary bg-primary/5' :
                    'border-border hover:border-primary/30'
                  }`}
                  disabled={answered}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Calculation */}
        {q.type === 'calculation' && (
          <Input
            type="text"
            placeholder="Введите ответ..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            disabled={answered}
          />
        )}

        {/* Feedback */}
        {answered && (
          <div className={`flex items-start gap-3 p-3 rounded-lg ${correct ? 'bg-success/10' : 'bg-destructive/10'}`}>
            {correct ? <CheckCircle2 className="w-5 h-5 text-success mt-0.5" /> : <XCircle className="w-5 h-5 text-destructive mt-0.5" />}
            <div>
              <p className="font-medium text-sm">{correct ? 'Правильно!' : 'Неправильно'}</p>
              <p className="text-sm text-muted-foreground mt-1">{q.explanation}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {!answered ? (
            <Button onClick={checkAnswer} disabled={q.type === 'calculation' ? !inputValue : !selected}>
              Проверить
            </Button>
          ) : (
            <Button onClick={next} className="gap-2">
              {current + 1 < questions.length ? <>Далее <ArrowRight className="w-4 h-4" /></> : 'Результат'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
