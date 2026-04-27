import { Header } from '@/components/Header';
import { CLTLab } from '@/components/labs/CLTLab';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CLTLabPage = () => {
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
            Центральная предельная теорема
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Наблюдайте, как распределение выборочных средних сходится к нормальному 
            независимо от формы исходного распределения. Это фундаментальный результат, 
            объясняющий, почему нормальное распределение так часто встречается в природе.
          </p>
        </div>

        {/* Lab Component */}
        <CLTLab />
      </main>
    </div>
  );
};

export default CLTLabPage;
