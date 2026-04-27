import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MathFormula } from '@/components/MathFormula';
import { Quiz } from '@/components/Quiz';
import { markTopicCompleted, getProgress } from '@/lib/progress';
import { DescriptiveCalculator } from '@/components/DescriptiveCalculator';

const topics = [
  {
    id: 'central-tendency',
    title: 'Меры центральной тенденции',
    content: (
      <div className="space-y-4 text-sm leading-relaxed">
        <p>Меры центральной тенденции описывают «типичное» значение в наборе данных.</p>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h4 className="font-medium text-primary">Среднее (M)</h4>
              <MathFormula formula="M = \frac{\sum x_i}{n}" />
              <p className="text-muted-foreground text-xs">Чувствительно к выбросам. Используется для интервальных данных с симметричным распределением.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h4 className="font-medium text-primary">Медиана (Me)</h4>
              <p className="text-xs text-muted-foreground">Значение, делящее упорядоченный ряд пополам. Устойчива к выбросам — предпочтительна для скошенных распределений.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h4 className="font-medium text-primary">Мода (Mo)</h4>
              <p className="text-xs text-muted-foreground">Наиболее частое значение. Единственная мера для номинальных данных. Может быть несколько мод.</p>
            </CardContent>
          </Card>
        </div>
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h5 className="font-medium mb-1">🧠 Пример из психологии</h5>
          <p className="text-muted-foreground text-xs">Результаты теста тревожности: 12, 15, 14, 13, 45. Среднее = 19.8 (искажено выбросом 45), медиана = 14 (точнее отражает типичный результат).</p>
        </div>
      </div>
    ),
  },
  {
    id: 'variability',
    title: 'Меры разброса',
    content: (
      <div className="space-y-4 text-sm leading-relaxed">
        <p>Показывают, насколько данные отклоняются от «типичного» значения.</p>
        <div className="space-y-3">
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Дисперсия и стандартное отклонение</h4>
              <MathFormula formula="S^2 = \frac{\sum(x_i - M)^2}{n - 1}, \quad SD = \sqrt{S^2}" />
              <p className="text-muted-foreground text-xs mt-2">SD в тех же единицах, что и данные. Делим на n−1 (поправка Бесселя) для несмещённой оценки.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Интерквартильный размах (IQR)</h4>
              <MathFormula formula="IQR = Q_3 - Q_1" />
              <p className="text-muted-foreground text-xs mt-2">Охватывает центральные 50% данных. Устойчив к выбросам. Выброс: значение за пределами Q₁ − 1.5·IQR или Q₃ + 1.5·IQR.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Стандартная ошибка среднего (SE)</h4>
              <MathFormula formula="SE = \frac{SD}{\sqrt{n}}" />
              <p className="text-muted-foreground text-xs mt-2">Показывает точность оценки среднего. Уменьшается с ростом n.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: 'shape',
    title: 'Форма распределения',
    content: (
      <div className="space-y-4 text-sm leading-relaxed">
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Асимметрия (Skewness)</h4>
              <p className="text-muted-foreground text-xs">Положительная — хвост вправо (зарплаты). Отрицательная — хвост влево (результаты лёгкого теста). |Sk| &lt; 0.5 — примерно симметрично.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Эксцесс (Kurtosis)</h4>
              <p className="text-muted-foreground text-xs">Excess kurtosis = 0 для нормального. Положительный — острый пик, тяжёлые хвосты. Отрицательный — плоский.</p>
            </CardContent>
          </Card>
        </div>
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h5 className="font-medium mb-1">📊 Как проверить нормальность?</h5>
          <ul className="text-muted-foreground text-xs list-disc pl-4 space-y-1">
            <li>Визуально: гистограмма + Q-Q plot</li>
            <li>Тест Шапиро-Уилка (n &lt; 50) или Колмогорова-Смирнова</li>
            <li>Проверить |skewness| &lt; 2 и |kurtosis| &lt; 7</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'visualization',
    title: 'Визуализация данных',
    content: (
      <div className="space-y-4 text-sm leading-relaxed">
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Гистограмма</h4>
              <p className="text-muted-foreground text-xs">Показывает форму распределения. Число столбцов ≈ √n. Позволяет увидеть бимодальность, асимметрию и выбросы.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Box plot (ящик с усами)</h4>
              <p className="text-muted-foreground text-xs">Показывает медиану, Q₁, Q₃, IQR и выбросы. Идеально для сравнения групп.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Q-Q plot</h4>
              <p className="text-muted-foreground text-xs">Квантиль-квантильный график. Точки на диагонали → данные нормальны. Отклонения → нарушение нормальности.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-primary mb-2">Scatter plot</h4>
              <p className="text-muted-foreground text-xs">Для двух количественных переменных. Выявляет линейные и нелинейные связи, кластеры и выбросы.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: 'calculator',
    title: 'Калькулятор',
    content: <DescriptiveCalculator />,
  },
  {
    id: 'jamovi',
    title: 'Jamovi',
    content: (
      <div className="space-y-6 text-sm leading-relaxed">
        <p>
          Пошаговое руководство по расчёту описательных статистик в программе Jamovi
          на основе учебника <em>«Learning Statistics with Jamovi»</em> (Navarro & Foxcroft).
          Все примеры используют набор данных <strong>aflsmall_margins.csv</strong> — данные о победных разницах (в очках)
          за 176 матчей сезона Австралийской Футбольной Лиги (AFL) 2010.
        </p>

        {/* Step 1: Computing Mean */}
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <h4 className="font-medium text-primary text-base">Шаг 1. Вычисление среднего (Mean)</h4>
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs">
                Среднее — обычное арифметическое среднее. Для первых 5 матчей (56, 31, 56, 8, 32):
              </p>
              <MathFormula formula="\bar{X} = \frac{56 + 31 + 56 + 8 + 32}{5} = \frac{183}{5} = 36.60" display />
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <p className="font-medium text-xs">📌 В Jamovi:</p>
                <ol className="text-muted-foreground text-xs list-decimal pl-4 space-y-1">
                  <li>Откройте файл <code className="bg-muted px-1 rounded">aflsmall_margins.csv</code></li>
                  <li>Перейдите в меню <strong>Analyses → Exploration → Descriptives</strong></li>
                  <li>Перенесите переменную <code className="bg-muted px-1 rounded">afl.margins</code> в поле <strong>Variables</strong> (стрелкой →)</li>
                  <li>В таблице результатов справа появятся: N = 176, Mean = <strong>35.30</strong>, Median, SD, Min, Max</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Median */}
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <h4 className="font-medium text-primary text-base">Шаг 2. Медиана (Median)</h4>
            <p className="text-muted-foreground text-xs">
              Медиана — «серединное» значение упорядоченного ряда. Для нечётного числа наблюдений это центральный элемент;
              для чётного — среднее двух центральных. Jamovi автоматически рассчитывает медиану — для данных AFL она составляет <strong>30.50</strong>.
            </p>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <h5 className="font-medium mb-1 text-xs">⚖️ Среднее vs Медиана</h5>
              <p className="text-muted-foreground text-xs">
                Среднее — «центр масс» данных (как точка баланса на весах). Медиана — наблюдение, делящее данные пополам.
                При асимметричном распределении среднее «тянется» к хвосту, а медиана остаётся ближе к «телу» данных.
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                <strong>Пример:</strong> Доходы Боба ($50K), Кейт ($60K) и Джейн ($65K) → среднее = $58,333, медиана = $60K.
                Приходит Билл ($100M) → среднее = $25,043,750, но медиана = всего $62,500. Медиана устойчива к выбросам!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Mode */}
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <h4 className="font-medium text-primary text-base">Шаг 3. Мода (Mode)</h4>
            <p className="text-muted-foreground text-xs">
              Мода — наиболее часто встречающееся значение. Это единственная мера центральной тенденции, применимая к <strong>номинальным</strong> данным.
            </p>
            <div className="p-3 bg-muted/50 rounded-lg space-y-1">
              <p className="font-medium text-xs">📌 В Jamovi:</p>
              <ol className="text-muted-foreground text-xs list-decimal pl-4 space-y-1">
                <li>В окне <strong>Descriptives</strong> раскройте раздел <strong>Statistics</strong></li>
                <li>Поставьте галочку <strong>Mode</strong></li>
                <li>Для переменной <code className="bg-muted px-1 rounded">afl.margins</code> мода = <strong>3</strong> (победа с разницей в 3 очка встречалась чаще всего)</li>
              </ol>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <h5 className="font-medium mb-1 text-xs">📊 Таблицы частот для номинальных переменных</h5>
              <p className="text-muted-foreground text-xs">
                Для текстовых переменных (например, названия команд в <code className="bg-muted px-1 rounded">afl.finalists</code>)
                Jamovi строит таблицу частот: поставьте галочку <strong>Frequency tables</strong>.
                Вы увидите, сколько раз каждая команда участвовала в финалах.
                Для номинальных данных среднее, медиана, минимум и максимум не рассчитываются.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Variability */}
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <h4 className="font-medium text-primary text-base">Шаг 4. Меры разброса</h4>

            <div className="space-y-3">
              <div>
                <h5 className="font-medium text-xs mb-1">Размах (Range)</h5>
                <p className="text-muted-foreground text-xs">
                  Разница между максимумом и минимумом. Для AFL: 116 − 0 = 116. Простой, но чувствительный к выбросам.
                </p>
              </div>

              <div>
                <h5 className="font-medium text-xs mb-1">Интерквартильный размах (IQR)</h5>
                <p className="text-muted-foreground text-xs">
                  Разница между 75-м и 25-м процентилями. В Jamovi: раскройте <strong>Statistics → Quartiles</strong>.
                </p>
                <MathFormula formula="IQR = Q_3 - Q_1 = 50.50 - 12.75 = 37.75" display />
                <p className="text-muted-foreground text-xs">
                  IQR охватывает «среднюю половину» данных — более устойчивая мера, чем размах.
                </p>
              </div>

              <div>
                <h5 className="font-medium text-xs mb-1">Дисперсия (Variance)</h5>
                <p className="text-muted-foreground text-xs">
                  Среднее квадратов отклонений от среднего. В Jamovi: <strong>Statistics → Variance</strong>.
                </p>
                <MathFormula formula="s^2 = \frac{\sum(X_i - \bar{X})^2}{N - 1}" display />
                <div className="p-3 bg-muted/50 rounded-lg mt-2">
                  <p className="text-xs text-muted-foreground">
                    <strong>⚠️ Важно:</strong> Jamovi делит на <strong>N − 1</strong>, а не на N! Это даёт <em>несмещённую</em> оценку
                    дисперсии популяции. Для 5 наблюдений (56, 31, 56, 8, 32): вручную делим на N → 324.64,
                    Jamovi делит на N−1 → <strong>405.80</strong>. Jamovi не ошибается — это корректная статистическая практика
                    (поправка Бесселя), которая используется для оценки популяционной дисперсии по выборке.
                  </p>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-xs mb-1">Стандартное отклонение (SD)</h5>
                <p className="text-muted-foreground text-xs">
                  Корень из дисперсии — возвращает к исходным единицам. Jamovi рассчитывает SD по умолчанию.
                </p>
                <MathFormula formula="s = \sqrt{s^2}" display />
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 mt-2">
                  <p className="text-xs font-medium mb-1">📏 Правило интерпретации SD:</p>
                  <ul className="text-muted-foreground text-xs list-disc pl-4 space-y-0.5">
                    <li>≈ 68% данных лежит в пределах ±1 SD от среднего</li>
                    <li>≈ 95% данных — в пределах ±2 SD</li>
                    <li>≈ 99.7% данных — в пределах ±3 SD</li>
                  </ul>
                  <p className="text-muted-foreground text-xs mt-1">
                    Для AFL: 65.3% данных лежат в пределах 1 SD от среднего — близко к 68%.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 5: Skewness & Kurtosis */}
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <h4 className="font-medium text-primary text-base">Шаг 5. Асимметрия и эксцесс в Jamovi</h4>
            <div className="p-3 bg-muted/50 rounded-lg space-y-1">
              <p className="font-medium text-xs">📌 В Jamovi:</p>
              <ol className="text-muted-foreground text-xs list-decimal pl-4 space-y-1">
                <li>В <strong>Exploration → Descriptives → Statistics</strong> поставьте галочки <strong>Skewness</strong> и <strong>Kurtosis</strong></li>
                <li>Для <code className="bg-muted px-1 rounded">afl.margins</code>: Skewness = <strong>0.780</strong> (SE = 0.183), Kurtosis = <strong>0.101</strong> (SE = 0.364)</li>
              </ol>
            </div>
            <div className="grid md:grid-cols-2 gap-3 mt-2">
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <h5 className="font-medium text-xs mb-1">📐 Интерпретация асимметрии</h5>
                <p className="text-muted-foreground text-xs">
                  Разделите Skewness на Std. Error: 0.780 / 0.183 = <strong>4.26</strong>.
                  Значение &gt; 2 указывает на существенную асимметрию.
                  Данные AFL умеренно положительно скошены (хвост вправо).
                </p>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <h5 className="font-medium text-xs mb-1">📐 Интерпретация эксцесса</h5>
                <p className="text-muted-foreground text-xs">
                  Kurtosis = 0.101 — почти нулевой (мезокуртический).
                  Отрицательный → плоские хвосты (платикуртический).
                  Положительный → тяжёлые хвосты (лептокуртический).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 6: Split by groups */}
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <h4 className="font-medium text-primary text-base">Шаг 6. Описательные статистики по группам (Split by)</h4>
            <p className="text-muted-foreground text-xs">
              В учебнике используется набор данных <strong>clinicaltrial.csv</strong> для демонстрации группового анализа.
              Данные содержат переменные: <code className="bg-muted px-1 rounded">drug</code> (placebo / anxifree / joyzepam),
              <code className="bg-muted px-1 rounded">therapy</code> (CBT / no therapy) и <code className="bg-muted px-1 rounded">mood.gain</code>.
            </p>
            <div className="p-3 bg-muted/50 rounded-lg space-y-1">
              <p className="font-medium text-xs">📌 В Jamovi:</p>
              <ol className="text-muted-foreground text-xs list-decimal pl-4 space-y-1">
                <li>Откройте <code className="bg-muted px-1 rounded">clinicaltrial.csv</code></li>
                <li>В <strong>Descriptives</strong> перенесите <code className="bg-muted px-1 rounded">mood.gain</code> в <strong>Variables</strong></li>
                <li>Перенесите <code className="bg-muted px-1 rounded">therapy</code> в поле <strong>Split by</strong></li>
                <li>Теперь таблица показывает отдельные статистики для каждого типа терапии</li>
                <li>Можно добавить несколько переменных в «Split by» (например, drug + therapy) для перекрёстного анализа</li>
              </ol>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground">
                <strong>⚠️</strong> Если при разбивке по нескольким группам в ячейке мало данных,
                Jamovi может показать <code className="bg-muted px-1 rounded">NaN</code> или <code className="bg-muted px-1 rounded">Inf</code> — это нормально,
                просто недостаточно наблюдений для расчёта.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 7: Standard scores */}
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <h4 className="font-medium text-primary text-base">Шаг 7. Стандартные оценки (z-scores)</h4>
            <p className="text-muted-foreground text-xs">
              Стандартная оценка показывает, на сколько стандартных отклонений наблюдение отстоит от среднего:
            </p>
            <MathFormula formula="z_i = \frac{X_i - \bar{X}}{s}" display />
            <p className="text-muted-foreground text-xs">
              <strong>Пример:</strong> Опросник «ворчливости» — средняя = 17, SD = 5, ваш балл = 35:
            </p>
            <MathFormula formula="z = \frac{35 - 17}{5} = 3.6" display />
            <p className="text-muted-foreground text-xs">
              z = 3.6 означает, что вы на 3.6 стандартных отклонения выше среднего — это выше 99.98% людей.
              Z-оценки позволяют сравнивать переменные с разными шкалами (например, «ворчливость» и «экстраверсию»).
            </p>
          </CardContent>
        </Card>

        {/* Step 8: Graphs */}
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <h4 className="font-medium text-primary text-base">Шаг 8. Построение графиков в Jamovi</h4>
            <p className="text-muted-foreground text-xs">
              В окне <strong>Descriptives</strong> раскройте раздел <strong>Plots</strong> для доступа к графикам.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <h5 className="font-medium text-xs mb-1">📊 Гистограмма (Histogram)</h5>
                <p className="text-muted-foreground text-xs">
                  Поставьте галочку <strong>Histogram</strong>. Показывает форму распределения — можно оценить асимметрию и модальность.
                  Дополнительно: галочка <strong>Density</strong> отрисует сглаженную кривую плотности вместо столбцов.
                  Кривая плотности менее чувствительна к выбору числа интервалов.
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h5 className="font-medium text-xs mb-1">📦 Box plot (ящик с усами)</h5>
                <p className="text-muted-foreground text-xs">
                  Поставьте галочку <strong>Box plot</strong>. Толстая линия — медиана; коробка — от Q₁ до Q₃;
                  «усы» — до 1.5 × IQR от границ коробки. Точки за пределами — <strong>выбросы</strong>.
                  Чтобы подписать выбросы номером строки, отметьте чекбокс рядом с «Box plot».
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h5 className="font-medium text-xs mb-1">🎻 Violin plot</h5>
                <p className="text-muted-foreground text-xs">
                  Поставьте одновременно <strong>Violin</strong> и <strong>Box plot</strong> — получите box plot
                  внутри графика плотности. Дополнительно: <strong>Data</strong> покажет отдельные точки данных на графике.
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h5 className="font-medium text-xs mb-1">📊 Bar plot</h5>
                <p className="text-muted-foreground text-xs">
                  Для номинальных переменных. Поставьте <strong>Bar plot</strong> — покажет частоту каждой категории.
                  Используйте <strong>Filters</strong> для выбора только нужных категорий
                  (например: <code className="bg-muted px-1 rounded text-[10px]">afl.finalists == 'Carlton'</code>).
                </p>
              </div>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 mt-2">
              <h5 className="font-medium text-xs mb-1">📋 Графики по группам</h5>
              <p className="text-muted-foreground text-xs">
                Если переменная указана в <strong>Split by</strong>, графики строятся отдельно для каждой группы.
                Например, box plot для <code className="bg-muted px-1 rounded">afl.margins</code>, разбитый по годам, показывает
                распределение победных разниц за каждый сезон — компактнее, чем 24 отдельных гистограммы.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 9: Detecting Outliers */}
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <h4 className="font-medium text-primary text-base">Шаг 9. Обнаружение выбросов и фильтрация</h4>
            <p className="text-muted-foreground text-xs">
              Box plot автоматически отмечает выбросы точками. Для детального анализа:
            </p>
            <div className="p-3 bg-muted/50 rounded-lg space-y-1">
              <ol className="text-muted-foreground text-xs list-decimal pl-4 space-y-1">
                <li>Нажмите кнопку <strong>Filters</strong> в верхней части Jamovi</li>
                <li>Введите условие, например: <code className="bg-muted px-1 rounded">margin &gt; 300</code></li>
                <li>Jamovi отфильтрует данные — останутся только строки, удовлетворяющие условию</li>
                <li>Используйте <strong>Frequency tables</strong> для идентификации номеров строк подозрительных наблюдений</li>
                <li>Проверьте, не является ли выброс ошибкой ввода данных</li>
              </ol>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground">
                <strong>💡 Совет:</strong> «Очистка данных» (data cleaning) — поиск опечаток, пропусков и ошибок —
                на практике может занимать значительную часть времени анализа. Всегда проверяйте данные перед основным анализом!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Saving */}
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <h4 className="font-medium text-primary text-base">Шаг 10. Сохранение графиков</h4>
            <p className="text-muted-foreground text-xs">
              Для экспорта графика: щёлкните правой кнопкой мыши по изображению → выберите формат:
              <strong> PNG</strong>, <strong>EPS</strong>, <strong>SVG</strong> или <strong>PDF</strong>.
              Эти форматы подходят для вставки в отчёты, статьи и презентации.
            </p>
          </CardContent>
        </Card>
      </div>
    ),
  },
];

const quizQuestions: import('@/components/Quiz').QuizQuestion[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'Данные: 2, 3, 3, 5, 100. Какая мера центра лучше?',
    options: ['Среднее', 'Медиана', 'Мода', 'Размах'],
    correctAnswer: 1,
    explanation: 'Медиана = 3 — устойчива к выбросу (100). Среднее = 22.6 — сильно искажено.',
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    question: 'Что показывает стандартная ошибка (SE)?',
    options: [
      'Разброс отдельных наблюдений',
      'Точность оценки среднего',
      'Размер эффекта',
      'Вероятность ошибки I рода',
    ],
    correctAnswer: 1,
    explanation: 'SE = SD/√n показывает, насколько точно выборочное среднее оценивает истинное среднее популяции.',
  },
  {
    id: 'q3',
    type: 'multiple-choice',
    question: 'При положительной асимметрии (skewness > 0):',
    options: [
      'Хвост влево, M < Me',
      'Хвост вправо, M > Me',
      'Распределение симметрично',
      'Хвост вправо, M < Me',
    ],
    correctAnswer: 1,
    explanation: 'Положительная асимметрия = длинный хвост вправо. Среднее «тянется» к хвосту и становится больше медианы.',
  },
  {
    id: 'q4',
    type: 'multiple-choice',
    question: 'Коэффициент вариации (CV) полезен для:',
    options: [
      'Проверки нормальности',
      'Сравнения разброса переменных с разными единицами',
      'Определения выбросов',
      'Расчёта p-value',
    ],
    correctAnswer: 1,
    explanation: 'CV = (SD/M)·100% — безразмерная мера, позволяет сравнивать вариабельность разных шкал.',
  },
];

const DescriptiveStatsCourse = () => {
  const [progress] = useState(() => getProgress());
  const completedTopics = progress.completedCourseTopics['descriptive'] || [];

  const handleTopicComplete = (topicId: string) => {
    markTopicCompleted('descriptive', topicId);
    // Force re-render by updating page
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container py-8 max-w-4xl">
        <div className="mb-6">
          <Link to="/courses">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Назад к курсам
            </Button>
          </Link>
        </div>

        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-heading text-3xl font-bold mb-2">Описательная статистика</h1>
          <p className="text-muted-foreground text-lg">
            Меры центральной тенденции, разброса и формы распределения
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Badge variant="secondary">{completedTopics.length}/{topics.length} тем</Badge>
            <div className="flex-1 max-w-xs h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(completedTopics.length / topics.length) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <Tabs defaultValue={topics[0].id} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            {topics.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="gap-2">
                {completedTopics.includes(t.id)
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  : <Circle className="w-3.5 h-3.5" />}
                {t.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {topics.map((t) => (
            <TabsContent key={t.id} value={t.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{t.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {t.content}
                  {!completedTopics.includes(t.id) && (
                    <Button
                      className="mt-6"
                      onClick={() => handleTopicComplete(t.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Отметить как изученное
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
        </motion.div>

        {/* Quiz */}
        <motion.div className="mt-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
          <h2 className="font-heading text-2xl font-bold mb-4">Проверьте себя</h2>
          <Quiz
            questions={quizQuestions}
            title="Квиз: Описательная статистика"
          />
        </motion.div>

        {/* Link to calculator */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
        <Card className="mt-8">
          <CardContent className="py-6 flex items-center justify-between">
            <div>
              <h3 className="font-medium">Практика</h3>
              <p className="text-sm text-muted-foreground">Попробуйте калькулятор описательной статистики с вашими данными</p>
            </div>
            <Link to="/descriptive">
              <Button variant="outline">Открыть калькулятор</Button>
            </Link>
          </CardContent>
        </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default DescriptiveStatsCourse;
