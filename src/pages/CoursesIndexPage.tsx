import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getCourseProgress } from '@/lib/progress';
import { 
  BarChart3, 
  FlaskConical, 
  Library, 
  ArrowRight, 
  GraduationCap,
  TrendingUp,
  Sigma,
  Grid3X3
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  topics: string[];
  status: 'available' | 'coming-soon';
  lessonsCount: number;
}

const courses: Course[] = [
  {
    id: 'descriptive',
    title: 'Описательная статистика',
    description: 'Меры центральной тенденции, разброса и формы распределения. Визуализация данных и интерпретация результатов в психологическом контексте.',
    icon: BarChart3,
    path: '/courses/descriptive',
    topics: ['Среднее, медиана, мода', 'Дисперсия и стандартное отклонение', 'Квартили и процентили', 'Визуализация данных'],
    status: 'available',
    lessonsCount: 8,
  },
  {
    id: 'probability',
    title: 'Теория вероятностей',
    description: 'Основные законы вероятности, распределения случайных величин и их применение в психологических исследованиях.',
    icon: Library,
    path: '/courses/probability',
    topics: ['Законы вероятности', 'Нормальное распределение', 'Биномиальное распределение', 'Z-оценки'],
    status: 'coming-soon',
    lessonsCount: 6,
  },
  {
    id: 'inference',
    title: 'Статистический вывод',
    description: 'От выборки к популяции: доверительные интервалы, проверка гипотез и оценка мощности исследования.',
    icon: FlaskConical,
    path: '/courses/inference',
    topics: ['Центральная предельная теорема', 'Доверительные интервалы', 'Проверка гипотез', 'Мощность теста'],
    status: 'coming-soon',
    lessonsCount: 8,
  },
  {
    id: 'ttests',
    title: 't-тесты',
    description: 'Сравнение средних значений: одновыборочный, независимый и парный t-тесты с примерами из клинической психологии.',
    icon: Sigma,
    path: '/courses/ttests',
    topics: ['Одновыборочный t-тест', 'Независимый t-тест', 'Парный t-тест', 'd Коэна'],
    status: 'coming-soon',
    lessonsCount: 5,
  },
  {
    id: 'correlation',
    title: 'Корреляция и регрессия',
    description: 'Анализ связей между переменными: от корреляции до множественной регрессии в психологических исследованиях.',
    icon: TrendingUp,
    path: '/courses/correlation',
    topics: ['Корреляция Пирсона', 'Корреляция Спирмена', 'Простая регрессия', 'Множественная регрессия'],
    status: 'coming-soon',
    lessonsCount: 6,
  },
  {
    id: 'categorical',
    title: 'Категориальные данные',
    description: 'Анализ номинальных и порядковых данных: таблицы сопряжённости, хи-квадрат и точный тест Фишера.',
    icon: Grid3X3,
    path: '/courses/categorical',
    topics: ['Таблицы сопряжённости', 'Тест χ²', 'Точный тест Фишера', 'Относительный риск'],
    status: 'coming-soon',
    lessonsCount: 4,
  },
];

const CoursesIndexPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" />
            <span>Структурированное обучение</span>
          </div>
          
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Курсы</span> статистики
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Последовательное изучение статистики от базовых концепций до продвинутых методов анализа. 
            Каждый курс включает теорию, интерактивные примеры и задания для самопроверки.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className={`group transition-all duration-300 hover:shadow-lg ${
                course.status === 'coming-soon' ? 'opacity-60' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <course.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {course.lessonsCount} тем
                    </Badge>
                  </div>
                </div>
                {course.status === 'available' && (() => {
                  const progress = getCourseProgress(course.id, course.lessonsCount);
                  return progress > 0 ? (
                    <div className="flex items-center gap-2 mb-1">
                      <Progress value={progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">{progress}%</span>
                    </div>
                  ) : null;
                })()}
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <CardDescription className="text-base">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.topics.map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
                
                {course.status === 'available' ? (
                  <Link to={course.path}>
                    <Button className="w-full gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Начать курс
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full gap-2">
                    Скоро
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CoursesIndexPage;
