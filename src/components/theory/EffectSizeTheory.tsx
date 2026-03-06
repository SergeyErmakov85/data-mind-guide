import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MathFormula } from '@/components/MathFormula';
import { TrendingUp, Lightbulb, AlertCircle, BookOpen, History, Calculator, FileText, BarChart3 } from 'lucide-react';

/**
 * Comprehensive Effect Size theory section based on the full methodological guide.
 * Covers: history, formulas (d, g, Δ, r, η², ω², f, OR, φ, V), p-value critique,
 * confidence intervals, power analysis, practical examples, APA formatting, conversion formulas.
 */
export const EffectSizeTheory = () => {
  return (
    <div className="space-y-6">
      {/* === Intro === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Размер эффекта в психологических исследованиях
          </CardTitle>
          <CardDescription>Полное методическое руководство</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-accent/40 border border-accent rounded-lg">
            <h4 className="font-semibold mb-2 text-foreground">Что такое размер эффекта?</h4>
            <p className="text-muted-foreground">
              <strong>Размер эффекта</strong> — это число, которое показывает, <em>насколько сильно</em> одно явление влияет на другое
              или насколько две группы реально отличаются друг от друга. Если p-значение отвечает на вопрос «Есть ли различие?»,
              то размер эффекта отвечает на вопрос <strong>«Насколько велико это различие?»</strong>.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Например, если новая методика обучения повышает баллы студентов, размер эффекта покажет, 
              улучшение минимальное (студенты почти не заметят разницу) или существенное (результат ощутим на практике).
            </p>
          </div>
          <p className="text-muted-foreground">
            Формально: <strong>размер эффекта (effect size)</strong> — стандартизированная количественная мера величины изучаемого явления,
            позволяющая оценить <em>практическую</em> значимость результатов независимо от объёма выборки.
          </p>
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground italic">
              «Первичный продукт научного исследования — это одна или несколько мер размера эффекта, а не p-значения»
              <span className="block text-right mt-1 not-italic font-medium">— Jacob Cohen, 1994</span>
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Размер эффекта выполняет три ключевые функции: оценка <strong>практической значимости</strong>,
            обеспечение <strong>кумулятивной науки</strong> (метаанализы) и <strong>планирование исследований</strong> (анализ мощности).
          </p>
          <div className="p-4 bg-muted/30 rounded-lg">
            <h5 className="font-semibold mb-2">Два семейства мер (Rosenthal, 1994)</h5>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 border border-border rounded-lg">
                <h6 className="font-medium text-primary mb-1">Семейство d</h6>
                <p className="text-sm text-muted-foreground">Стандартизированные разности средних: d Коэна, g Хеджеса, Δ Гласса</p>
              </div>
              <div className="p-3 border border-border rounded-lg">
                <h6 className="font-medium text-primary mb-1">Семейство r</h6>
                <p className="text-sm text-muted-foreground">Меры связи: r Пирсона, η², R², φ, V Крамера</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === History === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            История концепции
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { year: '1962', text: 'Коэн анализирует 70 статей: средняя мощность обнаружения средних эффектов — лишь 0,48 (подбрасывание монеты).' },
            { year: '1969–1988', text: 'Три издания «Statistical Power Analysis for the Behavioral Sciences». Второе издание (1988) — канонический источник конвенций.' },
            { year: '1992', text: '«A Power Primer» — одна из самых цитируемых статей в поведенческих науках (>42 000 цитирований). Таблицы необходимых N для мощности 0,80.' },
            { year: '1994', text: '«The Earth Is Round (p < .05)» — знаменитая критика NHST, утверждение приоритета размера эффекта.' },
            { year: '2001–2020', text: 'APA закрепляет обязательность указания размера эффекта (5-е изд.), вводит ДИ как «минимальные ожидания» (6-е изд., 2010), усиливает стандарты JARS (7-е изд., 2020).' },
          ].map((item) => (
            <div key={item.year} className="flex gap-4 items-start">
              <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap mt-0.5">{item.year}</span>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
          <div className="example-box mt-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Коэн описал d = 0,5 как различие в <strong>7,5 баллов IQ</strong> (при SD = 15) — «эффект, заметный невооружённым глазом внимательного наблюдателя».
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === d Коэна === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            d Коэна (Cohen's d)
          </CardTitle>
          <CardDescription>Стандартизированная разность средних — наиболее распространённая мера</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <h5 className="font-semibold mb-2">Для независимых выборок</h5>
            <MathFormula formula="d = \frac{\bar{X}_1 - \bar{X}_2}{s_{\text{pooled}}}" display />
            <p className="text-sm text-muted-foreground mt-2">где объединённое SD:</p>
            <MathFormula formula="s_{\text{pooled}} = \sqrt{\frac{s_1^2(n_1 - 1) + s_2^2(n_2 - 1)}{n_1 + n_2 - 2}}" display />
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h5 className="font-semibold mb-2">Для зависимых (парных) выборок</h5>
            <MathFormula formula="d_z = \frac{\bar{X}_{\text{diff}}}{s_{\text{diff}}} = \frac{t}{\sqrt{N}}" display />
          </div>

          {/* Cohen's conventions visual */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h5 className="font-semibold mb-3">Конвенции Коэна</h5>
            <div className="flex flex-wrap gap-3">
              {[
                { label: '0,2', desc: 'Малый', color: 'bg-info/20 text-info' },
                { label: '0,5', desc: 'Средний', color: 'bg-warning/20 text-warning' },
                { label: '0,8', desc: 'Большой', color: 'bg-destructive/20 text-destructive' },
              ].map((c) => (
                <div key={c.label} className={`px-4 py-2 rounded-lg ${c.color} text-center`}>
                  <div className="font-bold font-mono text-lg">{c.label}</div>
                  <div className="text-xs">{c.desc}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Расширенная шкала Савиловски (2009): 0,01 — очень малый, 1,2 — очень большой, 2,0 — огромный.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h5 className="font-semibold mb-2">d из t-статистики</h5>
              <MathFormula formula="d = \frac{2t}{\sqrt{df_{\text{error}}}}" display />
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h5 className="font-semibold mb-2">d из F-статистики</h5>
              <MathFormula formula="d = 2\sqrt{\frac{F}{df_{\text{error}}}}" display />
              <p className="text-xs text-muted-foreground mt-1">(две группы, df числителя = 1)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === g Хеджеса & Δ Гласса === */}
      <Card>
        <CardHeader><CardTitle>Коррекции d Коэна</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <h5 className="font-semibold mb-2">g Хеджеса — коррекция для малых выборок</h5>
            <p className="text-sm text-muted-foreground mb-2">d Коэна завышает истинный эффект при малых выборках. Поправочный коэффициент:</p>
            <MathFormula formula="J = 1 - \frac{3}{4 \cdot df - 1}, \quad g = J \times d" display />
            <p className="text-xs text-muted-foreground mt-2">При n₁ = n₂ = 10 (df = 18): J ≈ 0,958 — коррекция уменьшает d на ~4%. При n &gt; 50 в группе g ≈ d.</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h5 className="font-semibold mb-2">Δ Гласса — при неравных дисперсиях</h5>
            <MathFormula formula="\Delta = \frac{\bar{X}_{\text{treatment}} - \bar{X}_{\text{control}}}{s_{\text{control}}}" display />
            <p className="text-sm text-muted-foreground">В знаменателе — SD <em>только</em> контрольной группы. Предпочтительна при гетероскедастичности.</p>
          </div>
        </CardContent>
      </Card>

      {/* === r, η², ω², f === */}
      <Card>
        <CardHeader><CardTitle>Меры связи и объяснённой дисперсии</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h5 className="font-semibold mb-2">r Пирсона как мера размера эффекта</h5>
              <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                <span>|r| = 0,10 — малый</span><span>|r| = 0,30 — средний</span><span>|r| = 0,50 — большой</span>
              </div>
              <MathFormula formula="r = \frac{t}{\sqrt{t^2 + df}}" display />
              <p className="text-xs text-muted-foreground">r² — коэффициент детерминации (доля объяснённой дисперсии).</p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h5 className="font-semibold mb-2">η² (эта-квадрат) для ANOVA</h5>
              <MathFormula formula="\eta^2 = \frac{SS_{\text{effect}}}{SS_{\text{total}}}" display />
              <div className="flex gap-4 text-sm text-muted-foreground flex-wrap mt-2">
                <span>0,01 — малый</span><span>0,06 — средний</span><span>0,14 — большой</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">⚠️ Смещённая оценка — завышает истинный эффект при малых выборках.</p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h5 className="font-semibold mb-2">Частный η² (partial eta-squared)</h5>
              <MathFormula formula="\eta_p^2 = \frac{SS_{\text{effect}}}{SS_{\text{effect}} + SS_{\text{error}}}" display />
              <p className="text-xs text-muted-foreground">Выдаётся SPSS по умолчанию. В многофакторных планах частные η² могут в сумме &gt; 1.</p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h5 className="font-semibold mb-2">ω² (омега-квадрат) — менее смещённая</h5>
              <MathFormula formula="\omega^2 = \frac{SS_{\text{effect}} - df_{\text{effect}} \times MS_{\text{error}}}{SS_{\text{total}} + MS_{\text{error}}}" display />
              <p className="text-xs text-muted-foreground">Всегда ≤ η² для тех же данных. Несмещённая оценка.</p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h5 className="font-semibold mb-2">f Коэна (для ANOVA и G*Power)</h5>
              <MathFormula formula="f = \sqrt{\frac{\eta^2}{1 - \eta^2}}" display />
              <div className="flex gap-4 text-sm text-muted-foreground flex-wrap mt-2">
                <span>f = 0,10 — малый</span><span>f = 0,25 — средний</span><span>f = 0,40 — большой</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === Categorical: OR, RR, φ, V === */}
      <Card>
        <CardHeader><CardTitle>Меры для категориальных данных</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <h5 className="font-semibold mb-2">Odds Ratio и Risk Ratio (таблица 2×2)</h5>
            <div className="overflow-x-auto mb-3">
              <table className="text-sm border-collapse w-auto mx-auto">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-2 text-left"></th>
                    <th className="p-2 text-center">Событие (+)</th>
                    <th className="p-2 text-center">Нет события (−)</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50"><td className="p-2 font-medium">Группа 1</td><td className="p-2 text-center font-mono">a</td><td className="p-2 text-center font-mono">b</td></tr>
                  <tr><td className="p-2 font-medium">Группа 2</td><td className="p-2 text-center font-mono">c</td><td className="p-2 text-center font-mono">d</td></tr>
                </tbody>
              </table>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <MathFormula formula="OR = \frac{a \times d}{b \times c}" display />
                <p className="text-xs text-muted-foreground text-center">Отношение шансов</p>
              </div>
              <div>
                <MathFormula formula="RR = \frac{a/(a+b)}{c/(c+d)}" display />
                <p className="text-xs text-muted-foreground text-center">Отношение рисков</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Перевод OR → d: <MathFormula formula="d = \frac{\ln(OR) \times \sqrt{3}}{\pi}" /></p>
          </div>

          <div className="p-4 border border-border rounded-lg">
            <h5 className="font-semibold mb-2">φ (фи) и V Крамера</h5>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <MathFormula formula="\varphi = \sqrt{\frac{\chi^2}{N}}" display />
                <p className="text-xs text-muted-foreground text-center">Для таблиц 2×2</p>
              </div>
              <div>
                <MathFormula formula="V = \sqrt{\frac{\chi^2}{N \times (k - 1)}}" display />
                <p className="text-xs text-muted-foreground text-center">Для таблиц r × c</p>
              </div>
            </div>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-2 text-center">df</th>
                    <th className="p-2 text-center">Малый</th>
                    <th className="p-2 text-center">Средний</th>
                    <th className="p-2 text-center">Большой</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground text-center">
                  {[
                    [1, '0,10', '0,30', '0,50'],
                    [2, '0,07', '0,21', '0,35'],
                    [3, '0,06', '0,17', '0,29'],
                    [4, '0,05', '0,15', '0,25'],
                    [5, '0,04', '0,13', '0,22'],
                  ].map(([df, s, m, l]) => (
                    <tr key={String(df)} className="border-b border-border/50">
                      <td className="p-2 font-mono font-medium">{df}</td>
                      <td className="p-2">{s}</td>
                      <td className="p-2">{m}</td>
                      <td className="p-2">{l}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === Nonparametric effect sizes === */}
      <Card>
        <CardHeader><CardTitle>Размер эффекта для непараметрических критериев</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <h5 className="font-semibold mb-2">r из Z-статистики (Манна-Уитни, Уилкоксон)</h5>
            <MathFormula formula="r = \frac{|Z|}{\sqrt{N}}" display />
            <p className="text-xs text-muted-foreground">Интерпретация: |r| ≥ 0,10 — малый, ≥ 0,30 — средний, ≥ 0,50 — большой.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h5 className="font-semibold mb-2 text-sm">Краскел-Уоллис: η²_H</h5>
              <MathFormula formula="\eta^2_H = \frac{H - k + 1}{N - k}" display />
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h5 className="font-semibold mb-2 text-sm">Фридман: W Кендалла</h5>
              <MathFormula formula="W = \frac{\chi^2_F}{N \times (k - 1)}" display />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === p-value critique with visualization === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Почему p-значение ≠ практическая значимость
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            p-значение зависит одновременно от размера эффекта <strong>и</strong> объёма выборки.
            Размер эффекта от объёма выборки не зависит.
          </p>

          {/* Visual: two scenarios side by side */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <h5 className="font-semibold text-destructive mb-2">Большая выборка → тривиальный эффект</h5>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>N = 5 000 в группе, разница = 0,5 балла</p>
                <p className="font-mono">d = 0,05 • p ≈ 0,01</p>
                <p className="mt-2 text-xs italic">«Высокозначимый» результат без практического смысла.</p>
              </div>
              {/* Simple bar visualization */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-right text-muted-foreground">Группа 1</span>
                  <div className="h-4 bg-primary/30 rounded" style={{ width: '100%' }} />
                  <span className="text-muted-foreground font-mono">100,0</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-right text-muted-foreground">Группа 2</span>
                  <div className="h-4 bg-primary/60 rounded" style={{ width: '100.5%' }} />
                  <span className="text-muted-foreground font-mono">100,5</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
              <h5 className="font-semibold text-warning mb-2">Малая выборка → скрытый эффект</h5>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>n = 10 в группе, разница = 4,8 балла</p>
                <p className="font-mono">d = 0,60 • p ≈ 0,10</p>
                <p className="mt-2 text-xs italic">Реальный средний эффект отклонён как «незначимый».</p>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-right text-muted-foreground">Контроль</span>
                  <div className="h-4 bg-warning/30 rounded" style={{ width: '83%' }} />
                  <span className="text-muted-foreground font-mono">50,2</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-right text-muted-foreground">Эксперим.</span>
                  <div className="h-4 bg-warning/60 rounded" style={{ width: '92%' }} />
                  <span className="text-muted-foreground font-mono">55,0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="example-box">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Реальный пример: Исследование аспирина</h4>
                <p className="text-sm text-muted-foreground">
                  В Physicians Health Study (22 000+ участников) аспирин показал <strong>p &lt; 0,00001</strong> для снижения риска инфаркта,
                  но r² = 0,001 — менее <strong>одной десятой процента</strong> объяснённой дисперсии.
                </p>
              </div>
            </div>
          </div>

          {/* Reproducibility crisis */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h5 className="font-semibold mb-2">Кризис воспроизводимости (2015)</h5>
            <p className="text-sm text-muted-foreground">
              Open Science Collaboration воспроизвела 100 психологических исследований:
            </p>
            <div className="grid grid-cols-3 gap-3 mt-3 text-center">
              <div className="p-3 bg-background rounded-lg border border-border">
                <div className="text-2xl font-bold text-primary">97%</div>
                <div className="text-xs text-muted-foreground">оригинально значимых</div>
              </div>
              <div className="p-3 bg-background rounded-lg border border-border">
                <div className="text-2xl font-bold text-destructive">36%</div>
                <div className="text-xs text-muted-foreground">воспроизведено</div>
              </div>
              <div className="p-3 bg-background rounded-lg border border-border">
                <div className="text-2xl font-bold text-warning">~50%</div>
                <div className="text-xs text-muted-foreground">размер эффекта от исходного</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === Confidence intervals === */}
      <Card>
        <CardHeader><CardTitle>Доверительные интервалы для размера эффекта</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Наблюдаемый размер эффекта — <strong>точечная оценка</strong>. d = 0,50 на выборке из 20 менее точен,
            чем d = 0,50 на выборке из 200. Без ДИ это различие невидимо.
          </p>

          <div className="space-y-3">
            {[
              { scenario: 'Малое p + большой эффект + узкий ДИ', verdict: 'Убедительное свидетельство реального эффекта', color: 'bg-success/10 border-success/20 text-success' },
              { scenario: 'Малое p + маленький эффект + узкий ДИ', verdict: 'Статистически значим, но практически тривиален', color: 'bg-warning/10 border-warning/20 text-warning' },
              { scenario: 'Большое p + большой эффект + широкий ДИ', verdict: 'Нельзя сказать «нет эффекта» — скорее низкая мощность', color: 'bg-destructive/10 border-destructive/20 text-destructive' },
            ].map((item) => (
              <div key={item.scenario} className={`p-3 border rounded-lg ${item.color}`}>
                <p className="text-sm font-medium">{item.scenario}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.verdict}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground italic">
            <strong>Стандарт APA (6-е изд.):</strong> «Оценки размеров эффекта и доверительные интервалы являются <em>минимальными ожиданиями</em>».
          </p>
        </CardContent>
      </Card>

      {/* === Power analysis with table === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Мощность и планирование выборки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Четыре взаимосвязанные величины: <strong>N</strong>, <strong>α</strong>, <strong>размер эффекта</strong> и <strong>мощность</strong> (1 − β).
            Рекомендуемый минимум мощности — <strong>0,80</strong>.
          </p>

          {/* Cohen's Power Primer table */}
          <div className="overflow-x-auto">
            <h5 className="font-semibold mb-2 text-sm">N на группу при α = 0,05 и мощности = 0,80 (Cohen, 1992)</h5>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2 text-left text-muted-foreground">Тест</th>
                  <th className="p-2 text-center">Малый ES</th>
                  <th className="p-2 text-center">Средний ES</th>
                  <th className="p-2 text-center">Большой ES</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ['t-тест (независимые)', '393', '64', '26'],
                  ['Корреляция r', '783', '85', '28'],
                  ['Хи-квадрат (1 df)', '785', '87', '26'],
                  ['ANOVA (3 группы)', '322', '52', '21'],
                  ['ANOVA (4 группы)', '274', '45', '18'],
                  ['Множеств. регрессия (3 пред.)', '547', '76', '34'],
                  ['Множеств. регрессия (8 пред.)', '757', '107', '50'],
                ].map(([test, s, m, l]) => (
                  <tr key={test} className="border-b border-border/50">
                    <td className="p-2 text-sm">{test}</td>
                    <td className="p-2 text-center font-mono">{s}</td>
                    <td className="p-2 text-center font-mono font-bold">{m}</td>
                    <td className="p-2 text-center font-mono">{l}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="example-box">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Для обнаружения <strong>среднего эффекта</strong> (d = 0,50) t-тестом нужно <strong>64 человека в каждой группе</strong> (128 всего).
                Для малого (d = 0,20) — уже <strong>393 в группе</strong> (786 всего).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === Practical examples === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Примеры расчёта
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Example 1: Cohen's d */}
          <div className="p-4 bg-success/5 border border-success/20 rounded-lg space-y-3">
            <h5 className="font-semibold text-success">Пример 1. d Коэна для t-критерия</h5>
            <p className="text-sm text-muted-foreground">
              Тревожность до и после курса майндфулнес. Эксп. (n=30): M₁ = 42,3, SD₁ = 8,5. Контр. (n=30): M₂ = 47,8, SD₂ = 9,1.
            </p>
            <MathFormula formula="s_{\text{pooled}} = \sqrt{\frac{8{,}5^2 \times 29 + 9{,}1^2 \times 29}{58}} = 8{,}81" display />
            <MathFormula formula="d = \frac{42{,}3 - 47{,}8}{8{,}81} = -0{,}62" display />
            <div className="p-3 bg-background rounded border border-border text-sm text-muted-foreground italic">
              <strong>APA:</strong> <em>t</em>(58) = −2,41, <em>p</em> = .019, <em>d</em> = −0,62, 95% ДИ [−1,15; −0,10]. Средний эффект.
            </div>
          </div>

          {/* Example 2: η² */}
          <div className="p-4 bg-info/5 border border-info/20 rounded-lg space-y-3">
            <h5 className="font-semibold text-info">Пример 2. η² для ANOVA</h5>
            <p className="text-sm text-muted-foreground">
              Три метода терапии депрессии. SS_between = 420, SS_total = 2800, F(2, 57) = 5,03.
            </p>
            <MathFormula formula="\eta^2 = \frac{420}{2800} = 0{,}15" display />
            <MathFormula formula="\omega^2 = \frac{420 - 2 \times 41{,}75}{2800 + 41{,}75} = 0{,}118" display />
            <div className="p-3 bg-background rounded border border-border text-sm text-muted-foreground italic">
              <strong>APA:</strong> <em>F</em>(2, 57) = 5,03, <em>p</em> = .010, η² = .15. Большой эффект (метод объясняет 15% дисперсии).
            </div>
          </div>

          {/* Example 3: Mann-Whitney r */}
          <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg space-y-3">
            <h5 className="font-semibold text-warning">Пример 3. r для Манна-Уитни</h5>
            <p className="text-sm text-muted-foreground">
              Удовлетворённость жизнью: мужчины (n=25) vs женщины (n=25). U = 200, Z = −2,38.
            </p>
            <MathFormula formula="r = \frac{2{,}38}{\sqrt{50}} = 0{,}337" display />
            <div className="p-3 bg-background rounded border border-border text-sm text-muted-foreground italic">
              <strong>APA:</strong> <em>U</em> = 200, <em>Z</em> = −2,38, <em>p</em> = .017, <em>r</em> = .34. Средний эффект.
            </div>
          </div>

          {/* Example 4: Cramér's V */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
            <h5 className="font-semibold text-primary">Пример 4. V Крамера</h5>
            <p className="text-sm text-muted-foreground">
              Тип терапии (3) × исход (3). N = 150, χ² = 12,60.
            </p>
            <MathFormula formula="V = \sqrt{\frac{12{,}60}{150 \times 2}} = 0{,}205" display />
            <div className="p-3 bg-background rounded border border-border text-sm text-muted-foreground italic">
              <strong>APA:</strong> χ²(4, <em>N</em> = 150) = 12,60, <em>p</em> = .013, <em>V</em> = .21. Средний эффект (df = 2).
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === APA formatting === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Оформление по стандартам APA (7-е издание)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />Сообщайте <strong>все</strong> размеры эффекта и доверительные интервалы</li>
            <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />Точные p-значения (p = .023), не p &lt; .05, кроме p &lt; .001</li>
            <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />ДИ в квадратных скобках: 95% CI [0,15; 0,85]</li>
            <li className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-primary mt-1.5" />Статистические символы курсивом: <em>t</em>, <em>F</em>, <em>p</em>, <em>d</em>, <em>r</em></li>
          </ul>

          <div className="space-y-2">
            <h5 className="font-semibold text-sm">Примеры записи:</h5>
            {[
              { label: 't-тест', text: '«Пожилые участники демонстрировали значимо более высокий уровень одиночества, t(32) = 2,94, p = .006, d = 0,81, 95% CI [0,60; 1,02]».' },
              { label: 'ANOVA', text: '«Обнаружен значимый главный эффект метода терапии, F(2, 57) = 5,03, p = .010, η² = .15, 90% CI [.03; .26]».' },
              { label: 'Корреляция', text: '«Выявлена умеренная положительная связь, r(98) = .35, p < .001, 95% CI [.17; .51]».' },
            ].map((ex) => (
              <div key={ex.label} className="p-3 bg-muted/30 rounded-lg">
                <span className="text-xs font-medium text-primary">{ex.label}:</span>
                <p className="text-sm text-muted-foreground italic mt-1">{ex.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* === Summary table of conventions === */}
      <Card>
        <CardHeader><CardTitle>Сводная таблица пороговых значений</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2 text-left text-muted-foreground">Мера</th>
                  <th className="p-2 text-left text-muted-foreground">Контекст</th>
                  <th className="p-2 text-center">Малый</th>
                  <th className="p-2 text-center">Средний</th>
                  <th className="p-2 text-center">Большой</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ['d', 'Разность средних (t-тест)', '0,20', '0,50', '0,80'],
                  ['r', 'Корреляция', '0,10', '0,30', '0,50'],
                  ['η²', 'ANOVA', '0,01', '0,06', '0,14'],
                  ['ω²', 'ANOVA (несмещ.)', '0,01', '0,06', '0,14'],
                  ['f', 'ANOVA / G*Power', '0,10', '0,25', '0,40'],
                  ['f²', 'Множеств. регрессия', '0,02', '0,15', '0,35'],
                  ['φ / w', 'Хи-квадрат (2×2)', '0,10', '0,30', '0,50'],
                  ['V (df=2)', 'Таблицы сопряжённости', '0,07', '0,21', '0,35'],
                  ['W', 'Критерий Фридмана', '0,10', '0,30', '0,50'],
                ].map(([measure, ctx, s, m, l]) => (
                  <tr key={measure} className="border-b border-border/50">
                    <td className="p-2 font-mono font-medium">{measure}</td>
                    <td className="p-2 text-xs">{ctx}</td>
                    <td className="p-2 text-center font-mono">{s}</td>
                    <td className="p-2 text-center font-mono font-bold">{m}</td>
                    <td className="p-2 text-center font-mono">{l}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
            <p className="text-xs text-muted-foreground italic">
              <strong>Оговорка Коэна:</strong> «Конвенции рекомендуются к использованию <em>только</em> тогда, когда нет лучшего основания для оценки».
              Медианный эффект в психологии — r ≈ 0,19–0,20 (Gignac & Szodorai, 2016), что меньше «среднего» порога.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* === Conversion formulas === */}
      <Card>
        <CardHeader><CardTitle>Формулы перевода между мерами</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h5 className="font-semibold mb-2 text-sm">d ↔ r (равные группы)</h5>
              <MathFormula formula="r = \frac{d}{\sqrt{d^2 + 4}}" display />
              <MathFormula formula="d = \frac{2r}{\sqrt{1 - r^2}}" display />
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h5 className="font-semibold mb-2 text-sm">d ↔ η² (две группы)</h5>
              <MathFormula formula="\eta^2 = \frac{d^2}{d^2 + 4}" display />
              <MathFormula formula="d = 2\sqrt{\frac{\eta^2}{1 - \eta^2}}" display />
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h5 className="font-semibold mb-2 text-sm">η² ↔ f Коэна</h5>
              <MathFormula formula="f = \sqrt{\frac{\eta^2}{1 - \eta^2}}" display />
              <MathFormula formula="\eta^2 = \frac{f^2}{1 + f^2}" display />
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h5 className="font-semibold mb-2 text-sm">d ↔ OR</h5>
              <MathFormula formula="\ln(OR) = \frac{d \times \pi}{\sqrt{3}}" display />
              <MathFormula formula="d = \frac{\ln(OR) \times \sqrt{3}}{\pi}" display />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === Conclusion === */}
      <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
        <h4 className="font-semibold mb-3">Заключение: от ритуала значимости к осмысленной науке</h4>
        <p className="text-sm text-muted-foreground">
          Современная повестка сдвигается в трёх направлениях: от конвенций Коэна — к <strong>контекстно-специфическим бенчмаркам</strong>;
          от точечных оценок — к <strong>доверительным интервалам</strong>; от ретроспективного отчёта — к <strong>априорному планированию</strong>.
          Размер эффекта — не формальное дополнение к p-значению, а первичный результат исследования.
        </p>
      </div>
    </div>
  );
};
