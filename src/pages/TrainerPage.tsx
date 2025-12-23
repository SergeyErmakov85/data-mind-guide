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
}

const questions: Question[] = [
  {
    id: 1,
    question: 'Какой критерий выбрать?',
    scenario: 'Исследователь хочет сравнить уровень тревожности у двух независимых групп: студентов очного и заочного обучения. Данные распределены нормально. Выборки: 30 и 35 человек.',
    options: [
      { id: 'a', text: 't-тест для независимых выборок' },
      { id: 'b', text: 't-тест для связанных выборок' },
      { id: 'c', text: 'U-критерий Манна–Уитни' },
      { id: 'd', text: 'Однофакторный ANOVA' },
    ],
    correct: 'a',
    explanation: 'Правильный ответ: t-тест для независимых выборок. У нас две независимые группы, данные нормально распределены, и мы сравниваем средние. ANOVA подходит для 3+ групп, связанный t-тест — для парных измерений.',
  },
  {
    id: 2,
    question: 'Как интерпретировать результат?',
    scenario: 'После проведения t-теста получен результат: t(58) = 2.45, p = 0.017. Средние: группа А = 52.3, группа Б = 47.1.',
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
    id: 3,
    question: 'Какой критерий использовать?',
    scenario: 'Психолог измерил уровень стресса у 25 участников ДО и ПОСЛЕ тренинга по релаксации. Распределение разностей отличается от нормального.',
    options: [
      { id: 'a', text: 't-тест для независимых выборок' },
      { id: 'b', text: 't-тест для связанных выборок' },
      { id: 'c', text: 'Критерий знаковых рангов Уилкоксона' },
      { id: 'd', text: 'U-критерий Манна–Уитни' },
    ],
    correct: 'c',
    explanation: 'Критерий Уилкоксона — непараметрическая альтернатива парному t-тесту. Он подходит для связанных измерений (до/после), когда не выполняется условие нормальности разностей.',
  },
  {
    id: 4,
    question: 'Оцените силу связи',
    scenario: 'Корреляция Пирсона между тревожностью и успеваемостью: r = -0.72, p < 0.001, n = 150.',
    options: [
      { id: 'a', text: 'Слабая отрицательная связь' },
      { id: 'b', text: 'Умеренная положительная связь' },
      { id: 'c', text: 'Сильная отрицательная связь' },
      { id: 'd', text: 'Связь отсутствует' },
    ],
    correct: 'c',
    explanation: 'r = -0.72 указывает на сильную (|r| > 0.7) отрицательную связь: чем выше тревожность, тем ниже успеваемость. p < 0.001 подтверждает статистическую значимость.',
  },
  {
    id: 5,
    question: 'Какой анализ провести?',
    scenario: 'Исследователь хочет узнать, связан ли тип личности (интроверт/экстраверт) с предпочтением формата работы (офис/удалёнка/гибрид).',
    options: [
      { id: 'a', text: 't-тест' },
      { id: 'b', text: 'Корреляция Пирсона' },
      { id: 'c', text: 'Критерий χ² (хи-квадрат)' },
      { id: 'd', text: 'ANOVA' },
    ],
    correct: 'c',
    explanation: 'Обе переменные категориальные: тип личности (2 категории) и формат работы (3 категории). Для анализа связи между категориальными переменными используется χ²-тест.',
  },
];

const TrainerPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + (showExplanation ? 1 : 0)) / questions.length) * 100;

  const handleAnswer = (optionId: string) => {
    if (showExplanation) return;
    setSelectedAnswer(optionId);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;
    setShowExplanation(true);
    if (selectedAnswer === currentQuestion.correct) {
      setScore(prev => prev + 1);
    }
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
                
                <div className="p-4 bg-muted/30 rounded-lg">
                  {percentage >= 80 ? (
                    <p>Отлично! Вы хорошо разбираетесь в статистических методах.</p>
                  ) : percentage >= 60 ? (
                    <p>Хороший результат! Рекомендуем повторить темы, где были ошибки.</p>
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
                Тренажёр
              </h1>
              <span className="text-sm text-muted-foreground">
                Вопрос {currentIndex + 1} из {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
              <CardDescription className="text-base mt-2 p-4 bg-muted/30 rounded-lg">
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
