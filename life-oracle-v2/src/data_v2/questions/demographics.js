export const DEMOGRAPHIC_QUESTIONS = [
  {
    id: 'demo_age',
    type: 'demographic_age',
    text: '今、何歳ですか？',
    discriminates: [],
    choices: [
      { id: 'age_20early', label: '10代・20代前半（〜24歳）', demographicHints: { age_early20s: 10 }, value: '20代前半' },
      { id: 'age_20late',  label: '20代後半（25〜29歳）',     demographicHints: { age_late20s: 10 },  value: '20代後半' },
      { id: 'age_30',      label: '30代（30〜39歳）',          demographicHints: { age_30s: 10 },      value: '30代' },
      { id: 'age_40',      label: '40代（40〜49歳）',          demographicHints: { age_40s: 10 },      value: '40代' },
      { id: 'age_50',      label: '50代（50〜59歳）',          demographicHints: { age_50s: 10 },      value: '50代' },
      { id: 'age_60over',  label: '60代以上（60歳〜）',        demographicHints: { age_60s: 10 },      value: '60代以上' },
    ],
  },
  {
    id: 'demo_job',
    type: 'demographic_job',
    text: '今の立場に一番近いものは？',
    discriminates: [],
    choices: [
      { id: 'job_employee',   label: '会社員・公務員',               demographicHints: { job_employee: 10 },   value: '会社員' },
      { id: 'job_freelance',  label: 'フリーランス・自営業・経営者', demographicHints: { job_freelance: 10 },  value: 'フリーランス' },
      { id: 'job_student',    label: '学生',                         demographicHints: { job_student: 10 },    value: '学生' },
      { id: 'job_homemaker',  label: '主婦・主夫',                   demographicHints: { job_homemaker: 10 },  value: '主婦/主夫' },
      { id: 'job_irregular',  label: 'パート・アルバイト・派遣',     demographicHints: { job_parttime: 10 },   value: '非正規雇用' },
      { id: 'job_none',       label: '現在は働いていない',           demographicHints: {},                     value: '無職' },
    ],
  },
];
