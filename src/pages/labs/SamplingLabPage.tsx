import { Header } from '@/components/Header';
import { SamplingLab } from '@/components/labs/SamplingLab';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SamplingLabPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main id="main-content" className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/labs">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Все лаборатории
            </Button>
          </Link>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
            Выборочные статистики
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Генерируйте случайные выборки и исследуйте поведение основных статистик: 
            среднего, дисперсии, стандартной ошибки. Поймите, как размер выборки 
            влияет на точность оценок параметров популяции.
          </p>
        </div>

        {/* Lab Component */}
        <SamplingLab />
      </main>
    </div>
  );
};

export default SamplingLabPage;
