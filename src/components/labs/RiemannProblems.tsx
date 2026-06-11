import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MathFormula } from "@/components/MathFormula";

interface ProblemProps {
  number: number;
  title: string;
  intro: string;
  task: string;
  solutionContent: React.ReactNode;
  answer: string;
  explanation: string;
  graph?: React.ReactNode;
}

const Problem = ({ number, title, intro, task, solutionContent, answer, explanation, graph }: ProblemProps) => {
  const [showSolution, setShowSolution] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="p-5 bg-muted/50 rounded-xl border border-border space-y-4">
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
          {number}
        </span>
        <div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{intro}</p>
        </div>
      </div>

      <div className="p-4 bg-background border border-border rounded-lg">
        <p className="text-sm font-medium text-foreground mb-1">📝 Условие:</p>
        <p className="text-sm text-muted-foreground">{task}</p>
      </div>

      {graph && <div className="flex justify-center">{graph}</div>}

      <div className="flex gap-2">
        <Button variant={showSolution ? "default" : "outline"} size="sm"
          onClick={() => setShowSolution(!showSolution)}>
          {showSolution ? "Скрыть решение" : "📖 Показать решение"}
        </Button>
        <Button variant={showAnswer ? "default" : "outline"} size="sm"
          onClick={() => setShowAnswer(!showAnswer)}>
          {showAnswer ? "Скрыть ответ" : "✅ Ответ"}
        </Button>
      </div>

      {showSolution && (
        <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg space-y-3 animate-in fade-in-0 slide-in-from-top-2">
          <p className="text-sm font-semibold text-foreground">Решение:</p>
          {solutionContent}
          <div className="pt-3 border-t border-accent/20">
            <p className="text-xs text-muted-foreground italic">
              <strong className="text-foreground">Для психологов:</strong> {explanation}
            </p>
          </div>
        </div>
      )}

      {showAnswer && !showSolution && (
        <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg animate-in fade-in-0 slide-in-from-top-2">
          <p className="text-sm text-foreground">
            <strong>Ответ:</strong> <MathFormula formula={answer} />
          </p>
        </div>
      )}
    </div>
  );
};

const GraphContainer = ({ children, width = 480, height = 240 }: { children: React.ReactNode; width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
    className="border border-border rounded-lg bg-background max-w-full">
    <defs>
      <pattern id="prob-grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="hsl(var(--muted))" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width={width} height={height} fill="url(#prob-grid)" />
    {children}
  </svg>
);

const Graph1 = () => {
  const w = 480, h = 240, pad = 45;
  const points: string[] = [];
  for (let k = 1; k <= 30; k++) {
    const x = pad + ((k - 1) / 29) * (w - 2 * pad);
    const y = h - pad - ((2 + 10 / k - 1) / 13) * (h - 2 * pad);
    points.push(`${x},${y}`);
  }
  return (
    <GraphContainer>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} className="stroke-foreground stroke-2" />
      <line x1={pad} y1={h - pad} x2={pad} y2={pad} className="stroke-foreground stroke-2" />
      <line x1={pad} y1={h - pad - ((2 - 1) / 13) * (h - 2 * pad)}
        x2={w - pad} y2={h - pad - ((2 - 1) / 13) * (h - 2 * pad)}
        className="stroke-destructive stroke-2" strokeDasharray="8,4" />
      <text x={w - pad + 5} y={h - pad - ((2 - 1) / 13) * (h - 2 * pad) + 4} className="fill-destructive text-xs">y = 2</text>
      {Array.from({ length: 30 }, (_, i) => {
        const k = i + 1;
        const x = pad + (i / 29) * (w - 2 * pad);
        const y = h - pad - ((2 + 10 / k - 1) / 13) * (h - 2 * pad);
        return <circle key={i} cx={x} cy={y} r={3} className="fill-primary" />;
      })}
      <polyline points={points.join(" ")} className="fill-none stroke-primary stroke-2" />
      <text x={w / 2} y={h - 5} className="fill-muted-foreground text-xs" textAnchor="middle">k (сессии)</text>
      <text x={w / 2} y={pad - 5} className="fill-accent text-xs font-medium" textAnchor="middle">f(k) = 2 + 10/k → 2</text>
    </GraphContainer>
  );
};

const Graph2 = () => {
  const w = 480, h = 240, pad = 45;
  const f = (t: number) => 50 * Math.exp(-0.2 * t);
  const fPrime3 = -10 * Math.exp(-0.6);
  const y3 = f(3);
  const tangent = (t: number) => y3 + fPrime3 * (t - 3);
  return (
    <GraphContainer>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} className="stroke-foreground stroke-2" />
      <line x1={pad} y1={h - pad} x2={pad} y2={pad} className="stroke-foreground stroke-2" />
      <polyline
        points={Array.from({ length: 100 }, (_, i) => {
          const t = (i / 99) * 10;
          return `${pad + (t / 10) * (w - 2 * pad)},${h - pad - (f(t) / 55) * (h - 2 * pad)}`;
        }).join(" ")}
        className="fill-none stroke-primary stroke-2"
      />
      <line
        x1={pad + (0 / 10) * (w - 2 * pad)} y1={h - pad - (tangent(0) / 55) * (h - 2 * pad)}
        x2={pad + (7 / 10) * (w - 2 * pad)} y2={h - pad - (tangent(7) / 55) * (h - 2 * pad)}
        className="stroke-destructive stroke-2" strokeDasharray="6,3"
      />
      <circle cx={pad + (3 / 10) * (w - 2 * pad)} cy={h - pad - (y3 / 55) * (h - 2 * pad)} r={5} className="fill-accent" />
      <text x={pad + (3 / 10) * (w - 2 * pad) + 8} y={h - pad - (y3 / 55) * (h - 2 * pad) - 8} className="fill-accent text-xs font-medium">
        t=3, y'≈-5.49
      </text>
      <text x={w / 2} y={h - 5} className="fill-muted-foreground text-xs" textAnchor="middle">t (недели)</text>
    </GraphContainer>
  );
};

const Graph3 = () => {
  const w = 480, h = 240, pad = 45;
  const f = (t: number) => 3 * t * t + 2;
  const yMax = 16;
  return (
    <GraphContainer>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} className="stroke-foreground stroke-2" />
      <line x1={pad} y1={h - pad} x2={pad} y2={pad} className="stroke-foreground stroke-2" />
      <path
        d={`M ${pad},${h - pad} ` +
          Array.from({ length: 50 }, (_, i) => {
            const t = (i / 49) * 2;
            return `L ${pad + (t / 3) * (w - 2 * pad)},${h - pad - (f(t) / yMax) * (h - 2 * pad)}`;
          }).join(" ") + ` L ${pad + (2 / 3) * (w - 2 * pad)},${h - pad} Z`}
        className="fill-primary opacity-20"
      />
      <polyline
        points={Array.from({ length: 100 }, (_, i) => {
          const t = (i / 99) * 3;
          return `${pad + (t / 3) * (w - 2 * pad)},${h - pad - (f(t) / yMax) * (h - 2 * pad)}`;
        }).join(" ")}
        className="fill-none stroke-primary stroke-2"
      />
      <text x={pad + (1 / 3) * (w - 2 * pad)} y={h - pad - 30} className="fill-accent text-sm font-bold" textAnchor="middle">S = 12</text>
      <text x={w / 2} y={h - 5} className="fill-muted-foreground text-xs" textAnchor="middle">t (часы)</text>
      <text x={pad - 3} y={h - 3} className="fill-foreground text-xs" textAnchor="middle">0</text>
      <text x={pad + (2 / 3) * (w - 2 * pad)} y={h - 3} className="fill-accent text-xs font-bold" textAnchor="middle">2</text>
    </GraphContainer>
  );
};

const Graph4 = () => {
  const w = 480, h = 240, pad = 45;
  const probs = [0.00243, 0.02835, 0.1323, 0.3087, 0.36015, 0.16807];
  const barW = (w - 2 * pad) / 8;
  return (
    <GraphContainer>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} className="stroke-foreground stroke-2" />
      <line x1={pad} y1={h - pad} x2={pad} y2={pad} className="stroke-foreground stroke-2" />
      {probs.map((p, i) => {
        const x = pad + (i + 1) * barW;
        const barH = (p / 0.4) * (h - 2 * pad);
        return (
          <g key={i}>
            <rect x={x} y={h - pad - barH} width={barW - 4} height={barH}
              className={i >= 3 ? "fill-accent opacity-60" : "fill-muted-foreground opacity-30"}
              stroke="hsl(var(--border))" strokeWidth={1} />
            <text x={x + barW / 2 - 2} y={h - pad + 15} className="fill-muted-foreground text-xs" textAnchor="middle">{i}</text>
            <text x={x + barW / 2 - 2} y={h - pad - barH - 5}
              className={`text-xs ${i >= 3 ? "fill-accent font-bold" : "fill-muted-foreground"}`} textAnchor="middle">
              {p.toFixed(3)}
            </text>
          </g>
        );
      })}
      <text x={w / 2} y={h - 1} className="fill-muted-foreground text-xs" textAnchor="middle">k (верных ответов)</text>
      <text x={w / 2} y={pad - 5} className="fill-accent text-xs font-medium" textAnchor="middle">P(k≥3) = 0.837 (выделено)</text>
    </GraphContainer>
  );
};

const Graph6 = () => {
  const w = 480, h = 240, pad = 45;
  const f = (t: number) => 40 - 10 * Math.log(t + 1);
  const y4 = f(4);
  const tangent = (t: number) => y4 + (-2) * (t - 4);
  return (
    <GraphContainer>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} className="stroke-foreground stroke-2" />
      <line x1={pad} y1={h - pad} x2={pad} y2={pad} className="stroke-foreground stroke-2" />
      <polyline
        points={Array.from({ length: 100 }, (_, i) => {
          const t = (i / 99) * 10;
          return `${pad + (t / 10) * (w - 2 * pad)},${h - pad - (f(t) / 45) * (h - 2 * pad)}`;
        }).join(" ")}
        className="fill-none stroke-primary stroke-2"
      />
      <circle cx={pad + (4 / 10) * (w - 2 * pad)} cy={h - pad - (y4 / 45) * (h - 2 * pad)} r={5} className="fill-accent" />
      <line
        x1={pad + (1 / 10) * (w - 2 * pad)} y1={h - pad - (tangent(1) / 45) * (h - 2 * pad)}
        x2={pad + (8 / 10) * (w - 2 * pad)} y2={h - pad - (tangent(8) / 45) * (h - 2 * pad)}
        className="stroke-destructive stroke-2" strokeDasharray="6,3"
      />
      <text x={pad + (4 / 10) * (w - 2 * pad) + 8} y={h - pad - (y4 / 45) * (h - 2 * pad) - 10} className="fill-accent text-xs font-medium">
        t=4, I'=-2
      </text>
      <text x={w / 2} y={h - 5} className="fill-muted-foreground text-xs" textAnchor="middle">t (предъявления)</text>
    </GraphContainer>
  );
};

const Graph7 = () => {
  const w = 480, h = 240, pad = 45;
  const yMax = 40;
  return (
    <GraphContainer>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} className="stroke-foreground stroke-2" />
      <line x1={pad} y1={h - pad} x2={pad} y2={pad} className="stroke-foreground stroke-2" />
      <polygon
        points={`${pad},${h - pad} ${pad + (7 / 8) * (w - 2 * pad)},${h - pad} ${pad + (7 / 8) * (w - 2 * pad)},${h - pad - (35 / yMax) * (h - 2 * pad)}`}
        className="fill-primary opacity-20"
      />
      <line x1={pad} y1={h - pad} x2={pad + (8 / 8) * (w - 2 * pad)} y2={h - pad - (40 / yMax) * (h - 2 * pad)}
        className="stroke-primary stroke-2" />
      <text x={pad + (3.5 / 8) * (w - 2 * pad)} y={h - pad - 25} className="fill-accent text-sm font-bold" textAnchor="middle">S = 122.5</text>
      <text x={pad} y={h - 3} className="fill-foreground text-xs" textAnchor="middle">0</text>
      <text x={pad + (7 / 8) * (w - 2 * pad)} y={h - 3} className="fill-accent text-xs font-bold" textAnchor="middle">7</text>
      <text x={w / 2} y={h - 5} className="fill-muted-foreground text-xs" textAnchor="middle">t (дни)</text>
    </GraphContainer>
  );
};

const Graph9 = () => {
  const w = 480, h = 240, pad = 45;
  const f = (t: number) => t * t - 4 * t + 10;
  const yMax = 20;
  const y5 = f(5);
  const tangent = (t: number) => y5 + 6 * (t - 5);
  return (
    <GraphContainer>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} className="stroke-foreground stroke-2" />
      <line x1={pad} y1={h - pad} x2={pad} y2={pad} className="stroke-foreground stroke-2" />
      <polyline
        points={Array.from({ length: 100 }, (_, i) => {
          const t = (i / 99) * 8;
          return `${pad + (t / 8) * (w - 2 * pad)},${h - pad - (f(t) / yMax) * (h - 2 * pad)}`;
        }).join(" ")}
        className="fill-none stroke-primary stroke-2"
      />
      <circle cx={pad + (5 / 8) * (w - 2 * pad)} cy={h - pad - (y5 / yMax) * (h - 2 * pad)} r={5} className="fill-accent" />
      <line
        x1={pad + (3 / 8) * (w - 2 * pad)} y1={h - pad - (tangent(3) / yMax) * (h - 2 * pad)}
        x2={pad + (7 / 8) * (w - 2 * pad)} y2={h - pad - (Math.min(tangent(7), yMax) / yMax) * (h - 2 * pad)}
        className="stroke-destructive stroke-2" strokeDasharray="6,3"
      />
      <text x={pad + (5 / 8) * (w - 2 * pad) + 8} y={h - pad - (y5 / yMax) * (h - 2 * pad) - 10} className="fill-accent text-xs font-medium">
        t=5, C'=6
      </text>
      <text x={w / 2} y={h - 5} className="fill-muted-foreground text-xs" textAnchor="middle">t (дни)</text>
    </GraphContainer>
  );
};

const Graph10 = () => {
  const w = 480, h = 240, pad = 45;
  const f = (t: number) => 10 * Math.exp(-0.5 * t);
  const yMax = 12;
  return (
    <GraphContainer>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} className="stroke-foreground stroke-2" />
      <line x1={pad} y1={h - pad} x2={pad} y2={pad} className="stroke-foreground stroke-2" />
      <path
        d={`M ${pad},${h - pad} ` +
          Array.from({ length: 50 }, (_, i) => {
            const t = (i / 49) * 6;
            return `L ${pad + (t / 8) * (w - 2 * pad)},${h - pad - (f(t) / yMax) * (h - 2 * pad)}`;
          }).join(" ") + ` L ${pad + (6 / 8) * (w - 2 * pad)},${h - pad} Z`}
        className="fill-primary opacity-20"
      />
      <polyline
        points={Array.from({ length: 100 }, (_, i) => {
          const t = (i / 99) * 8;
          return `${pad + (t / 8) * (w - 2 * pad)},${h - pad - (f(t) / yMax) * (h - 2 * pad)}`;
        }).join(" ")}
        className="fill-none stroke-primary stroke-2"
      />
      <text x={pad + (2 / 8) * (w - 2 * pad)} y={h - pad - 40} className="fill-accent text-sm font-bold" textAnchor="middle">S ≈ 19.0</text>
      <text x={pad} y={h - 3} className="fill-foreground text-xs" textAnchor="middle">0</text>
      <text x={pad + (6 / 8) * (w - 2 * pad)} y={h - 3} className="fill-accent text-xs font-bold" textAnchor="middle">6</text>
      <text x={w / 2} y={h - 5} className="fill-muted-foreground text-xs" textAnchor="middle">t (часы)</text>
    </GraphContainer>
  );
};

const RiemannProblems = () => {
  const problems: ProblemProps[] = [
    {
      number: 1,
      title: "Пределы и динамика обучения",
      intro: "Понятие предела функции позволяет описать поведение процесса при стремлении аргумента к определённому значению.",
      task: "Скорость реакции на k-й сессии описывается функцией f(k) = 2 + 10/k. Определите предел скорости реакции при k → ∞.",
      solutionContent: (
        <div className="space-y-2">
          <MathFormula formula="\lim_{k \to \infty} f(k) = \lim_{k \to \infty} \left(2 + \frac{10}{k}\right)" display />
          <p className="text-sm text-muted-foreground">
            Так как <MathFormula formula="\lim_{k \to \infty} \frac{10}{k} = 0" />, то:
          </p>
          <MathFormula formula="\lim_{k \to \infty} f(k) = 2 + 0 = 2" display />
        </div>
      ),
      answer: "2",
      explanation: "Предел позволяет определить теоретически возможное максимальное развитие навыка по мере роста числа тренировок.",
      graph: <Graph1 />,
    },
    {
      number: 2,
      title: "Производная и темп изменений",
      intro: "Производная характеризует мгновенную скорость изменений рассматриваемой величины.",
      task: "Уровень тревожности y(t) = 50e^{-0.2t}, где t — номер недели. Найдите производную и определите темп снижения тревожности на 3-й неделе.",
      solutionContent: (
        <div className="space-y-2">
          <MathFormula formula="\frac{dy}{dt} = 50 \cdot (-0.2) e^{-0.2t} = -10e^{-0.2t}" display />
          <p className="text-sm text-muted-foreground">На 3-й неделе (t=3):</p>
          <MathFormula formula="\frac{dy}{dt}\bigg|_{t=3} = -10e^{-0.6} \approx -5.49" display />
        </div>
      ),
      answer: "-5.49",
      explanation: "Производная показывает, с какой скоростью снижается уровень тревожности на конкретной неделе — важно для оценки динамики психологической интервенции.",
      graph: <Graph2 />,
    },
    {
      number: 3,
      title: "Интеграл и суммарное воздействие стимула",
      intro: "Интеграл используется для расчёта суммарного воздействия или накопленного эффекта процесса во времени.",
      task: "Интенсивность мозговой активности I(t) = 3t² + 2. Найдите общее воздействие за 2 часа экзамена (от 0 до 2).",
      solutionContent: (
        <div className="space-y-2">
          <MathFormula formula="\int_0^2 (3t^2 + 2)\,dt = \left[ t^3 + 2t \right]_0^2 = (8 + 4) - 0 = 12" display />
        </div>
      ),
      answer: "12",
      explanation: "Вычисленный интеграл отражает общий объём активности, полезен для оценки когнитивных ресурсов и анализа перегрузки.",
      graph: <Graph3 />,
    },
    {
      number: 4,
      title: "Вероятность ответа на стимул",
      intro: "Теория вероятностей позволяет прогнозировать события и оценивать надёжность исследовательских данных.",
      task: "70% студентов верно отвечают на стимул. При 5 попытках найдите вероятность верного ответа не менее 3 раз.",
      solutionContent: (
        <div className="space-y-2">
          <MathFormula formula="P = \sum_{k=3}^{5} C_5^k \cdot 0.7^k \cdot 0.3^{5-k}" display />
          <div className="text-sm text-muted-foreground space-y-1">
            <p><MathFormula formula="P_3 = 10 \cdot 0.343 \cdot 0.09 = 0.3087" /></p>
            <p><MathFormula formula="P_4 = 5 \cdot 0.2401 \cdot 0.3 = 0.36015" /></p>
            <p><MathFormula formula="P_5 = 1 \cdot 0.16807 = 0.16807" /></p>
          </div>
          <MathFormula formula="P = 0.3087 + 0.36015 + 0.16807 = 0.83692" display />
        </div>
      ),
      answer: "0.837",
      explanation: "Биномиальная вероятность позволяет оценивать успешность обучения и надёжность результатов.",
      graph: <Graph4 />,
    },
    {
      number: 5,
      title: "Предел и устойчивость шкалы",
      intro: "Предел последовательности используется для анализа устойчивости психометрических инструментов.",
      task: "Студент набрал баллы: 12, 14, 15, 15, 15, 15, 15, 15. Найдите предел последовательности aₙ при n → ∞.",
      solutionContent: (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">С a₃ баллы стабилизируются на уровне 15:</p>
          <MathFormula formula="\lim_{n \to \infty} a_n = 15" display />
        </div>
      ),
      answer: "15",
      explanation: "Анализ пределов результатов тестирования позволяет выявлять устоявшиеся паттерны и надёжность шкал.",
    },
    {
      number: 6,
      title: "Производная и насыщение реакции",
      intro: "Производная отражает скорость изменения психологической реакции при повторном предъявлении стимула.",
      task: "Уровень интереса I(t) = 40 - 10·ln(t+1). Найдите скорость изменения интереса на 4-м предъявлении.",
      solutionContent: (
        <div className="space-y-2">
          <MathFormula formula="I'(t) = -10 \cdot \frac{1}{t+1}" display />
          <p className="text-sm text-muted-foreground">Для t = 4:</p>
          <MathFormula formula="I'(4) = -10 \cdot \frac{1}{5} = -2" display />
        </div>
      ),
      answer: "-2",
      explanation: "Производная показывает, как быстро «угасает» интерес к повторяющемуся стимулу — ключевой аспект экспериментальной психологии.",
      graph: <Graph6 />,
    },
    {
      number: 7,
      title: "Интеграл и накопление психологического эффекта",
      intro: "Интеграл исчисляет общее воздействие повторяющегося стимула на протяжении времени.",
      task: "Ежедневная мотивация M(t) = 5t. Вычислите общий эффект мотивации за первые 7 дней.",
      solutionContent: (
        <div className="space-y-2">
          <MathFormula formula="\int_0^7 5t\,dt = 5 \cdot \frac{t^2}{2}\bigg|_0^7 = 5 \cdot \frac{49}{2} = 122.5" display />
        </div>
      ),
      answer: "122.5",
      explanation: "Интеграл помогает выявить суммарный эффект мотивационных вмешательств — важно для длительных обучающих программ.",
      graph: <Graph7 />,
    },
    {
      number: 8,
      title: "Теория вероятностей — надёжность шкалы",
      intro: "Теория вероятностей используется для расчёта надёжности шкал и опросников.",
      task: "Шкала оценки депрессии: точность 90% на одном вопросе. Рассчитайте вероятность верного ответа на 8 из 10 вопросов.",
      solutionContent: (
        <div className="space-y-2">
          <MathFormula formula="P = C_{10}^8 \cdot 0.9^8 \cdot 0.1^2" display />
          <div className="text-sm text-muted-foreground space-y-1">
            <p><MathFormula formula="C_{10}^8 = 45,\quad 0.9^8 \approx 0.43047,\quad 0.1^2 = 0.01" /></p>
          </div>
          <MathFormula formula="P = 45 \cdot 0.43047 \cdot 0.01 \approx 0.194" display />
        </div>
      ),
      answer: "0.194",
      explanation: "Вероятностная оценка надёжности шкалы важна для интерпретации результатов и определения достоверности выводов.",
    },
    {
      number: 9,
      title: "Скорость изменения когнитивной функции",
      intro: "Производная позволяет анализировать скорость изменения когнитивных процессов во времени.",
      task: "Когнитивная функция C(t) = t² - 4t + 10. Найдите скорость изменения на 5-й день.",
      solutionContent: (
        <div className="space-y-2">
          <MathFormula formula="C'(t) = 2t - 4" display />
          <p className="text-sm text-muted-foreground">Для t = 5:</p>
          <MathFormula formula="C'(5) = 2 \cdot 5 - 4 = 6" display />
        </div>
      ),
      answer: "6",
      explanation: "Анализ скорости изменения когнитивных функций позволяет диагностировать и корректировать индивидуальные траектории обучения.",
      graph: <Graph9 />,
    },
    {
      number: 10,
      title: "Интеграл и восстановление энергии",
      intro: "Интеграл помогает оценить восстановление энергии после нагрузки.",
      task: "Восстановление R(t) = 10e^{-0.5t}. Вычислите интегральное восстановление за первые 6 часов.",
      solutionContent: (
        <div className="space-y-2">
          <MathFormula formula="\int_0^6 10e^{-0.5t}\,dt = 10 \cdot \left[-2e^{-0.5t}\right]_0^6" display />
          <MathFormula formula="= 10\big[2 - 2e^{-3}\big] \approx 19.0" display />
        </div>
      ),
      answer: "19.0",
      explanation: "Интеграл позволяет количественно оценить психологическое восстановление, полезно для составления программ профилактики.",
      graph: <Graph10 />,
    },
  ];

  return (
    <Card className="p-6 bg-card shadow-[var(--shadow-soft)]">
      <h2 className="text-2xl font-heading font-bold mb-2 text-foreground uppercase tracking-tight">
        Задачи для самостоятельной работы
      </h2>
      <p className="text-muted-foreground mb-6">
        Комплексные задачи по математическому анализу для студентов-психологов.
        Нажмите кнопки, чтобы увидеть решение или ответ.
      </p>
      <div className="space-y-6">
        {problems.map((p) => (
          <Problem key={p.number} {...p} />
        ))}
      </div>
    </Card>
  );
};

export default RiemannProblems;
