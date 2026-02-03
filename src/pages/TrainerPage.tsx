import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Lightbulb, Trophy } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  scenario: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
  category: 'interpretation' | 'effect' | 'errors' | 'reporting';
}

const questions: Question[] = [
  {
    id: 1,
    category: 'interpretation',
    question: 'Как интерпретировать этот результат?',
    scenario: 'Получен результат: t(58) = 2.45, p = 0.017. Средние: группа А = 52.3, группа Б = 47.1.',
    options: [
      { id: 'a', text: 'Различия случайны, группы не отличаются' },
      { id: 'b', text: 'Различия статистически значимы, группа А имеет более высокие показатели' },
      { id: 'c', text: 'Нужно увеличить выборку для выводов' },
      { id: 'd', text: 'p-value слишком высокий для выводов' },
    ],
    correct: 'b',
    explanation: 'p = 0.017 < 0.05, что означает статистическую значимость различий. Среднее группы А (52.3) выше, чем группы Б (47.1). Мы можем отвергнуть нулевую гипотезу о равенстве средних.',
  },
  {
    id: 2,
    category: 'effect',
    question: 'Оцените практическую значимость результата',
    scenario: 'Исследование показало значимый эффект терапии: t(200) = 2.05, p = 0.042, d = 0.15.',
    options: [
      { id: 'a', text: 'Эффект большой и практически значимый' },
      { id: 'b', text: 'Эффект средний, терапия умеренно эффективна' },
      { id: 'c', text: 'Эффект статистически значим, но практически мал' },
      { id: 'd', text: 'Результат незначим, терапия не работает' },
    ],
    correct: 'c',
    explanation: 'd = 0.15 — это очень маленький размер эффекта (малый эффект считается от d = 0.2). Несмотря на статистическую значимость (p < 0.05), практическое различие минимально. Большая выборка (n = 200) позволила обнаружить даже такой маленький эффект.',
  },
  {
    id: 3,
    category: 'errors',
    question: 'Какой тип ошибки был совершён?',
    scenario: 'Исследователь заключил, что новый метод терапии неэффективен (p = 0.12). Позже метаанализ 50 исследований показал, что метод действительно работает с d = 0.45.',
    options: [
      { id: 'a', text: 'Ошибка I рода (ложноположительный результат)' },
      { id: 'b', text: 'Ошибка II рода (ложноотрицательный результат)' },
      { id: 'c', text: 'Ошибка выборки' },
      { id: 'd', text: 'Ошибки не было' },
    ],
    correct: 'b',
    explanation: 'Исследователь пропустил реальный эффект — это ошибка II рода. Вероятно, выборка была слишком мала для обнаружения эффекта среднего размера. Метаанализ с большим N смог его выявить.',
  },
  {
    id: 4,
    category: 'interpretation',
    question: 'Какой вывод корректен?',
    scenario: 'Корреляция между временем в соцсетях и депрессией: r = 0.35, p < 0.001, n = 500.',
    options: [
      { id: 'a', text: 'Соцсети вызывают депрессию' },
      { id: 'b', text: 'Депрессия заставляет людей больше сидеть в соцсетях' },
      { id: 'c', text: 'Существует умеренная связь, но причинность не установлена' },
      { id: 'd', text: 'Связь слишком слабая для выводов' },
    ],
    correct: 'c',
    explanation: 'Корреляция не доказывает причинность. r = 0.35 — это умеренная связь. Мы не можем утверждать, что A вызывает B. Возможно, есть третья переменная (например, одиночество), влияющая на обе.',
  },
  {
    id: 5,
    category: 'reporting',
    question: 'Что не так с описанием результатов?',
    scenario: 'В статье написано: «Мы обнаружили высокозначимые различия между группами (p = 0.00001), что доказывает эффективность терапии.»',
    options: [
      { id: 'a', text: 'Всё корректно' },
      { id: 'b', text: 'Не указан размер эффекта' },
      { id: 'c', text: 'p-value округлён неправильно' },
      { id: 'd', text: 'Оба варианта B и C' },
    ],
    correct: 'd',
    explanation: 'Две ошибки: 1) Не указан размер эффекта — без него неизвестна практическая значимость. 2) Согласно APA, p-value записывается как p < .001, а не точным числом вроде 0.00001. Также слово «доказывает» слишком категорично.',
  },
  {
    id: 6,
    category: 'effect',
    question: 'Какой результат более значим практически?',
    scenario: 'Исследование A: t = 4.5, p < 0.001, d = 0.3, n = 400. Исследование B: t = 2.1, p = 0.045, d = 0.7, n = 40.',
    options: [
      { id: 'a', text: 'Исследование A (меньший p-value)' },
      { id: 'b', text: 'Исследование B (больший размер эффекта)' },
      { id: 'c', text: 'Оба равнозначны' },
      { id: 'd', text: 'Невозможно сравнить' },
    ],
    correct: 'b',
    explanation: 'Практическая значимость определяется размером эффекта, а не p-value. d = 0.7 (исследование B) — это большой эффект, d = 0.3 (исследование A) — малый. Маленький p в исследовании A — результат большой выборки, а не сильного эффекта.',
  },
  {
    id: 7,
    category: 'errors',
    question: 'Как называется эта проблема?',
    scenario: 'Исследователь провёл 20 t-тестов для разных переменных при α = 0.05. Один тест дал p = 0.03, и исследователь опубликовал только этот результат как «значимый».',
    options: [
      { id: 'a', text: 'Низкая статистическая мощность' },
      { id: 'b', text: 'Проблема множественных сравнений' },
      { id: 'c', text: 'Ошибка II рода' },
      { id: 'd', text: 'Эффект публикационного смещения' },
    ],
    correct: 'b',
    explanation: 'При 20 тестах с α = 0.05 ожидается примерно 1 ложноположительный результат (0.05 × 20 = 1). Это проблема множественных сравнений. Нужна поправка Бонферрони или другие методы коррекции: α/20 = 0.0025.',
  },
  {
    id: 8,
    category: 'interpretation',
    question: 'Что означает доверительный интервал?',
    scenario: '95% ДИ для разницы средних: [-2.5; 8.3]',
    options: [
      { id: 'a', text: 'Различие значимо, так как интервал широкий' },
      { id: 'b', text: 'Различие незначимо, так как интервал включает 0' },
      { id: 'c', text: '95% данных находятся в этом интервале' },
      { id: 'd', text: 'Среднее находится между -2.5 и 8.3' },
    ],
    correct: 'b',
    explanation: 'Если 95% ДИ для разницы включает 0, различие статистически незначимо при α = 0.05. Это эквивалентно p > 0.05. Интервал показывает диапазон правдоподобных значений истинной разницы.',
  },
];

const categoryLabels = {
  interpretation: 'Интерпретация результатов',
  effect: 'Размер эффекта',
  errors: 'Статистические ошибки',
  reporting: 'Описание результатов',
};

const TrainerPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [categoryScores, setCategoryScores] = useState<Record<string, { correct: number; total: number }>>({});

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + (showExplanation ? 1 : 0)) / questions.length) * 100;

  const handleAnswer = (optionId: string) => {
    if (showExplanation) return;
    setSelectedAnswer(optionId);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;
    setShowExplanation(true);
    
    const isCorrect = selectedAnswer === currentQuestion.correct;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setCategoryScores(prev => {
      const category = currentQuestion.category;
      const current = prev[category] || { correct: 0, total: 0 };
      return {
        ...prev,
        [category]: {
          correct: current.correct + (isCorrect ? 1 : 0),
          total: current.total + 1,
        },
      };
    });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setCompleted(false);
    setCategoryScores({});
  };

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Тренировка завершена!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-5xl font-bold text-primary">{percentage}%</div>
                <p className="text-lg text-muted-foreground">
                  Правильных ответов: {score} из {questions.length}
                </p>
                
                {/* Category breakdown */}
                <div className="text-left space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Результаты по категориям</h4>
                  {Object.entries(categoryScores).map(([category, scores]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm">{categoryLabels[category as keyof typeof categoryLabels]}</span>
                      <span className="font-medium">
                        {scores.correct}/{scores.total}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-muted/30 rounded-lg">
                  {percentage >= 80 ? (
                    <p>Отлично! Вы хорошо понимаете интерпретацию статистических результатов.</p>
                  ) : percentage >= 60 ? (
                    <p>Хороший результат! Обратите внимание на категории с низкими баллами.</p>
                  ) : (
                    <p>Рекомендуем изучить теоретические материалы и попробовать снова.</p>
                  )}
                </div>

                <Button onClick={restart} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Пройти заново
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-heading text-2xl md:text-3xl font-bold">
                Тренажёр интерпретации
              </h1>
              <span className="text-sm text-muted-foreground">
                Вопрос {currentIndex + 1} из {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                  {categoryLabels[currentQuestion.category]}
                </span>
              </div>
              <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
              <CardDescription className="text-base mt-2 p-4 bg-muted/30 rounded-lg font-mono text-sm">
                {currentQuestion.scenario}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswer === option.id;
                  const isCorrect = option.id === currentQuestion.correct;
                  
                  let className = "w-full p-4 text-left rounded-lg border-2 transition-all ";
                  
                  if (showExplanation) {
                    if (isCorrect) {
                      className += "border-success bg-success/10";
                    } else if (isSelected && !isCorrect) {
                      className += "border-destructive bg-destructive/10";
                    } else {
                      className += "border-border opacity-50";
                    }
                  } else {
                    className += isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50 hover:bg-muted/30";
                  }
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                      className={className}
                      disabled={showExplanation}
                    >
                      <div className="flex items-center gap-3">
                        {showExplanation && (
                          isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                          ) : isSelected ? (
                            <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                          ) : null
                        )}
                        <span>{option.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg animate-fade-in">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2">Объяснение</h4>
                      <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                {!showExplanation ? (
                  <Button 
                    onClick={checkAnswer} 
                    disabled={!selectedAnswer}
                    className="gap-2"
                  >
                    Проверить
                  </Button>
                ) : (
                  <Button onClick={nextQuestion} className="gap-2">
                    {currentIndex < questions.length - 1 ? (
                      <>
                        Следующий вопрос
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      'Завершить'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TrainerPage;
