import { Header } from '@/components/Header';
import BinomialLab from '@/components/labs/BinomialLab';

const BinomialLabPage = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container py-8">
      <div className="max-w-5xl mx-auto">
        <BinomialLab />
      </div>
    </main>
  </div>
);

export default BinomialLabPage;
