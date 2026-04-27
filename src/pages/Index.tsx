import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  BarChart3, 
  FlaskConical, 
  GraduationCap,
  ArrowRight,
  Beaker,
  LineChart,
  TrendingUp,
  Sparkles,
  Lightbulb,
  PlayCircle,
  Library,
  Trophy,
  Layers,
  Shuffle,
  GitBranch,
  Download,
  FileSpreadsheet,
  Archive,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTotalProgress } from '@/lib/progress';

interface LabPreview {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  path: string;
  color: string;
}

const featuredLabs: LabPreview[] = [
  {
    icon: LineChart,
    title: 'Центральная предельная теорема',
    description: 'Наблюдайте сходимость к нормальному распределению в реальном времени',
    path: '/labs/clt',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: BarChart3,
    title: 'Выборочные статистики',
    description: 'Генерируйте выборки и изучайте поведение статистик',
    path: '/labs/sampling',
    color: 'bg-info/10 text-info',
  },
  {
    icon: Beaker,
    title: 'Доверительные интервалы',
    description: 'Визуализация покрытия и интерпретация ДИ',
    path: '/labs/confidence',
    color: 'bg-success/10 text-success',
  },
  {
    icon: FlaskConical,
    title: 'Проверка гипотез',
    description: 'P-value, мощность теста и размер эффекта',
    path: '/labs/hypothesis',
    color: 'bg-warning/10 text-warning',
  },
];

const features = [
  {
    icon: PlayCircle,
    title: 'Интерактивные эксперименты',
    description: 'Каждая концепция сопровождается симуляцией, которую вы контролируете',
  },
  {
    icon: Lightbulb,
    title: 'Интуиция важнее формул',
    description: 'Сначала понимание через визуализацию, затем формализация',
  },
  {
    icon: Library,
    title: 'Структурированные курсы',
    description: 'От базовых концепций к продвинутым методам анализа',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const Index = () => {
  const progress = getTotalProgress();
  const hasProgress = progress.labs > 0 || progress.quizzes > 0 || progress.topics > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero — Bento Grid */}
      <BentoHero />

      {/* Download Section */}
      <section className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="space-y-4">
            {[
              { title: 'Задание 1.1. Описательные статистики', file: '/files/task-1-1-descriptive-statistics.xlsx', download: 'ЗАДАНИЕ-1.1._ОПИСАТЕЛЬНЫЕ_СТАТИСТИКИ.xlsx' },
              { title: 'Задание 1.2. Корреляционный анализ', file: '/files/task-1-2-correlation-analysis.xlsx', download: 'ПЗ_3-4_ЗАДАНИЕ-1.2_КОРРЕЛЯЦИОННЫЙ_АНАЛИЗ.xlsx' },
              { title: 'Задание 1.3. Анализ различий', file: '/files/task-1-3-difference-analysis.xlsx', download: 'Задание_1.3._Анализ_различий_PersonalityTraits.xlsx' },
              { title: 'Задание 1.4. Анализ различий и корреляции', file: '/files/task-1-4-correlations-and-differences.xlsx', download: 'Data_1.4_Korrelations_and_differences.xlsx', extra: { file: '/files/task-1-4-analysis.ipynb', download: 'Analysis_1.4_Korrelations_and_differences.ipynb', label: 'Расчёты' } },
              { title: 'Задание 1.5. Депрессия у студентов', file: '/files/task-1-5-depression-dataset.xlsx', download: 'Student_Depression_Dataset_Excel.xlsx', extras: [
                { file: '/files/task-1-5-depression-dataset.csv', download: 'Student_Depression_Dataset.csv', label: 'CSV' },
                { file: '/files/task-1-5-models.ipynb', download: 'simple-data-cleaning-and-comparing-9-models.ipynb', label: 'Модели' },
              ] },
              { title: 'Задание 1.6. Анализ предпочтения музыкальных жанров', file: '/files/task-1-6-music-genres.xlsx', download: 'Задание_1.6._Анализ_предпочтения_музыкальных_жанров.xlsx' },
            ].map((task) => (
              <Card key={task.file} className="border-dashed border-2 border-primary/30 bg-primary/5">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-heading font-semibold text-lg">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">Практическое задание в формате Excel (.xlsx)</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a href={task.file} download={task.download}>
                      <Button className="gap-2">
                        <Download className="w-4 h-4" />
                        Скачать
                      </Button>
                    </a>
                    {'extra' in task && task.extra && (
                      <a href={task.extra.file} download={task.extra.download}>
                        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                          <Download className="w-4 h-4" />
                          {task.extra.label}
                        </Button>
                      </a>
                    )}
                    {'extras' in task && task.extras && task.extras.map((ex) => (
                      <a key={ex.file} href={ex.file} download={ex.download}>
                        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                          <Download className="w-4 h-4" />
                          {ex.label}
                        </Button>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Контрольная работа */}
            <Card className="border-dashed border-2 border-accent/30 bg-accent/5">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Archive className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-heading font-semibold text-lg">Контрольная работа</h3>
                  <p className="text-sm text-muted-foreground">10 кейсов в формате CSV (архив .zip)</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a href="/files/kontrolnaya_rabota.zip" download="Контрольная_работа.zip">
                    <Button className="gap-2">
                      <Download className="w-4 h-4" />
                      Скачать все (ZIP)
                    </Button>
                  </a>
                  <a href="/files/kontrolnaya-instructions.pdf" download="Инструкции.pdf">
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Download className="w-4 h-4" />
                      Инструкции
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Progress + Quick Links */}
      <section className="container py-16">
        {hasProgress && (
          <motion.div
            className="mb-8 p-6 rounded-xl border bg-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-heading font-semibold text-lg">Ваш прогресс</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: progress.labs, label: 'Лабораторий' },
                { value: progress.quizzes, label: 'Квизов' },
                { value: progress.topics, label: 'Тем курсов' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  className="text-center p-3 rounded-lg bg-muted/50"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                >
                  <div className="text-2xl font-bold text-primary">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          className="grid md:grid-cols-2 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <Card className="group hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Курсы</CardTitle>
                    <CardDescription>Структурированное обучение</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Последовательное изучение статистики: от описательных методов 
                  до продвинутого анализа данных.
                </p>
                <Link to="/courses/descriptive">
                  <Button variant="outline" className="gap-2">
                    Начать курс
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <Card className="group hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <CardTitle>Справочник</CardTitle>
                    <CardDescription>Теория и формулы</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Краткий справочник по основным концепциям, формулам 
                  и интерпретации результатов.
                </p>
                <Link to="/theory">
                  <Button variant="outline" className="gap-2">
                    Открыть справочник
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 Математическая статистика для психологов — Интерактивная образовательная платформа</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
