/**
 * Centralized statistical glossary used by:
 *  - GlossaryPage (full grid + search + URL anchors)
 *  - <TermTip /> (HoverCard inline tips)
 *  - <AutoTermify /> (auto-wraps term/aliases inside long prose)
 *
 * IDs are slugs (latin, kebab-case) and are used as URL anchors:
 *   /glossary#p-value
 */

export type GlossaryCategory = 'descriptive' | 'inference' | 'effect' | 'design';

export interface GlossaryEntry {
  id: string;
  term: string;
  short: string;
  full: string;
  aliases: string[];
  relatedIds: string[];
  category: GlossaryCategory;
  formula?: string;
}

export const CATEGORY_LABELS: Record<GlossaryCategory, string> = {
  descriptive: 'Описательная статистика',
  inference: 'Вывод и проверка гипотез',
  effect: 'Размер эффекта',
  design: 'Дизайн исследования',
};

export const glossary: GlossaryEntry[] = [
  // -------------------- DESCRIPTIVE --------------------
  {
    id: 'mean',
    term: 'Среднее арифметическое',
    short: 'Сумма всех значений, делённая на их количество.',
    full: 'Среднее (M) — самая популярная мера центральной тенденции для интервальных и абсолютных шкал. Чувствительно к выбросам: одно экстремальное значение может заметно сместить M, поэтому для скошенных распределений лучше отчитывать медиану.',
    aliases: ['среднее', 'среднее значение', 'mean', 'M', 'µ'],
    relatedIds: ['median', 'sd', 'outlier', 'skewness'],
    category: 'descriptive',
    formula: 'M = \\frac{1}{n}\\sum_{i=1}^{n} x_i',
  },
  {
    id: 'median',
    term: 'Медиана',
    short: 'Значение, делящее упорядоченный ряд пополам.',
    full: 'Медиана (Mdn) — устойчивая к выбросам мера центра. Для нечётного n берётся центральный элемент упорядоченного ряда, для чётного — среднее двух центральных. Подходит для порядковых шкал и скошенных распределений.',
    aliases: ['медиана', 'Mdn', 'median', 'Me'],
    relatedIds: ['mean', 'iqr', 'skewness'],
    category: 'descriptive',
  },
  {
    id: 'mode',
    term: 'Мода',
    short: 'Наиболее часто встречающееся значение.',
    full: 'Мода (Mo) — единственная мера центра, применимая к номинальным шкалам. Распределение может быть унимодальным, бимодальным или мультимодальным; бимодальность — сигнал о возможной смеси двух подгрупп.',
    aliases: ['мода', 'Mo', 'mode'],
    relatedIds: ['mean', 'median'],
    category: 'descriptive',
  },
  {
    id: 'variance',
    term: 'Дисперсия',
    short: 'Среднее квадратов отклонений от среднего.',
    full: 'Дисперсия s² описывает разброс значений вокруг среднего. Использует n−1 в знаменателе для несмещённой оценки. Корень из дисперсии — стандартное отклонение.',
    aliases: ['дисперсия', 'variance', 's²', 'σ²'],
    relatedIds: ['sd', 'mean', 'standard-error'],
    category: 'descriptive',
    formula: 's^2 = \\frac{1}{n-1}\\sum (x_i - M)^2',
  },
  {
    id: 'sd',
    term: 'Стандартное отклонение',
    short: 'Корень из дисперсии — типичное отклонение от среднего.',
    full: 'SD (стандартное отклонение) выражено в тех же единицах, что и сама переменная. Для нормального распределения интервал M ± 1 SD охватывает ≈ 68 % значений, M ± 2 SD — ≈ 95 %.',
    aliases: ['SD', 'стандартное отклонение', 'standard deviation', 'σ', 's'],
    relatedIds: ['variance', 'standard-error', 'normal-distribution', 'z-score'],
    category: 'descriptive',
    formula: 'SD = \\sqrt{s^2}',
  },
  {
    id: 'standard-error',
    term: 'Стандартная ошибка',
    short: 'Стандартное отклонение выборочного распределения статистики.',
    full: 'SE = SD / √n. Описывает точность оценки среднего: чем больше выборка, тем меньше SE и тем уже доверительный интервал.',
    aliases: ['SE', 'стандартная ошибка', 'standard error'],
    relatedIds: ['sd', 'confidence-interval', 'sample-size'],
    category: 'descriptive',
    formula: 'SE = \\frac{SD}{\\sqrt{n}}',
  },
  {
    id: 'iqr',
    term: 'Межквартильный размах',
    short: 'Q₃ − Q₁: разброс центральных 50 % данных.',
    full: 'IQR — устойчивая к выбросам мера разброса. Используется в правиле «1.5·IQR» для обнаружения выбросов и в построении ящика с усами.',
    aliases: ['IQR', 'межквартильный размах', 'интерквартильный размах', 'interquartile range'],
    relatedIds: ['median', 'outlier', 'quartile'],
    category: 'descriptive',
    formula: 'IQR = Q_3 - Q_1',
  },
  {
    id: 'quartile',
    term: 'Квартиль',
    short: 'Значения, делящие упорядоченный ряд на четыре равные части.',
    full: 'Q1 (25-й перцентиль), Q2 = медиана, Q3 (75-й перцентиль). Используются в боксплоте и для расчёта IQR.',
    aliases: ['квартиль', 'квартили', 'Q1', 'Q3', 'quartile'],
    relatedIds: ['iqr', 'median', 'outlier'],
    category: 'descriptive',
  },
  {
    id: 'skewness',
    term: 'Асимметрия',
    short: 'Мера несимметричности распределения.',
    full: 'Положительная асимметрия (Sk > 0) — длинный хвост справа (типично для шкал депрессии, времени реакции). Отрицательная — слева. |Sk| < 0.5 обычно считается приемлемым для нормальности.',
    aliases: ['асимметрия', 'skewness', 'Sk'],
    relatedIds: ['normal-distribution', 'kurtosis', 'median'],
    category: 'descriptive',
    formula: 'Sk = \\frac{n}{(n-1)(n-2)}\\sum\\left(\\frac{x_i - M}{SD}\\right)^3',
  },
  {
    id: 'kurtosis',
    term: 'Эксцесс',
    short: 'Острота пика и тяжесть хвостов распределения.',
    full: 'Excess kurtosis = 0 для нормального распределения. Положительный — лептокуртическое (острый пик, тяжёлые хвосты), отрицательный — платикуртическое (плоское).',
    aliases: ['эксцесс', 'kurtosis', 'Ku'],
    relatedIds: ['normal-distribution', 'skewness'],
    category: 'descriptive',
  },
  {
    id: 'outlier',
    term: 'Выбросы',
    short: 'Наблюдения, неестественно далёкие от остальных.',
    full: 'Стандартное правило: значение xᵢ — выброс, если xᵢ < Q1 − 1.5·IQR или xᵢ > Q3 + 1.5·IQR. В психологии выбросы нельзя удалять автоматически: сначала выясните причину (ошибка ввода, отказ от инструкции, редкая стратегия).',
    aliases: ['выброс', 'выбросы', 'outlier', 'outliers'],
    relatedIds: ['iqr', 'median', 'mean'],
    category: 'descriptive',
  },
  {
    id: 'percentile',
    term: 'Перцентиль',
    short: 'Значение, ниже которого лежит указанная доля наблюдений.',
    full: 'P-й перцентиль — значение, ниже которого находится P % выборки. 50-й перцентиль = медиана.',
    aliases: ['перцентиль', 'процентиль', 'percentile'],
    relatedIds: ['quartile', 'median'],
    category: 'descriptive',
  },
  {
    id: 'z-score',
    term: 'z-оценка',
    short: 'Стандартизированное отклонение от среднего в единицах SD.',
    full: 'z = (x − M) / SD. Позволяет сравнивать значения из разных шкал и связана с нормальным распределением.',
    aliases: ['z-оценка', 'z-score', 'z-балл'],
    relatedIds: ['sd', 'normal-distribution'],
    category: 'descriptive',
    formula: 'z = \\frac{x - M}{SD}',
  },
  {
    id: 'frequency-distribution',
    term: 'Распределение частот',
    short: 'Сводка количества наблюдений по интервалам.',
    full: 'Базовый способ описать форму выборки. Графически — гистограмма (для непрерывных) или столбчатая диаграмма (для категориальных).',
    aliases: ['частотное распределение', 'распределение частот', 'frequency distribution'],
    relatedIds: ['skewness', 'kurtosis'],
    category: 'descriptive',
  },

  // -------------------- INFERENCE --------------------
  {
    id: 'p-value',
    term: 'p-значение',
    short: 'Вероятность получить такой или более экстремальный результат при условии H₀.',
    full: 'p-value — НЕ вероятность того, что H₀ верна. Это P(данные | H₀). Если p < α, мы отвергаем H₀. В современной отчётности указывают точное p-значение (например, p = .032), а не p < .05.',
    aliases: ['p-value', 'p-значение', 'p-уровень', 'p value', 'p'],
    relatedIds: ['alpha', 'h0', 'h1', 'type-i-error'],
    category: 'inference',
  },
  {
    id: 'alpha',
    term: 'Уровень значимости α',
    short: 'Допустимая вероятность ошибки I рода (обычно 0.05).',
    full: 'α задаётся ДО анализа. Если p < α, нулевая гипотеза отвергается. Снижение α (до .01 или .001) уменьшает ложноположительные результаты, но повышает β.',
    aliases: ['α', 'alpha', 'уровень значимости', 'уровень α'],
    relatedIds: ['p-value', 'type-i-error', 'beta'],
    category: 'inference',
  },
  {
    id: 'beta',
    term: 'Ошибка II рода β',
    short: 'Вероятность не отвергнуть ложную H₀.',
    full: 'β — ложноотрицательный результат. Связана с мощностью: power = 1 − β. Зависит от размера эффекта, n и α.',
    aliases: ['β', 'beta', 'ошибка II рода', 'ошибка второго рода'],
    relatedIds: ['power', 'alpha', 'type-i-error', 'effect-size'],
    category: 'inference',
  },
  {
    id: 'power',
    term: 'Мощность теста',
    short: 'Вероятность обнаружить реальный эффект (1 − β).',
    full: 'Рекомендуемый минимум — 0.80. Низкая мощность приводит к воспроизводственному кризису: даже статистически значимый результат при power < 0.5 имеет высокую вероятность оказаться ложным.',
    aliases: ['мощность', 'мощность теста', 'power', 'статистическая мощность'],
    relatedIds: ['beta', 'sample-size', 'effect-size'],
    category: 'inference',
  },
  {
    id: 'type-i-error',
    term: 'Ошибка I рода',
    short: 'Отвергли H₀, когда она верна.',
    full: 'Ложноположительный результат. Контролируется выбором α. При множественных сравнениях накапливается, поэтому требует поправок (Бонферрони, Holm, FDR).',
    aliases: ['ошибка I рода', 'ошибка первого рода', 'type I error', 'false positive'],
    relatedIds: ['alpha', 'p-value', 'multiple-comparisons'],
    category: 'inference',
  },
  {
    id: 'h0',
    term: 'Нулевая гипотеза H₀',
    short: 'Гипотеза об отсутствии эффекта.',
    full: 'H₀ обычно утверждает, что разности средних, корреляции или доли равны нулю в популяции. Тест показывает, насколько данные несовместимы с H₀.',
    aliases: ['H₀', 'H0', 'нулевая гипотеза', 'null hypothesis'],
    relatedIds: ['h1', 'p-value', 'alpha'],
    category: 'inference',
  },
  {
    id: 'h1',
    term: 'Альтернативная гипотеза H₁',
    short: 'Гипотеза о наличии эффекта.',
    full: 'H₁ может быть направленной (μ₁ > μ₂) или ненаправленной (μ₁ ≠ μ₂). От направленности зависит, односторонний или двусторонний тест применяется.',
    aliases: ['H₁', 'H1', 'альтернативная гипотеза', 'alternative hypothesis'],
    relatedIds: ['h0', 'p-value'],
    category: 'inference',
  },
  {
    id: 'confidence-interval',
    term: 'Доверительный интервал',
    short: 'Диапазон, в котором с заданной вероятностью лежит параметр популяции.',
    full: '95 % CI для среднего: M ± 1.96 · SE. Корректная интерпретация: «при многократном повторении исследования 95 % таких интервалов накроют истинное μ».',
    aliases: ['CI', 'доверительный интервал', 'confidence interval', '95% CI'],
    relatedIds: ['standard-error', 'mean', 'sample-size'],
    category: 'inference',
    formula: 'CI_{95\\%} = M \\pm 1.96 \\cdot SE',
  },
  {
    id: 't-test',
    term: 't-критерий Стьюдента',
    short: 'Сравнение средних (одной, двух зависимых или независимых выборок).',
    full: 't-тест предполагает примерно нормальное распределение и (для независимых выборок) равенство дисперсий или поправку Уэлча. Для скошенных данных используют непараметрические аналоги (Mann–Whitney, Wilcoxon).',
    aliases: ['t-критерий', 't-тест', 't-test', 'Стьюдент', "Student's t"],
    relatedIds: ['mann-whitney', 'wilcoxon', 'cohens-d', 'degrees-of-freedom'],
    category: 'inference',
    formula: 't = \\frac{M_1 - M_2}{SE_{diff}}',
  },
  {
    id: 'f-test',
    term: 'F-критерий',
    short: 'Сравнение дисперсий и групповых средних в ANOVA.',
    full: 'F = MS_between / MS_within. Используется в дисперсионном анализе и регрессии для проверки общей значимости модели.',
    aliases: ['F-критерий', 'F-тест', 'F-test', 'F-статистика'],
    relatedIds: ['anova', 'eta-squared', 'degrees-of-freedom'],
    category: 'inference',
  },
  {
    id: 'anova',
    term: 'ANOVA',
    short: 'Дисперсионный анализ для сравнения средних 3+ групп.',
    full: 'ANOVA проверяет H₀ о равенстве всех групповых средних. Значимый F не говорит, какие именно группы отличаются — для этого нужны post-hoc тесты (Tukey HSD, Bonferroni).',
    aliases: ['ANOVA', 'дисперсионный анализ', 'one-way ANOVA'],
    relatedIds: ['f-test', 'eta-squared', 'multiple-comparisons'],
    category: 'inference',
  },
  {
    id: 'mann-whitney',
    term: 'Mann–Whitney U',
    short: 'Непараметрический аналог t-теста для независимых выборок.',
    full: 'Сравнивает ранги двух независимых выборок. Не требует нормальности; подходит для порядковых шкал и небольших n.',
    aliases: ['Mann–Whitney', 'Mann-Whitney', 'U-критерий', 'Манна-Уитни', 'U-test'],
    relatedIds: ['wilcoxon', 't-test'],
    category: 'inference',
  },
  {
    id: 'wilcoxon',
    term: 'Wilcoxon signed-rank',
    short: 'Непараметрический аналог парного t-теста.',
    full: 'Wilcoxon работает с разностями зависимых пар: ранжирует |dᵢ| и сравнивает суммы положительных и отрицательных рангов.',
    aliases: ['Wilcoxon', 'Уилкоксон', 'signed-rank', 'критерий Вилкоксона'],
    relatedIds: ['mann-whitney', 't-test'],
    category: 'inference',
  },
  {
    id: 'chi-square',
    term: 'χ²-критерий',
    short: 'Тест для категориальных данных: сравнение частот.',
    full: 'χ² проверяет согласие наблюдаемых частот с ожидаемыми (тест согласия) или независимость двух категориальных переменных (таблица сопряжённости). Требует ожидаемые частоты ≥ 5.',
    aliases: ['χ²', 'хи-квадрат', 'chi-square', 'chi square', 'критерий хи-квадрат'],
    relatedIds: ['cramers-v', 'degrees-of-freedom'],
    category: 'inference',
    formula: '\\chi^2 = \\sum \\frac{(O_i - E_i)^2}{E_i}',
  },
  {
    id: 'degrees-of-freedom',
    term: 'Степени свободы',
    short: 'Число независимых значений, которые могут варьироваться.',
    full: 'df определяет форму t-, F-, χ²-распределений. Для одновыборочного t: df = n − 1. Для χ² таблицы r×c: df = (r−1)(c−1).',
    aliases: ['степени свободы', 'df', 'degrees of freedom'],
    relatedIds: ['t-test', 'chi-square', 'f-test'],
    category: 'inference',
  },
  {
    id: 'pearson-r',
    term: 'Корреляция Пирсона r',
    short: 'Мера линейной связи двух количественных переменных.',
    full: 'Диапазон от −1 до +1. Чувствительна к выбросам и предполагает линейность. Для нелинейной или ранговой связи использовать Spearman.',
    aliases: ['r Пирсона', 'корреляция Пирсона', 'Pearson r', 'Pearson correlation', 'r'],
    relatedIds: ['spearman', 'r-squared', 'regression'],
    category: 'inference',
    formula: 'r = \\frac{\\sum (x_i - M_x)(y_i - M_y)}{\\sqrt{\\sum (x_i - M_x)^2 \\sum (y_i - M_y)^2}}',
  },
  {
    id: 'spearman',
    term: 'Корреляция Спирмена',
    short: 'Ранговая корреляция: мера монотонной связи.',
    full: 'ρ Спирмена — корреляция Пирсона на рангах. Устойчива к выбросам и работает с порядковыми шкалами.',
    aliases: ['Spearman', 'Спирмен', 'ρ', 'rho', 'rank correlation'],
    relatedIds: ['pearson-r'],
    category: 'inference',
  },
  {
    id: 'regression',
    term: 'Регрессия',
    short: 'Модель зависимости одной переменной от других.',
    full: 'Линейная регрессия минимизирует сумму квадратов остатков (OLS): ŷ = b₀ + b₁x. Множественная регрессия добавляет несколько предикторов. Требует проверки гомоскедастичности, нормальности остатков и независимости наблюдений.',
    aliases: ['регрессия', 'regression', 'линейная регрессия', 'OLS'],
    relatedIds: ['r-squared', 'residual', 'homoscedasticity', 'pearson-r'],
    category: 'inference',
    formula: '\\hat{y} = b_0 + b_1 x',
  },
  {
    id: 'residual',
    term: 'Остатки',
    short: 'Разность между наблюдаемым и предсказанным значением.',
    full: 'eᵢ = yᵢ − ŷᵢ. Анализ остатков (график остатков vs предсказанные значения, Q–Q plot) — главный способ проверить корректность модели.',
    aliases: ['остатки', 'residual', 'residuals', 'eᵢ'],
    relatedIds: ['regression', 'homoscedasticity'],
    category: 'inference',
    formula: 'e_i = y_i - \\hat{y}_i',
  },
  {
    id: 'homoscedasticity',
    term: 'Гомоскедастичность',
    short: 'Постоянство дисперсии остатков на всём диапазоне предикторов.',
    full: 'Если дисперсия остатков растёт/убывает с предиктором (гетероскедастичность), стандартные ошибки оценены некорректно. Проверяется графиком остатков и тестом Бройша–Пагана.',
    aliases: ['гомоскедастичность', 'homoscedasticity', 'постоянство дисперсии'],
    relatedIds: ['residual', 'regression'],
    category: 'inference',
  },
  {
    id: 'normal-distribution',
    term: 'Нормальное распределение',
    short: 'Симметричное колоколообразное распределение N(μ, σ).',
    full: 'Базовое распределение в инференциальной статистике. Многие тесты предполагают нормальность данных или нормальность остатков. Эмпирическое правило: 68 % значений в M ± 1 SD, 95 % — в M ± 2 SD.',
    aliases: ['нормальное распределение', 'normal distribution', 'гауссово распределение', 'N(0,1)'],
    relatedIds: ['z-score', 'central-limit-theorem', 'sd'],
    category: 'inference',
  },
  {
    id: 'central-limit-theorem',
    term: 'Центральная предельная теорема',
    short: 'Среднее большой выборки распределено приблизительно нормально.',
    full: 'ЦПТ объясняет, почему t- и z-тесты работают даже при ненормальности данных, если n достаточно велико (обычно n ≥ 30).',
    aliases: ['ЦПТ', 'центральная предельная теорема', 'CLT', 'central limit theorem'],
    relatedIds: ['normal-distribution', 'standard-error', 'sample-size'],
    category: 'inference',
  },
  {
    id: 'binomial',
    term: 'Биномиальное распределение',
    short: 'Распределение числа успехов в n испытаниях Бернулли.',
    full: 'B(n, p): P(X = k) = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ. При больших n приближается к нормальному распределению.',
    aliases: ['биномиальное распределение', 'binomial', 'B(n,p)'],
    relatedIds: ['normal-distribution'],
    category: 'inference',
  },
  {
    id: 'multiple-comparisons',
    term: 'Поправка на множественные сравнения',
    short: 'Контроль вероятности ошибки I рода при многих тестах.',
    full: 'При 20 независимых тестах с α = .05 ожидается 1 ложноположительный «по случайности». Поправки: Бонферрони (α/k), Holm-Bonferroni, FDR (Benjamini–Hochberg).',
    aliases: ['множественные сравнения', 'multiple comparisons', 'Бонферрони', 'Bonferroni', 'FDR'],
    relatedIds: ['type-i-error', 'alpha'],
    category: 'inference',
  },
  {
    id: 'p-hacking',
    term: 'p-хакинг',
    short: 'Подгонка анализа ради достижения p < .05.',
    full: 'Включает выбор удобной подвыборки, сбор данных «до значимости», тестирование множества предикторов. Решения: предрегистрация, отчёт всех проведённых тестов, поправки на множественные сравнения.',
    aliases: ['p-hacking', 'p-хакинг', 'data dredging'],
    relatedIds: ['p-value', 'multiple-comparisons', 'replication'],
    category: 'inference',
  },

  // -------------------- EFFECT SIZE --------------------
  {
    id: 'effect-size',
    term: 'Размер эффекта',
    short: 'Стандартизированная мера величины эффекта.',
    full: 'В отличие от p-value, не зависит от n. Позволяет сравнивать исследования и проводить мета-анализ. Для разных тестов используются разные метрики: d Коэна, η², r, Cramér\'s V, OR.',
    aliases: ['размер эффекта', 'effect size', 'величина эффекта'],
    relatedIds: ['cohens-d', 'eta-squared', 'cramers-v', 'pearson-r', 'power'],
    category: 'effect',
  },
  {
    id: 'cohens-d',
    term: 'd Коэна',
    short: 'Размер эффекта для сравнения двух средних.',
    full: 'd = (M₁ − M₂) / SD_pooled. Ориентиры Коэна: 0.2 — малый, 0.5 — средний, 0.8 — большой. Для зависимых выборок — d_z или d_av.',
    aliases: ["d Коэна", "Cohen's d", 'Cohen d', 'd-статистика'],
    relatedIds: ['effect-size', 't-test', 'sd'],
    category: 'effect',
    formula: "d = \\frac{M_1 - M_2}{SD_{pooled}}",
  },
  {
    id: 'eta-squared',
    term: 'η² (эта-квадрат)',
    short: 'Размер эффекта в ANOVA.',
    full: 'η² = SS_between / SS_total. Ориентиры: 0.01 — малый, 0.06 — средний, 0.14 — большой. Альтернатива — частичный η²_p и ω².',
    aliases: ['η²', 'eta-squared', 'эта-квадрат', 'eta squared'],
    relatedIds: ['effect-size', 'anova', 'r-squared'],
    category: 'effect',
    formula: '\\eta^2 = \\frac{SS_{between}}{SS_{total}}',
  },
  {
    id: 'r-squared',
    term: 'R² коэффициент детерминации',
    short: 'Доля дисперсии Y, объяснённая моделью.',
    full: 'R² ∈ [0; 1]. Для парной регрессии R² = r². В множественной регрессии используют скорректированный R²_adj, штрафующий за лишние предикторы.',
    aliases: ['R²', 'R-squared', 'R квадрат', 'коэффициент детерминации'],
    relatedIds: ['regression', 'pearson-r', 'effect-size'],
    category: 'effect',
    formula: 'R^2 = 1 - \\frac{SS_{res}}{SS_{tot}}',
  },
  {
    id: 'cramers-v',
    term: "Cramér's V",
    short: 'Размер эффекта для χ²: сила связи категориальных переменных.',
    full: 'V ∈ [0; 1]. Для таблицы 2×2 V = |φ|. Ориентиры зависят от df таблицы.',
    aliases: ["Cramér's V", "Cramer's V", 'V Крамера', 'Cramers V'],
    relatedIds: ['chi-square', 'effect-size'],
    category: 'effect',
    formula: "V = \\sqrt{\\frac{\\chi^2}{n \\cdot \\min(r-1, c-1)}}",
  },
  {
    id: 'odds-ratio',
    term: 'Отношение шансов (OR)',
    short: 'Во сколько раз шансы события выше в одной группе по сравнению с другой.',
    full: 'OR = (a/b) / (c/d) для таблицы 2×2. OR = 1 — нет связи. OR > 1 — событие чаще в первой группе. Используется в логистической регрессии и эпидемиологии.',
    aliases: ['OR', 'odds ratio', 'отношение шансов'],
    relatedIds: ['chi-square', 'effect-size'],
    category: 'effect',
  },

  // -------------------- DESIGN --------------------
  {
    id: 'population',
    term: 'Генеральная совокупность',
    short: 'Полная совокупность всех объектов исследования.',
    full: 'Параметры популяции (μ, σ, ρ) обычно неизвестны и оцениваются по выборке. Все статистические выводы — это выводы о популяции на основе выборки.',
    aliases: ['генеральная совокупность', 'популяция', 'population'],
    relatedIds: ['sample', 'sampling'],
    category: 'design',
  },
  {
    id: 'sample',
    term: 'Выборка',
    short: 'Подмножество популяции, отобранное для исследования.',
    full: 'Качество выводов зависит от того, насколько выборка репрезентативна популяции. Случайная выборка — золотой стандарт; на практике чаще встречается удобная выборка (convenience sample), что ограничивает обобщаемость.',
    aliases: ['выборка', 'sample'],
    relatedIds: ['population', 'sampling', 'sample-size'],
    category: 'design',
  },
  {
    id: 'sampling',
    term: 'Выборочный метод',
    short: 'Способ отбора испытуемых из популяции.',
    full: 'Случайная, стратифицированная, кластерная, удобная, снежного кома. Метод определяет, на какую популяцию можно обобщать результаты.',
    aliases: ['выборочный метод', 'sampling', 'отбор', 'выборка-метод'],
    relatedIds: ['sample', 'population'],
    category: 'design',
  },
  {
    id: 'sample-size',
    term: 'Объём выборки',
    short: 'Число наблюдений n в исследовании.',
    full: 'Расчёт n должен опираться на анализ мощности: задайте α, желаемую мощность (≥ .80) и ожидаемый размер эффекта. Слишком малый n — низкая мощность; слишком большой — этически и финансово неоправдан.',
    aliases: ['объём выборки', 'размер выборки', 'sample size', 'n'],
    relatedIds: ['power', 'effect-size', 'standard-error'],
    category: 'design',
  },
  {
    id: 'validity',
    term: 'Валидность',
    short: 'Степень, в которой инструмент измеряет то, что должен.',
    full: 'Виды: содержательная, критериальная (конкурентная и прогностическая), конструктная. Конструктная валидность — наиболее важная для психологических инструментов.',
    aliases: ['валидность', 'validity'],
    relatedIds: ['reliability', 'construct', 'operationalization'],
    category: 'design',
  },
  {
    id: 'reliability',
    term: 'Надёжность',
    short: 'Согласованность и стабильность измерений.',
    full: 'Виды: тест-ретест, параллельные формы, внутренняя согласованность (α Кронбаха ≥ .70), межэкспертная (Cohen\'s κ). Надёжность необходима, но недостаточна для валидности.',
    aliases: ['надёжность', 'надежность', 'reliability', 'α Кронбаха', "Cronbach's alpha"],
    relatedIds: ['validity', 'construct'],
    category: 'design',
  },
  {
    id: 'construct',
    term: 'Конструкт',
    short: 'Теоретическое понятие, недоступное прямому наблюдению.',
    full: 'Тревожность, интеллект, мотивация — конструкты. Изучаются через операционализацию: подбор индикаторов, которые можно измерить.',
    aliases: ['конструкт', 'construct', 'латентная переменная'],
    relatedIds: ['operationalization', 'validity'],
    category: 'design',
  },
  {
    id: 'operationalization',
    term: 'Операционализация',
    short: 'Перевод конструкта в измеримые индикаторы.',
    full: 'Например, «академическая мотивация» операционализируется через шкалу AMS-28 или поведенческие маркеры (часы самостоятельной работы). Разные операционализации могут давать разные результаты.',
    aliases: ['операционализация', 'operationalization'],
    relatedIds: ['construct', 'validity'],
    category: 'design',
  },
  {
    id: 'iv-dv',
    term: 'Независимая и зависимая переменные',
    short: 'IV — то, что варьируется; DV — то, что измеряется.',
    full: 'В эксперименте исследователь манипулирует IV и измеряет её влияние на DV. В корреляционных исследованиях деление условно.',
    aliases: ['независимая переменная', 'зависимая переменная', 'IV', 'DV', 'НП', 'ЗП'],
    relatedIds: ['confounding', 'experiment'],
    category: 'design',
  },
  {
    id: 'confounding',
    term: 'Конфаундер',
    short: 'Сторонняя переменная, искажающая связь IV → DV.',
    full: 'Например, возраст может искажать связь между типом терапии и улучшением. Контролируется через рандомизацию, стратификацию или статистическую корректировку.',
    aliases: ['конфаундер', 'confounder', 'смешивающая переменная', 'confounding'],
    relatedIds: ['iv-dv', 'experiment'],
    category: 'design',
  },
  {
    id: 'experiment',
    term: 'Эксперимент',
    short: 'Дизайн с активной манипуляцией IV и рандомизацией.',
    full: 'Только эксперимент позволяет делать причинные выводы. Корреляционные и квази-экспериментальные дизайны ограничены ассоциативными выводами.',
    aliases: ['эксперимент', 'experiment', 'рандомизированный эксперимент', 'RCT'],
    relatedIds: ['iv-dv', 'confounding', 'replication'],
    category: 'design',
  },
  {
    id: 'replication',
    term: 'Воспроизводимость',
    short: 'Получение того же результата в независимом исследовании.',
    full: 'Прямая репликация — повторение протокола, концептуальная — проверка той же гипотезы другим способом. Кризис воспроизводимости в психологии (Open Science Collaboration, 2015) показал, что лишь ~36 % результатов воспроизводятся.',
    aliases: ['воспроизводимость', 'репликация', 'replication', 'replicability'],
    relatedIds: ['p-hacking', 'power'],
    category: 'design',
  },
  {
    id: 'measurement-scale',
    term: 'Шкала измерения',
    short: 'Уровень информации, заключённый в значениях переменной.',
    full: 'Стивенс выделил 4 уровня: номинальный, порядковый, интервальный, абсолютный. От уровня шкалы зависит, какие статистики допустимы (например, среднее не имеет смысла для номинальных данных).',
    aliases: ['шкала измерения', 'уровень шкалы', 'measurement scale', 'шкалы Стивенса'],
    relatedIds: ['mean', 'median', 'mode'],
    category: 'design',
  },
  {
    id: 'likert',
    term: 'Шкала Ликерта',
    short: 'Порядковая шкала согласия (обычно 5–7 пунктов).',
    full: 'Формально — порядковая, но при n ≥ 5 пунктах часто анализируется как интервальная. Для отдельных пунктов корректнее использовать непараметрические тесты.',
    aliases: ['шкала Ликерта', 'Лайкерт', 'Likert', 'Likert scale'],
    relatedIds: ['measurement-scale', 'mann-whitney'],
    category: 'design',
  },
  {
    id: 'missing-data',
    term: 'Пропущенные данные',
    short: 'Отсутствующие значения в выборке.',
    full: 'Типы: MCAR (полностью случайно), MAR (случайно при условии других переменных), MNAR (систематически). Для MCAR/MAR используют множественную импутацию; listwise deletion смещает оценки.',
    aliases: ['пропущенные данные', 'missing data', 'MCAR', 'MAR', 'MNAR', 'пропуски'],
    relatedIds: ['sample-size'],
    category: 'design',
  },
  {
    id: 'between-within',
    term: 'Межгрупповой / внутригрупповой дизайн',
    short: 'Разные испытуемые в условиях vs. одни и те же.',
    full: 'Между-субъектный (between): каждое условие — своя группа. Внутри-субъектный (within / repeated measures): один испытуемый проходит все условия. Within мощнее, но подвержен эффектам последовательности.',
    aliases: ['межгрупповой дизайн', 'внутригрупповой дизайн', 'between-subjects', 'within-subjects', 'repeated measures'],
    relatedIds: ['t-test', 'anova', 'experiment'],
    category: 'design',
  },
];

/* -------------------- helpers -------------------- */

const idIndex = new Map(glossary.map((e) => [e.id, e]));

export const getEntry = (id: string): GlossaryEntry | undefined => idIndex.get(id);

/**
 * Build alias-lookup once: returns a Map<string lowercased, entry>.
 * Aliases are stored verbatim; matching is case-insensitive in consumers.
 */
export const buildAliasIndex = (): Map<string, GlossaryEntry> => {
  const map = new Map<string, GlossaryEntry>();
  for (const e of glossary) {
    const all = [e.term, ...e.aliases];
    for (const alias of all) {
      const key = alias.toLowerCase().trim();
      if (key && !map.has(key)) map.set(key, e);
    }
  }
  return map;
};

/** Sorted list of categories present in the glossary, with counts. */
export const getCategories = (): { id: GlossaryCategory; label: string; count: number }[] => {
  const counts: Record<GlossaryCategory, number> = {
    descriptive: 0,
    inference: 0,
    effect: 0,
    design: 0,
  };
  glossary.forEach((e) => {
    counts[e.category]++;
  });
  return (Object.keys(counts) as GlossaryCategory[]).map((id) => ({
    id,
    label: CATEGORY_LABELS[id],
    count: counts[id],
  }));
};
