import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import {
  BarChart3,
  FlaskConical,
  Library,
  TrendingUp,
  Sigma,
  Grid3X3,
} from 'lucide-react';
import {
  BentoTile,
  DifficultyFilter,
  sortByDifficulty,
  tileGridMotion,
  type Difficulty,
} from '@/components/BentoTile';

interface Course {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  topics: string[];
  status: 'available' | 'coming-soon';
  lessonsCount: number;
  difficulty: Difficulty;
  indexLabel: string;
}

const courses: Course[] = [
  { id: 'descriptive', title: 'Описательная статистика', description: 'Меры центральной тенденции, разброса и формы распределения. Визуализация данных и интерпретация результатов в психологическом контексте.', icon: BarChart3, path: '/courses/descriptive', topics: ['Среднее, медиана, мода', 'Дисперсия и стандартное отклонение', 'Квартили и процентили', 'Визуализация данных'], status: 'available', lessonsCount: 8, difficulty: 'beginner', indexLabel: 'DESCRIPTIVE' },
  { id: 'probability', title: 'Теория вероятностей', description: 'Основные законы вероятности, распределения случайных величин и их применение в психологических исследованиях.', icon: Library, path: '/courses/probability', topics: ['Законы вероятности', 'Нормальное распределение', 'Биномиальное распределение', 'Z-оценки'], status: 'coming-soon', lessonsCount: 6, difficulty: 'beginner', indexLabel: 'PROBABILITY' },
  { id: 'inference', title: 'Статистический вывод', description: 'От выборки к популяции: доверительные интервалы, проверка гипотез и оценка мощности исследования.', icon: FlaskConical, path: '/courses/inference', topics: ['Центральная предельная теорема', 'Доверительные интервалы', 'Проверка гипотез', 'Мощность теста'], status: 'coming-soon', lessonsCount: 8, difficulty: 'intermediate', indexLabel: 'INFERENCE' },
  { id: 'ttests', title: 't-тесты', description: 'Сравнение средних значений: одновыборочный, независимый и парный t-тесты с примерами из клинической психологии.', icon: Sigma, path: '/courses/ttests', topics: ['Одновыборочный t-тест', 'Независимый t-тест', 'Парный t-тест', 'd Коэна'], status: 'coming-soon', lessonsCount: 5, difficulty: 'intermediate', indexLabel: 'T-TESTS' },
  { id: 'correlation', title: 'Корреляция и регрессия', description: 'Анализ связей между переменными: от корреляции до множественной регрессии в психологических исследованиях.', icon: TrendingUp, path: '/courses/correlation', topics: ['Корреляция Пирсона', 'Корреляция Спирмена', 'Простая регрессия', 'Множественная регрессия'], status: 'coming-soon', lessonsCount: 6, difficulty: 'advanced', indexLabel: 'KORRELATION' },
  { id: 'categorical', title: 'Категориальные данные', description: 'Анализ номинальных и порядковых данных: таблицы сопряжённости, хи-квадрат и точный тест Фишера.', icon: Grid3X3, path: '/courses/categorical', topics: ['Таблицы сопряжённости', 'Тест χ²', 'Точный тест Фишера', 'Относительный риск'], status: 'coming-soon', lessonsCount: 4, difficulty: 'advanced', indexLabel: 'CATEGORICAL' },
];

const CoursesIndexPage = () => {
  const [filter, setFilter] = useState<Difficulty | 'all'>('all');

  const sorted = useMemo(() => sortByDifficulty(courses), []);
  const visible = useMemo(
    () => (filter === 'all' ? sorted : sorted.filter((c) => c.difficulty === filter)),
    [sorted, filter],
  );

  const counts = {
    all: courses.length,
    beginner: courses.filter((c) => c.difficulty === 'beginner').length,
    intermediate: courses.filter((c) => c.difficulty === 'intermediate').length,
    advanced: courses.filter((c) => c.difficulty === 'advanced').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
            # Courses · Структурированное обучение
          </p>
          <h1 className="font-heading uppercase tracking-tight font-bold text-4xl md:text-6xl leading-[0.95]">
            Курсы
            <br />
            <span className="text-primary">статистики</span>
          </h1>
          <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl mt-4">
            Последовательное изучение статистики от базовых концепций до продвинутых методов
            анализа. Каждый курс включает теорию, интерактивные примеры и задания для самопроверки.
          </p>
        </div>

        <DifficultyFilter value={filter} onChange={setFilter} counts={counts} />

        <motion.div
          key={filter}
          className="grid grid-cols-1 md:grid-cols-12 auto-rows-fr gap-5"
          initial="hidden"
          animate="visible"
          variants={tileGridMotion}
        >
          {visible.map((course, i) => (
            <BentoTile
              key={course.id}
              index={i}
              to={course.status === 'available' ? course.path : undefined}
              disabled={course.status === 'coming-soon'}
              difficulty={course.difficulty}
              badges={[`${course.lessonsCount} тем`, course.topics[0]]}
              title={course.title}
              description={course.description}
              indexLabel={course.indexLabel}
              icon={course.icon}
            />
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default CoursesIndexPage;
