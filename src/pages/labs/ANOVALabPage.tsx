import { Header } from '@/components/Header';
import { ANOVALab } from '@/components/labs/ANOVALab';

const ANOVALabPage = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Лаборатория: ANOVA (Дисперсионный анализ)
          </h1>
          <p className="text-muted-foreground text-lg">
            Сравнивайте средние нескольких групп, изучайте F-статистику и размер эффекта η²
          </p>
        </div>
        <ANOVALab />
      </div>
    </main>
  </div>
);

export default ANOVALabPage;
