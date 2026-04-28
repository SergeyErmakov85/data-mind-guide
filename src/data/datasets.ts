/**
 * Метаданные локальных датасетов. CSV-файлы лежат в /public/datasets/.
 * Никаких внешних API — всё статично.
 */

import { createSafeStorage } from '@/lib/safeStorage';

export type DatasetDomain = 'personality' | 'clinical' | 'cognitive';

export const DOMAIN_LABEL: Record<DatasetDomain, string> = {
  personality: 'Личность',
  clinical: 'Клиника',
  cognitive: 'Когнитивистика',
};

export interface DatasetVariable {
  name: string;
  type: 'numeric' | 'categorical' | 'id';
  description: string;
}

export interface Dataset {
  id: string;
  name: string;
  domain: DatasetDomain;
  n: number;
  /** Имя CSV-файла относительно /public/datasets/ */
  file: string;
  /** Краткое описание (для карточки) */
  description: string;
  /** Расширенное описание дизайна */
  design: string;
  variables: readonly DatasetVariable[];
  source: string;
  license: string;
  /** Подсказка по корреляционному анализу: пары X/Y столбцов, имеющие смысл */
  suggestedPairs?: readonly { x: string; y: string }[];
}

export const DATASETS: readonly Dataset[] = [
  {
    id: 'big-five-mini',
    name: 'Big Five mini',
    domain: 'personality',
    n: 200,
    file: 'big_five_mini.csv',
    description:
      'Усреднённые баллы по пяти факторам личности (NEO-FFI-стиль) для 200 респондентов.',
    design: 'Поперечное (cross-sectional). Самоотчёт по 5-балльной шкале.',
    variables: [
      { name: 'id', type: 'id', description: 'Идентификатор респондента' },
      { name: 'openness', type: 'numeric', description: 'Открытость опыту, 1-5' },
      { name: 'conscientiousness', type: 'numeric', description: 'Добросовестность, 1-5' },
      { name: 'extraversion', type: 'numeric', description: 'Экстраверсия, 1-5' },
      { name: 'agreeableness', type: 'numeric', description: 'Доброжелательность, 1-5' },
      { name: 'neuroticism', type: 'numeric', description: 'Нейротизм, 1-5' },
    ],
    source: 'Синтетический набор по схеме IPIP Big-Five',
    license: 'CC BY 4.0',
    suggestedPairs: [
      { x: 'extraversion', y: 'agreeableness' },
      { x: 'neuroticism', y: 'conscientiousness' },
    ],
  },
  {
    id: 'bdi-toy',
    name: 'Beck Depression Inventory (toy)',
    domain: 'clinical',
    n: 100,
    file: 'bdi_toy.csv',
    description:
      'Учебный набор: суммарные баллы BDI-II с категорией тяжести депрессии.',
    design: 'Поперечное. Самоотчёт; категории по стандартным порогам BDI-II.',
    variables: [
      { name: 'id', type: 'id', description: 'ID' },
      { name: 'age', type: 'numeric', description: 'Возраст в годах' },
      { name: 'sex', type: 'categorical', description: 'Пол: F/M' },
      { name: 'bdi_total', type: 'numeric', description: 'Суммарный балл BDI-II (0-63)' },
      { name: 'severity', type: 'categorical', description: 'minimal / mild / moderate / severe' },
    ],
    source: 'Синтетика по диапазонам BDI-II',
    license: 'CC BY 4.0',
    suggestedPairs: [{ x: 'age', y: 'bdi_total' }],
  },
  {
    id: 'iq-vs-sleep',
    name: 'IQ vs sleep hours',
    domain: 'cognitive',
    n: 150,
    file: 'iq_vs_sleep.csv',
    description:
      'Связь продолжительности сна (часы) и общего IQ. Ожидается нелинейная связь с пиком в районе 7-8 часов.',
    design: 'Поперечное. Сон — самоотчёт за неделю, IQ — стандартизованный тест.',
    variables: [
      { name: 'id', type: 'id', description: 'ID' },
      { name: 'sleep_hours', type: 'numeric', description: 'Среднее число часов сна в сутки' },
      { name: 'iq', type: 'numeric', description: 'Полный IQ (M=100, SD=15)' },
    ],
    source: 'Синтетический набор',
    license: 'CC BY 4.0',
    suggestedPairs: [{ x: 'sleep_hours', y: 'iq' }],
  },
  {
    id: 'stroop-rt',
    name: 'Stroop task RT',
    domain: 'cognitive',
    n: 80,
    file: 'stroop_rt.csv',
    description:
      'Время реакции (мс) в конгруэнтных и неконгруэнтных пробах теста Струпа. Дизайн within-subject.',
    design: 'Внутрисубъектный (paired). Каждый испытуемый — 2 условия.',
    variables: [
      { name: 'id', type: 'id', description: 'ID' },
      { name: 'rt_congruent_ms', type: 'numeric', description: 'RT в конгруэнтных пробах, мс' },
      { name: 'rt_incongruent_ms', type: 'numeric', description: 'RT в неконгруэнтных пробах, мс' },
      { name: 'interference_ms', type: 'numeric', description: 'Эффект интерференции (incong − cong)' },
    ],
    source: 'Синтетика по типичным RT в задаче Струпа',
    license: 'CC BY 4.0',
    suggestedPairs: [{ x: 'rt_congruent_ms', y: 'rt_incongruent_ms' }],
  },
  {
    id: 'therapy-pre-post',
    name: 'Therapy pre/post',
    domain: 'clinical',
    n: 60,
    file: 'therapy_pre_post.csv',
    description:
      'Парный дизайн: симптоматика до и после 8-недельного курса КПТ. Подходит для парного t-теста.',
    design: 'Парный (within-subject). Замеры pre/post у одних и тех же клиентов.',
    variables: [
      { name: 'id', type: 'id', description: 'ID клиента' },
      { name: 'pre_score', type: 'numeric', description: 'Балл по шкале симптомов до терапии' },
      { name: 'post_score', type: 'numeric', description: 'Балл после 8 недель' },
      { name: 'improvement', type: 'numeric', description: 'pre − post (положит. = улучшение)' },
    ],
    source: 'Синтетический набор',
    license: 'CC BY 4.0',
    suggestedPairs: [{ x: 'pre_score', y: 'post_score' }],
  },
  {
    id: 'reaction-time-groups',
    name: 'Reaction time × 3 groups',
    domain: 'cognitive',
    n: 120,
    file: 'reaction_time_groups.csv',
    description:
      'Время реакции в трёх группах (контроль / препарат A / препарат B). Подходит для one-way ANOVA.',
    design: 'Межсубъектный, 3 независимые группы по 40 человек.',
    variables: [
      { name: 'id', type: 'id', description: 'ID' },
      { name: 'group', type: 'categorical', description: 'control / drug_a / drug_b' },
      { name: 'rt_ms', type: 'numeric', description: 'Время реакции, мс' },
    ],
    source: 'Синтетический набор',
    license: 'CC BY 4.0',
  },
] as const;

export const DATASETS_BY_ID: Readonly<Record<string, Dataset>> = Object.freeze(
  Object.fromEntries(DATASETS.map((d) => [d.id, d])),
);

/**
 * Ключ sessionStorage для передачи CSV-текста между страницами.
 * Не используем localStorage, чтобы данные не «жили» дольше сессии.
 */
export const DATASET_HANDOFF_KEY = 'lovable.dataset.handoff';

export interface DatasetHandoff {
  id: string;
  filename: string;
  csv: string;
}

const safeSessionStorage = createSafeStorage(
  typeof sessionStorage !== 'undefined' ? sessionStorage : undefined,
);

export const stashDataset = (h: DatasetHandoff): void => {
  try {
    safeSessionStorage.setItem(DATASET_HANDOFF_KEY, JSON.stringify(h));
  } catch {
    /* quota / private mode — silently ignore */
  }
};

export const popDataset = (id?: string): DatasetHandoff | null => {
  try {
    const raw = safeSessionStorage.getItem(DATASET_HANDOFF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DatasetHandoff;
    if (id && parsed.id !== id) return null;
    safeSessionStorage.removeItem(DATASET_HANDOFF_KEY);
    return parsed;
  } catch {
    return null;
  }
};

/** Грузит CSV из /public/datasets/ как текст. */
export const fetchDatasetCsv = async (file: string): Promise<string> => {
  const res = await fetch(`/datasets/${file}`);
  if (!res.ok) throw new Error(`Не удалось загрузить ${file}: ${res.status}`);
  return res.text();
};
