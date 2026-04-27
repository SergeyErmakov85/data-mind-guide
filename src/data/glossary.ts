/**
 * Глоссарий-энциклопедия по математической статистике для психологов.
 *
 * Категории (4 класса по требованию):
 *   descriptive — описательная статистика
 *   inference   — статистический вывод (гипотезы, оценивание)
 *   effect      — размер эффекта
 *   design      — дизайн исследования и данные
 */

export type GlossaryCategory = 'descriptive' | 'inference' | 'effect' | 'design';

export const CATEGORY_LABEL: Record<GlossaryCategory, string> = {
  descriptive: 'Описательная',
  inference: 'Вывод',
  effect: 'Размер эффекта',
  design: 'Дизайн исследования',
};

export interface GlossaryOccurrence {
  /** Человеко-читаемое название раздела */
  label: string;
  /** Внутренний путь приложения */
  to: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  /** Альтернативные названия (для поиска) */
  aliases?: readonly string[];
  category: GlossaryCategory;
  /** Короткое определение (1-2 предложения, для карточки) */
  short: string;
  /** Полное определение (для страницы термина) */
  long: string;
  /** Формула в KaTeX (без $$). */
  formula?: string;
  /** id связанных терминов */
  related?: readonly string[];
  /** Где встречается на сайте */
  occurrences?: readonly GlossaryOccurrence[];
}

export const GLOSSARY: readonly GlossaryTerm[] = [
  /* ─────────────── Описательная ─────────────── */
  {
    id: 'mean',
    term: 'Среднее арифметическое',
    aliases: ['mean', 'M', 'среднее'],
    category: 'descriptive',
    short: 'Сумма всех значений, делённая на их количество.',
    long: 'Самая распространённая мера центральной тенденции. Чувствительно к выбросам — один экстремально большой респондент может сильно «потянуть» среднее. В психологии используют, когда данные количественные и распределение близко к симметричному.',
    formula: 'M = \\frac{1}{n}\\sum_{i=1}^{n} x_i',
    related: ['median', 'mode', 'sd', 'variance'],
    occurrences: [
      { label: 'Описательная статистика', to: '/courses/descriptive' },
      { label: 'Калькулятор описательных', to: '/descriptive' },
    ],
  },
  {
    id: 'median',
    term: 'Медиана',
    aliases: ['median', 'Me'],
    category: 'descriptive',
    short: 'Значение, делящее упорядоченный ряд пополам. Устойчива к выбросам.',
    long: 'Если данные расположить по возрастанию, медиана — центральное значение (для нечётного n) или среднее двух центральных (для чётного). Предпочтительнее среднего при асимметричных распределениях и для порядковых шкал.',
    related: ['mean', 'mode', 'skewness'],
    occurrences: [{ label: 'Описательная статистика', to: '/courses/descriptive' }],
  },
  {
    id: 'mode',
    term: 'Мода',
    aliases: ['mode', 'Mo'],
    category: 'descriptive',
    short: 'Наиболее часто встречающееся значение в наборе данных.',
    long: 'Единственная мера центральной тенденции, применимая к номинальным данным. Распределение может иметь несколько мод (бимодальное, мультимодальное) или вовсе её не иметь.',
    related: ['mean', 'median'],
    occurrences: [{ label: 'Описательная статистика', to: '/courses/descriptive' }],
  },
  {
    id: 'variance',
    term: 'Дисперсия',
    aliases: ['variance', 'S²', 's2'],
    category: 'descriptive',
    short: 'Среднее квадратов отклонений значений от среднего.',
    long: 'Мера разброса данных. В выборочной формуле в знаменателе стоит n−1 (поправка Бесселя) для несмещённой оценки. Единицы измерения — квадратные, поэтому на практике чаще используют SD (квадратный корень).',
    formula: 'S^2 = \\frac{1}{n-1}\\sum_{i=1}^{n} (x_i - M)^2',
    related: ['sd', 'mean', 'se'],
    occurrences: [{ label: 'Описательная статистика', to: '/courses/descriptive' }],
  },
  {
    id: 'sd',
    term: 'Стандартное отклонение',
    aliases: ['SD', 'standard deviation', 'σ'],
    category: 'descriptive',
    short: 'Корень из дисперсии. Типичное отклонение от среднего в исходных единицах.',
    long: 'Если данные нормально распределены, около 68% наблюдений лежат в пределах M ± SD, 95% — в пределах M ± 2·SD (правило 68-95-99.7).',
    formula: 'SD = \\sqrt{S^2}',
    related: ['variance', 'se', 'normal', 'mean'],
    occurrences: [
      { label: 'Описательная статистика', to: '/courses/descriptive' },
      { label: 'Лаба: ЦПТ', to: '/labs/clt' },
    ],
  },
  {
    id: 'skewness',
    term: 'Асимметрия',
    aliases: ['skewness'],
    category: 'descriptive',
    short: 'Мера несимметричности распределения.',
    long: 'Положительная асимметрия — длинный хвост вправо (типично для доходов, времени реакции). Отрицательная — хвост влево. Для нормального распределения skewness = 0.',
    related: ['kurtosis', 'normal', 'median'],
  },
  {
    id: 'kurtosis',
    term: 'Эксцесс',
    aliases: ['kurtosis'],
    category: 'descriptive',
    short: 'Мера «тяжести хвостов» распределения.',
    long: 'Excess kurtosis нормального распределения = 0. Положительный (лептокуртическое) — острый пик и тяжёлые хвосты, выбросы вероятнее. Отрицательный (платикуртическое) — плоское распределение.',
    related: ['skewness', 'normal'],
  },

  /* ─────────────── Вывод ─────────────── */
  {
    id: 'h0',
    term: 'Нулевая гипотеза',
    aliases: ['H0', 'H₀', 'null hypothesis'],
    category: 'inference',
    short: 'Гипотеза об отсутствии эффекта или различий.',
    long: 'Принимается «по умолчанию» и проверяется данными. Цель исследования обычно — её отвергнуть. Важно: невозможность отвергнуть H₀ ≠ доказательство её истинности.',
    related: ['h1', 'p-value', 'alpha', 'beta'],
    occurrences: [
      { label: 'Лаба: проверка гипотез', to: '/labs/hypothesis' },
      { label: 'Теория', to: '/theory' },
    ],
  },
  {
    id: 'h1',
    term: 'Альтернативная гипотеза',
    aliases: ['H1', 'H₁', 'alternative hypothesis'],
    category: 'inference',
    short: 'Гипотеза о наличии эффекта или различий.',
    long: 'Принимается при отвержении H₀. Может быть направленной (одностороннее «больше/меньше») или ненаправленной (двустороннее «не равно»).',
    related: ['h0', 'power'],
    occurrences: [{ label: 'Лаба: проверка гипотез', to: '/labs/hypothesis' }],
  },
  {
    id: 'p-value',
    term: 'p-значение',
    aliases: ['p-value', 'p'],
    category: 'inference',
    short: 'Вероятность получить наблюдаемый или более экстремальный результат, если H₀ верна.',
    long: 'Низкое p-значение говорит о том, что данные слабо согласуются с нулевой гипотезой. p < α обычно интерпретируется как «статистически значимо». ВАЖНО: p — это НЕ вероятность того, что H₀ верна.',
    related: ['alpha', 'h0', 'power'],
    occurrences: [{ label: 'Лаба: проверка гипотез', to: '/labs/hypothesis' }],
  },
  {
    id: 'alpha',
    term: 'Уровень значимости (α)',
    aliases: ['alpha', 'α', 'ошибка I рода'],
    category: 'inference',
    short: 'Заранее заданный порог для отвержения H₀; вероятность ошибки I рода.',
    long: 'Стандартное значение α = 0.05 — компромисс, идущий от Фишера. Это вероятность ложно отвергнуть верную H₀ (false positive).',
    related: ['beta', 'p-value', 'power', 'h0'],
    occurrences: [
      { label: 'Калькулятор объёма выборки', to: '/sample-size' },
      { label: 'Лаба: проверка гипотез', to: '/labs/hypothesis' },
    ],
  },
  {
    id: 'beta',
    term: 'Ошибка II рода (β)',
    aliases: ['beta', 'β'],
    category: 'inference',
    short: 'Вероятность не отвергнуть ложную H₀ (false negative).',
    long: 'Связана с мощностью соотношением Power = 1 − β. Чем меньше выборка и меньше истинный эффект, тем больше β.',
    related: ['power', 'alpha', 'h0'],
  },
  {
    id: 'power',
    term: 'Мощность теста',
    aliases: ['power', '1-β', 'statistical power'],
    category: 'inference',
    short: 'Вероятность обнаружить реальный эффект, если он существует.',
    long: 'Cohen (1988) рекомендовал минимум 0.80. Зависит от: размера выборки n, размера эффекта, α и одно/двусторонности теста.',
    formula: '\\text{Power} = 1 - \\beta',
    related: ['beta', 'alpha', 'cohen-d', 'h1'],
    occurrences: [
      { label: 'Калькулятор объёма выборки', to: '/sample-size' },
      { label: 'Лаба: проверка гипотез', to: '/labs/hypothesis' },
    ],
  },
  {
    id: 'ci',
    term: 'Доверительный интервал',
    aliases: ['CI', 'confidence interval'],
    category: 'inference',
    short: 'Диапазон, в котором с заданной уверенностью лежит истинный параметр.',
    long: '95% CI — это интервал, построенный методом, который при многократном повторении исследования в 95% случаев накроет истинный параметр. Это НЕ «вероятность 95%, что параметр в данном интервале».',
    formula: 'CI = M \\pm z_{\\alpha/2} \\cdot SE',
    related: ['se', 'mean', 'alpha'],
    occurrences: [{ label: 'Лаба: доверительные интервалы', to: '/labs/confidence' }],
  },
  {
    id: 'se',
    term: 'Стандартная ошибка',
    aliases: ['SE', 'standard error'],
    category: 'inference',
    short: 'Стандартное отклонение выборочного распределения статистики.',
    long: 'Показывает точность оценки параметра. SE среднего убывает как 1/√n — чтобы вдвое уменьшить ошибку, нужно увеличить выборку в 4 раза.',
    formula: 'SE = \\frac{SD}{\\sqrt{n}}',
    related: ['sd', 'ci', 'clt'],
    occurrences: [{ label: 'Лаба: ЦПТ', to: '/labs/clt' }],
  },
  {
    id: 'clt',
    term: 'Центральная предельная теорема',
    aliases: ['CLT', 'ЦПТ', 'central limit theorem'],
    category: 'inference',
    short: 'Распределение выборочных средних стремится к нормальному при росте n.',
    long: 'Работает независимо от формы исходного распределения (при конечной дисперсии). Обычно n ≥ 30 считается достаточным. Это фундамент почти всех параметрических тестов.',
    related: ['normal', 'se', 'sd'],
    occurrences: [{ label: 'Лаба: ЦПТ', to: '/labs/clt' }],
  },
  {
    id: 'normal',
    term: 'Нормальное распределение',
    aliases: ['normal', 'Gaussian', 'Гаусса'],
    category: 'inference',
    short: 'Симметричное колоколообразное распределение, заданное μ и σ.',
    long: 'Описывает многие психологические переменные: IQ, время реакции (после трансформации), результаты тестов. Правило 68-95-99.7 — доли наблюдений в ±1, ±2, ±3 SD.',
    related: ['clt', 'sd', 'skewness', 'kurtosis'],
    occurrences: [
      { label: 'Библиотека визуализаций', to: '/visualizations' },
      { label: 'Лаба: ЦПТ', to: '/labs/clt' },
    ],
  },
  {
    id: 't-test',
    term: 't-тест Стьюдента',
    aliases: ["t-test", "Student's t"],
    category: 'inference',
    short: 'Критерий для сравнения средних: одновыборочный, парный, независимых выборок.',
    long: 'Использует t-распределение, форма которого зависит от df. Параметрический — требует приближённой нормальности и (для независимого) гомогенности дисперсий. При нарушениях — Welch или непараметрические аналоги.',
    related: ['cohen-d', 'p-value', 'normal'],
    occurrences: [{ label: 'Лаба: t-тест', to: '/labs/ttest' }],
  },
  {
    id: 'anova',
    term: 'ANOVA',
    aliases: ['ANOVA', 'дисперсионный анализ', 'F-test'],
    category: 'inference',
    short: 'Дисперсионный анализ для сравнения средних трёх и более групп.',
    long: 'Использует F-статистику — отношение межгрупповой дисперсии к внутригрупповой. Значимый F говорит лишь о том, что хотя бы одна пара различается; для уточнения нужны post-hoc тесты (Tukey, Bonferroni).',
    related: ['t-test', 'eta-sq', 'cohen-f'],
    occurrences: [{ label: 'Лаба: ANOVA', to: '/labs/anova' }],
  },
  {
    id: 'chi-square',
    term: 'Хи-квадрат',
    aliases: ['chi-square', 'χ²', 'хи квадрат'],
    category: 'inference',
    short: 'Критерий для категориальных данных. Сравнивает наблюдаемые и ожидаемые частоты.',
    long: 'Два основных применения: критерий согласия (goodness of fit) и критерий независимости (contingency table). Требует ожидаемых частот ≥ 5 в каждой ячейке.',
    formula: '\\chi^2 = \\sum \\frac{(O_i - E_i)^2}{E_i}',
    related: ['cramers-v', 'p-value'],
    occurrences: [
      { label: 'Курс χ²', to: '/courses/chisquare' },
      { label: 'Лаба: χ²', to: '/labs/chisquare' },
    ],
  },
  {
    id: 'pearson-r',
    term: 'Коэффициент корреляции Пирсона',
    aliases: ['r', 'Pearson', "Pearson's r"],
    category: 'inference',
    short: 'Мера линейной связи двух количественных переменных. Диапазон [−1; 1].',
    long: 'r = 0 — линейной связи нет (но может быть нелинейная). r = ±1 — идеальная линейная связь. Чувствителен к выбросам и предполагает приближённую двумерную нормальность.',
    formula: 'r = \\frac{\\sum (x_i - \\bar x)(y_i - \\bar y)}{\\sqrt{\\sum (x_i - \\bar x)^2 \\sum (y_i - \\bar y)^2}}',
    related: ['spearman', 'r-squared', 'regression'],
    occurrences: [{ label: 'Лаба: корреляция', to: '/labs/correlation' }],
  },
  {
    id: 'spearman',
    term: 'Коэффициент Спирмена',
    aliases: ['Spearman', 'rho', 'ρ'],
    category: 'inference',
    short: 'Ранговая корреляция; измеряет монотонную (не обязательно линейную) связь.',
    long: 'Пирсон, применённый к рангам. Устойчив к выбросам и работает с порядковыми данными. Используется при нарушениях нормальности.',
    related: ['pearson-r'],
    occurrences: [{ label: 'Лаба: корреляция', to: '/labs/correlation' }],
  },
  {
    id: 'regression',
    term: 'Регрессионный коэффициент',
    aliases: ['β', 'b', 'slope', 'регрессия'],
    category: 'inference',
    short: 'Показывает, на сколько единиц изменится Y при увеличении X на 1.',
    long: 'Стандартизованный β (бета) — изменение Y в SD при изменении X на 1 SD; позволяет сравнивать вклад предикторов с разными шкалами.',
    related: ['pearson-r', 'r-squared', 'residuals'],
    occurrences: [{ label: 'Лаба: регрессия', to: '/labs/regression' }],
  },
  {
    id: 'residuals',
    term: 'Остатки',
    aliases: ['residuals'],
    category: 'inference',
    short: 'Разность между наблюдаемым и предсказанным значением: eᵢ = yᵢ − ŷᵢ.',
    long: 'Анализ остатков — главный инструмент диагностики регрессии: проверка на нормальность, гомоскедастичность, автокорреляцию.',
    formula: 'e_i = y_i - \\hat y_i',
    related: ['regression', 'r-squared'],
    occurrences: [{ label: 'Лаба: регрессия', to: '/labs/regression' }],
  },

  /* ─────────────── Размер эффекта ─────────────── */
  {
    id: 'cohen-d',
    term: 'd Коэна',
    aliases: ['Cohen d', "Cohen's d", 'd'],
    category: 'effect',
    short: 'Размер эффекта для разности двух средних в единицах SD.',
    long: 'Условные ориентиры: 0.2 — малый, 0.5 — средний, 0.8 — большой. В психологии очень малые d (<0.1) часто практически бессмысленны даже при p<0.05.',
    formula: 'd = \\frac{M_1 - M_2}{SD_{pooled}}',
    related: ['t-test', 'power', 'effect-size'],
    occurrences: [
      { label: 'Лаба: размер эффекта', to: '/labs/effect-size' },
      { label: 'Калькулятор объёма выборки', to: '/sample-size' },
    ],
  },
  {
    id: 'cohen-f',
    term: 'f Коэна',
    aliases: ['Cohen f', "Cohen's f", 'f'],
    category: 'effect',
    short: 'Размер эффекта для ANOVA.',
    long: 'Ориентиры: 0.10 — малый, 0.25 — средний, 0.40 — большой. Связан с η² соотношением f² = η² / (1−η²).',
    formula: 'f = \\sqrt{\\frac{\\eta^2}{1 - \\eta^2}}',
    related: ['anova', 'eta-sq', 'power'],
    occurrences: [{ label: 'Калькулятор объёма выборки', to: '/sample-size' }],
  },
  {
    id: 'cohen-w',
    term: 'w Коэна',
    aliases: ['Cohen w', 'w'],
    category: 'effect',
    short: 'Размер эффекта для χ²-критерия.',
    long: 'Ориентиры: 0.1 — малый, 0.3 — средний, 0.5 — большой. λ = n·w² — параметр нецентральности для расчёта мощности.',
    related: ['chi-square', 'power', 'cramers-v'],
    occurrences: [{ label: 'Калькулятор объёма выборки', to: '/sample-size' }],
  },
  {
    id: 'eta-sq',
    term: 'η² (эта-квадрат)',
    aliases: ['eta-squared', 'η²'],
    category: 'effect',
    short: 'Доля общей дисперсии, объяснённая фактором в ANOVA.',
    long: 'Аналог R² для ANOVA. Завышается на маленьких выборках — для коррекции используют ω² или ε².',
    formula: '\\eta^2 = \\frac{SS_{between}}{SS_{total}}',
    related: ['anova', 'r-squared', 'cohen-f'],
  },
  {
    id: 'r-squared',
    term: 'Коэффициент детерминации',
    aliases: ['R²', 'R-squared', 'R2'],
    category: 'effect',
    short: 'Доля дисперсии Y, объяснённая моделью. R² = r² для парной регрессии.',
    long: 'Принимает значения от 0 до 1. Скорректированный R² (adjusted R²) штрафует за число предикторов и предпочтительнее при сравнении моделей.',
    formula: 'R^2 = \\frac{SS_{reg}}{SS_{total}}',
    related: ['regression', 'pearson-r', 'eta-sq'],
    occurrences: [{ label: 'Лаба: регрессия', to: '/labs/regression' }],
  },
  {
    id: 'cramers-v',
    term: "V Крамера",
    aliases: ["Cramer's V", "Cramér's V"],
    category: 'effect',
    short: 'Размер эффекта для хи-квадрат. Диапазон [0; 1].',
    long: 'Удобен для интерпретации силы связи в таблицах сопряжённости любой размерности.',
    formula: 'V = \\sqrt{\\frac{\\chi^2}{n \\cdot (\\min(r, c) - 1)}}',
    related: ['chi-square', 'cohen-w'],
  },
  {
    id: 'effect-size',
    term: 'Размер эффекта',
    aliases: ['effect size', 'ES'],
    category: 'effect',
    short: 'Стандартизованная мера величины наблюдаемого явления.',
    long: 'В отличие от p-значения, не зависит от объёма выборки и позволяет оценить практическую значимость. APA рекомендует всегда сообщать размер эффекта вместе с p.',
    related: ['cohen-d', 'cohen-f', 'eta-sq', 'r-squared'],
    occurrences: [{ label: 'Лаба: размер эффекта', to: '/labs/effect-size' }],
  },

  /* ─────────────── Дизайн исследования ─────────────── */
  {
    id: 'population',
    term: 'Генеральная совокупность',
    aliases: ['population', 'популяция'],
    category: 'design',
    short: 'Полная совокупность всех объектов, о которых делается вывод.',
    long: 'В психологии это, например, «все взрослые носители русского языка». Параметры популяции (μ, σ) обычно неизвестны и оцениваются по выборке.',
    related: ['sample', 'mean'],
    occurrences: [{ label: 'Лаба: выборка', to: '/labs/sampling' }],
  },
  {
    id: 'sample',
    term: 'Выборка',
    aliases: ['sample'],
    category: 'design',
    short: 'Подмножество популяции, отобранное для исследования.',
    long: 'Качество выводов критически зависит от репрезентативности выборки. Случайный отбор — золотой стандарт; в реальности часто используется выборка удобства, что ограничивает генерализуемость.',
    related: ['population', 'sample-size'],
    occurrences: [{ label: 'Лаба: выборка', to: '/labs/sampling' }],
  },
  {
    id: 'sample-size',
    term: 'Объём выборки',
    aliases: ['n', 'sample size'],
    category: 'design',
    short: 'Число наблюдений в выборке. Определяет точность и мощность.',
    long: 'Расчёт n до начала исследования (a priori power analysis) — обязательная часть планирования. Слишком маленькая n → низкая мощность; слишком большая → этический и финансовый перерасход.',
    related: ['power', 'sample', 'alpha'],
    occurrences: [{ label: 'Калькулятор объёма выборки', to: '/sample-size' }],
  },
  {
    id: 'binomial',
    term: 'Биномиальное распределение',
    aliases: ['binomial'],
    category: 'design',
    short: 'Распределение числа успехов в n испытаниях Бернулли с вероятностью p.',
    long: 'Базовая модель для дихотомических исходов: «правильно/неправильно», «согласен/не согласен». При больших n приближается к нормальному (теорема Муавра-Лапласа).',
    formula: 'P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}',
    related: ['normal', 'clt'],
    occurrences: [{ label: 'Лаба: биномиальное', to: '/labs/binomial' }],
  },
] as const;

export const GLOSSARY_BY_ID: Readonly<Record<string, GlossaryTerm>> = Object.freeze(
  Object.fromEntries(GLOSSARY.map((t) => [t.id, t])),
);

/** Сколько раз id данного термина упоминается в related[] других. */
export const incomingLinks = (id: string): number =>
  GLOSSARY.reduce(
    (acc, t) => acc + (t.related?.includes(id) ? 1 : 0),
    0,
  );

/** Общее число связей: own related + входящие. */
export const totalLinks = (term: GlossaryTerm): number =>
  (term.related?.length ?? 0) + incomingLinks(term.id);
