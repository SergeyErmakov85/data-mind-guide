// Final assessment quiz — 30 questions covering descriptive, hypothesis, effects.
export interface FinalQuestion {
  id: string;
  topic: 'descriptive' | 'hypothesis' | 'effects';
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export const FINAL_QUIZ: FinalQuestion[] = [
  // ---- Descriptive (10) ----
  {
    id: 'd1', topic: 'descriptive',
    question: 'Какая мера центральной тенденции наименее устойчива к выбросам?',
    options: ['Медиана', 'Мода', 'Среднее арифметическое', 'Межквартильный размах'],
    correctIndex: 2,
    explanation: 'Среднее сильно смещается под влиянием экстремальных значений.',
  },
  {
    id: 'd2', topic: 'descriptive',
    question: 'Что показывает стандартное отклонение?',
    options: ['Центр распределения', 'Типичное отклонение от среднего', 'Минимум и максимум', 'Асимметрию'],
    correctIndex: 1,
  },
  {
    id: 'd3', topic: 'descriptive',
    question: 'Межквартильный размах (IQR) — это:',
    options: ['Q3 − Q1', 'Max − Min', 'Q2 − Q1', 'σ²'],
    correctIndex: 0,
  },
  {
    id: 'd4', topic: 'descriptive',
    question: 'Если распределение скошено вправо, то:',
    options: ['Mean < Median', 'Mean ≈ Median', 'Mean > Median', 'Mean = Mode'],
    correctIndex: 2,
  },
  {
    id: 'd5', topic: 'descriptive',
    question: 'Дисперсия выборки делится на:',
    options: ['n', 'n − 1', 'n + 1', '√n'],
    correctIndex: 1,
    explanation: 'Несмещённая оценка использует n−1 (поправка Бесселя).',
  },
  {
    id: 'd6', topic: 'descriptive',
    question: 'Z-оценка интерпретируется как:',
    options: ['Вероятность', 'Число σ от среднего', 'Процент', 'Мода'],
    correctIndex: 1,
  },
  {
    id: 'd7', topic: 'descriptive',
    question: 'Какой график лучше всего показывает выбросы?',
    options: ['Pie chart', 'Boxplot', 'Bar chart', 'Histogram'],
    correctIndex: 1,
  },
  {
    id: 'd8', topic: 'descriptive',
    question: 'Шкала Лайкерта — это:',
    options: ['Номинальная', 'Порядковая', 'Интервальная', 'Отношений'],
    correctIndex: 1,
  },
  {
    id: 'd9', topic: 'descriptive',
    question: 'Коэффициент вариации полезен для:',
    options: ['Сравнения разброса при разных средних', 'Поиска моды', 'Тестирования гипотез', 'Корреляции'],
    correctIndex: 0,
  },
  {
    id: 'd10', topic: 'descriptive',
    question: 'Что НЕ является мерой разброса?',
    options: ['Дисперсия', 'IQR', 'Размах', 'Медиана'],
    correctIndex: 3,
  },

  // ---- Hypothesis testing (10) ----
  {
    id: 'h1', topic: 'hypothesis',
    question: 'Что описывает p-value?',
    options: [
      'Вероятность H0',
      'Вероятность H1',
      'Вероятность данных не хуже наблюдаемых при истинной H0',
      'Размер эффекта',
    ],
    correctIndex: 2,
  },
  {
    id: 'h2', topic: 'hypothesis',
    question: 'Ошибка I рода — это:',
    options: ['Принять H0, когда верна H1', 'Отвергнуть H0, когда она верна', 'Малый размер выборки', 'Низкая мощность'],
    correctIndex: 1,
  },
  {
    id: 'h3', topic: 'hypothesis',
    question: 'Мощность теста — это:',
    options: ['1 − α', '1 − β', 'α', 'β'],
    correctIndex: 1,
  },
  {
    id: 'h4', topic: 'hypothesis',
    question: 'Какой тест применить для сравнения средних в двух независимых группах?',
    options: ['Парный t-test', 'Independent t-test', 'χ²', 'ANOVA для повторных измерений'],
    correctIndex: 1,
  },
  {
    id: 'h5', topic: 'hypothesis',
    question: 'Если p = 0.03 при α = 0.05, то:',
    options: ['Принимаем H0', 'Отвергаем H0', 'Тест неинформативен', 'Нужно уменьшить выборку'],
    correctIndex: 1,
  },
  {
    id: 'h6', topic: 'hypothesis',
    question: 'Доверительный интервал 95% означает:',
    options: [
      'С вероятностью 95% параметр в интервале',
      'В 95% выборок такой ИИ накроет истинный параметр',
      'Среднее ± 2σ',
      'Мощность 0.95',
    ],
    correctIndex: 1,
  },
  {
    id: 'h7', topic: 'hypothesis',
    question: 'Когда применяют тест Манна–Уитни?',
    options: ['Нормальные данные, две группы', 'Не-нормальные/порядковые, две группы', 'Три группы', 'Парные данные'],
    correctIndex: 1,
  },
  {
    id: 'h8', topic: 'hypothesis',
    question: 'ANOVA сравнивает:',
    options: ['Дисперсии', 'Средние трёх и более групп', 'Корреляции', 'Пропорции'],
    correctIndex: 1,
  },
  {
    id: 'h9', topic: 'hypothesis',
    question: 'χ²-тест используется для:',
    options: ['Средних', 'Связи категориальных переменных', 'Регрессии', 'Дисперсий'],
    correctIndex: 1,
  },
  {
    id: 'h10', topic: 'hypothesis',
    question: 'Поправка Бонферрони применяется при:',
    options: ['Малых выборках', 'Множественных сравнениях', 'Не-нормальности', 'Парных тестах'],
    correctIndex: 1,
  },

  // ---- Effects (10) ----
  {
    id: 'e1', topic: 'effects',
    question: 'Cohen’s d измеряет:',
    options: ['p-value', 'Размер эффекта для разности средних', 'Корреляцию', 'Дисперсию'],
    correctIndex: 1,
  },
  {
    id: 'e2', topic: 'effects',
    question: 'd = 0.2 по Коэну — это эффект:',
    options: ['Малый', 'Средний', 'Большой', 'Огромный'],
    correctIndex: 0,
  },
  {
    id: 'e3', topic: 'effects',
    question: 'r = 0.5 по Коэну — это:',
    options: ['Малый', 'Средний', 'Большой', 'Незначимый'],
    correctIndex: 2,
  },
  {
    id: 'e4', topic: 'effects',
    question: 'η² (eta-squared) — это:',
    options: ['Размер эффекта в ANOVA', 'Корреляция', 'Размер выборки', 'Стандартная ошибка'],
    correctIndex: 0,
  },
  {
    id: 'e5', topic: 'effects',
    question: 'Зачем считать размер эффекта вместе с p?',
    options: [
      'Замена p',
      'p зависит от n; эффект показывает практическую значимость',
      'Это просто традиция',
      'Размер эффекта = p',
    ],
    correctIndex: 1,
  },
  {
    id: 'e6', topic: 'effects',
    question: 'Cohen’s w (для χ²) средний эффект ≈',
    options: ['0.1', '0.3', '0.5', '0.8'],
    correctIndex: 1,
  },
  {
    id: 'e7', topic: 'effects',
    question: 'Что произойдёт с p при увеличении n, если эффект остаётся тем же?',
    options: ['Растёт', 'Уменьшается', 'Не меняется', 'Становится отрицательным'],
    correctIndex: 1,
  },
  {
    id: 'e8', topic: 'effects',
    question: 'Cohen’s f используется в:',
    options: ['t-тесте', 'ANOVA', 'Корреляции', 'χ²'],
    correctIndex: 1,
  },
  {
    id: 'e9', topic: 'effects',
    question: 'Доверительный интервал для размера эффекта:',
    options: ['Бесполезен', 'Показывает диапазон правдоподобных значений', 'Совпадает с p', 'Заменяет n'],
    correctIndex: 1,
  },
  {
    id: 'e10', topic: 'effects',
    question: 'r² интерпретируется как:',
    options: ['Доля объяснённой дисперсии', 'Среднее', 'p-value', 'Мощность'],
    correctIndex: 0,
  },
];
