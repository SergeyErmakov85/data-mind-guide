import { Header } from '@/components/Header';
import { ConfidenceIntervalsLab } from '@/components/labs/ConfidenceIntervalsLab';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ConfidenceLabPage = () => {
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
            Доверительные интервалы
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Визуализируйте концепцию доверительных интервалов через повторную выборку. 
            Наблюдайте, какая доля интервалов действительно содержит истинное значение 
            параметра, и как это связано с уровнем доверия.
          </p>
        </div>

        {/* Lab Component */}
        <ConfidenceIntervalsLab />
      </main>
    </div>
  );
};

export default ConfidenceLabPage;
