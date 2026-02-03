import { Header } from '@/components/Header';
import { HypothesisTestingLab } from '@/components/labs/HypothesisTestingLab';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HypothesisLabPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
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
            Проверка гипотез
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Исследуйте концепции p-value, статистической значимости и мощности теста. 
            Наблюдайте, как размер эффекта и размер выборки влияют на вероятность 
            обнаружения истинного эффекта.
          </p>
        </div>

        {/* Lab Component */}
        <HypothesisTestingLab />
      </main>
    </div>
  );
};

export default HypothesisLabPage;
