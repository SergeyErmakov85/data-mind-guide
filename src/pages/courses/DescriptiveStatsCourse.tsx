import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MathFormula } from '@/components/MathFormula';
import { Quiz } from '@/components/Quiz';
import { markTopicCompleted, getProgress } from '@/lib/progress';

const topics = [
  {
    id: 'central-tendency',
    title: 'Меры центральной тенденции',
    content: (
      <div className="space-y-4 text-sm leading-relaxed">
        <p>Меры центральной тенденции описывают «типичное» значение в наборе данных.</p>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h4 className="font-medium text-primary">Среднее (M)</h4>
              <MathFormula formula="M = \frac{\sum x_i}{n}" />
              <p className="text-muted-foreground text-xs">Чувствительно к выбросам. Используется для интервальных данных с симметричным распределением.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h4 className="font-medium text-primary">Медиана (Me)</h4>
              <p className="text-xs text-muted-foreground">Значение, делящее упорядоченный ряд пополам. Устойчива к выбросам — предпочтительна для скошенных распределений.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h4 className="font-medium text-primary">Мода (Mo)</h4>
              <p className="text-xs text-muted-foreground">Наиболее частое значение. Единственная мера для номинальных данных. Может быть несколько мод.</p>
            </CardContent>
          </Card>
        </div>
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h5 className="font-medium mb-1">🧠 Пример из психологии</h5>
          <p className="text-muted-foreground text-xs">Результаты теста тревожности: 12, 15, 14, 13, 45. Среднее = 19.8 (искажено выбросом 45), медиана = 14 (точнее отражает типичный результат).</p>
        </div>
      </div>
    ),
  },
  {
    id: 'variability',
    title: 'Меры разброса',
    content: (
      <div className="space-y-4 text-sm leading-relaxed">
        <p>Показывают, насколько данные отклоняются от «типичного» значения.</p>
        <div className="space-y-3">
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Дисперсия и стандартное отклонение</h4>
              <MathFormula formula="S^2 = \frac{\sum(x_i - M)^2}{n - 1}, \quad SD = \sqrt{S^2}" />
              <p className="text-muted-foreground text-xs mt-2">SD в тех же единицах, что и данные. Делим на n−1 (поправка Бесселя) для несмещённой оценки.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Интерквартильный размах (IQR)</h4>
              <MathFormula formula="IQR = Q_3 - Q_1" />
              <p className="text-muted-foreground text-xs mt-2">Охватывает центральные 50% данных. Устойчив к выбросам. Выброс: значение за пределами Q₁ − 1.5·IQR или Q₃ + 1.5·IQR.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Стандартная ошибка среднего (SE)</h4>
              <MathFormula formula="SE = \frac{SD}{\sqrt{n}}" />
              <p className="text-muted-foreground text-xs mt-2">Показывает точность оценки среднего. Уменьшается с ростом n.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: 'shape',
    title: 'Форма распределения',
    content: (
      <div className="space-y-4 text-sm leading-relaxed">
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Асимметрия (Skewness)</h4>
              <p className="text-muted-foreground text-xs">Положительная — хвост вправо (зарплаты). Отрицательная — хвост влево (результаты лёгкого теста). |Sk| &lt; 0.5 — примерно симметрично.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Эксцесс (Kurtosis)</h4>
              <p className="text-muted-foreground text-xs">Excess kurtosis = 0 для нормального. Положительный — острый пик, тяжёлые хвосты. Отрицательный — плоский.</p>
            </CardContent>
          </Card>
        </div>
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h5 className="font-medium mb-1">📊 Как проверить нормальность?</h5>
          <ul className="text-muted-foreground text-xs list-disc pl-4 space-y-1">
            <li>Визуально: гистограмма + Q-Q plot</li>
            <li>Тест Шапиро-Уилка (n &lt; 50) или Колмогорова-Смирнова</li>
            <li>Проверить |skewness| &lt; 2 и |kurtosis| &lt; 7</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'visualization',
    title: 'Визуализация данных',
    content: (
      <div className="space-y-4 text-sm leading-relaxed">
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Гистограмма</h4>
              <p className="text-muted-foreground text-xs">Показывает форму распределения. Число столбцов ≈ √n. Позволяет увидеть бимодальность, асимметрию и выбросы.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Box plot (ящик с усами)</h4>
              <p className="text-muted-foreground text-xs">Показывает медиану, Q₁, Q₃, IQR и выбросы. Идеально для сравнения групп.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Q-Q plot</h4>
              <p className="text-muted-foreground text-xs">Квантиль-квантильный график. Точки на диагонали → данные нормальны. Отклонения → нарушение нормальности.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Scatter plot</h4>
              <p className="text-muted-foreground text-xs">Для двух количественных переменных. Выявляет линейные и нелинейные связи, кластеры и выбросы.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
];

const quizQuestions: import('@/components/Quiz').QuizQuestion[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'Данные: 2, 3, 3, 5, 100. Какая мера центра лучше?',
    options: ['Среднее', 'Медиана', 'Мода', 'Размах'],
    correctAnswer: 1,
    explanation: 'Медиана = 3 — устойчива к выбросу (100). Среднее = 22.6 — сильно искажено.',
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    question: 'Что показывает стандартная ошибка (SE)?',
    options: [
      'Разброс отдельных наблюдений',
      'Точность оценки среднего',
      'Размер эффекта',
      'Вероятность ошибки I рода',
    ],
    correctAnswer: 1,
    explanation: 'SE = SD/√n показывает, насколько точно выборочное среднее оценивает истинное среднее популяции.',
  },
  {
    id: 'q3',
    type: 'multiple-choice',
    question: 'При положительной асимметрии (skewness > 0):',
    options: [
      'Хвост влево, M < Me',
      'Хвост вправо, M > Me',
      'Распределение симметрично',
      'Хвост вправо, M < Me',
    ],
    correctAnswer: 1,
    explanation: 'Положительная асимметрия = длинный хвост вправо. Среднее «тянется» к хвосту и становится больше медианы.',
  },
  {
    id: 'q4',
    type: 'multiple-choice',
    question: 'Коэффициент вариации (CV) полезен для:',
    options: [
      'Проверки нормальности',
      'Сравнения разброса переменных с разными единицами',
      'Определения выбросов',
      'Расчёта p-value',
    ],
    correctAnswer: 1,
    explanation: 'CV = (SD/M)·100% — безразмерная мера, позволяет сравнивать вариабельность разных шкал.',
  },
];

const DescriptiveStatsCourse = () => {
  const [progress] = useState(() => getProgress());
  const completedTopics = progress.completedCourseTopics['descriptive'] || [];

  const handleTopicComplete = (topicId: string) => {
    markTopicCompleted('descriptive', topicId);
    // Force re-render by updating page
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        <div className="mb-6">
          <Link to="/courses">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Назад к курсам
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Описательная статистика</h1>
          <p className="text-muted-foreground text-lg">
            Меры центральной тенденции, разброса и формы распределения
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Badge variant="secondary">{completedTopics.length}/{topics.length} тем</Badge>
            <div className="flex-1 max-w-xs h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(completedTopics.length / topics.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue={topics[0].id} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            {topics.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="gap-2">
                {completedTopics.includes(t.id)
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  : <Circle className="w-3.5 h-3.5" />}
                {t.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {topics.map((t) => (
            <TabsContent key={t.id} value={t.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{t.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {t.content}
                  {!completedTopics.includes(t.id) && (
                    <Button
                      className="mt-6"
                      onClick={() => handleTopicComplete(t.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Отметить как изученное
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quiz */}
        <div className="mt-10">
          <h2 className="font-heading text-2xl font-bold mb-4">Проверьте себя</h2>
          <Quiz
            questions={quizQuestions}
            title="Квиз: Описательная статистика"
          />
        </div>

        {/* Link to calculator */}
        <Card className="mt-8">
          <CardContent className="py-6 flex items-center justify-between">
            <div>
              <h3 className="font-medium">Практика</h3>
              <p className="text-sm text-muted-foreground">Попробуйте калькулятор описательной статистики с вашими данными</p>
            </div>
            <Link to="/descriptive">
              <Button variant="outline">Открыть калькулятор</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DescriptiveStatsCourse;
