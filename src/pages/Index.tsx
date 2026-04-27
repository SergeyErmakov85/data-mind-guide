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
import BentoHero from '@/components/BentoHero';
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

      <div id="main-content">
      {/* Hero — Bento Grid */}
      <BentoHero />

      {/* Probability Theory Section */}
      <section className="container py-6">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-4">Новый раздел</Badge>
          <h2 className="font-heading text-3xl font-bold mb-4">Теория вероятностей</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Фундамент статистики: случайные события, комбинаторика, формула полной вероятности и схема Бернулли
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: Layers, title: 'Случайные события', desc: 'Операции, диаграммы Венна, условная вероятность' },
                  { icon: Shuffle, title: 'Комбинаторика', desc: 'Перестановки, размещения, сочетания' },
                  { icon: GitBranch, title: 'Полная вероятность', desc: 'Формула Байеса и гипотезы' },
                  { icon: FlaskConical, title: 'Схема Бернулли', desc: 'Биномиальное распределение' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link to="/probability">
                  <Button size="lg" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Открыть раздел
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Featured Labs */}
      <section className="container py-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-4">Лаборатории</Badge>
          <h2 className="font-heading text-3xl font-bold mb-4">Интерактивные эксперименты</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Каждая лаборатория — это симуляция статистического явления с полным контролем параметров
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {featuredLabs.map((lab) => (
            <motion.div key={lab.path} variants={fadeUp} transition={{ duration: 0.4 }}>
              <Link
                to={lab.path}
                className="module-card group block h-full"
              >
                <div className={`w-12 h-12 rounded-lg ${lab.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <lab.icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {lab.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {lab.description}
                </p>
                <div className="flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Запустить</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Link to="/labs">
            <Button variant="outline" size="lg" className="gap-2">
              Все лаборатории
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-3xl font-bold mb-4">Почему это работает</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Наш подход основан на принципах активного обучения и визуализации
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeUp} transition={{ duration: 0.4 }}>
                <Card className="text-center border-0 bg-transparent shadow-none">
                  <CardHeader>
                    <motion.div
                      className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <feature.icon className="w-8 h-8 text-primary" />
                    </motion.div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

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
