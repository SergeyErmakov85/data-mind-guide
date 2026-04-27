import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MathFormula } from '@/components/MathFormula';

interface ConceptBlockProps {
  kicker: string;
  title: string;
  body: ReactNode;
  formula?: string;
  example?: ReactNode;
}

export const ConceptBlock = ({ kicker, title, body, formula, example }: ConceptBlockProps) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.4 }}
    className="border-3 border-foreground rounded-none bg-card p-6 md:p-8 space-y-4"
  >
    <div className="kicker">{kicker}</div>
    <h3 className="text-xl md:text-2xl font-bold uppercase">{title}</h3>
    <div className="rule" />
    <div className="lead text-base md:text-lg">{body}</div>

    {formula && (
      <div className="formula-box bg-muted">
        <MathFormula formula={formula} display />
      </div>
    )}

    {example && (
      <div className="example-box">
        <div className="kicker mb-2">Пример</div>
        <div className="text-sm md:text-base">{example}</div>
      </div>
    )}
  </motion.section>
);
