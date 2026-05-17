export const DEMOGRAPHIC_QUESTIONS = [
  {
    id: 'demo_age',
    type: 'demographic_age',
    text: '今、何歳ですか？',
    discriminates: [],
    choices: [
      { id: 'age_20early', label: '10代・20代前半（〜24歳）', value: '20代前半' },
      { id: 'age_20late',  label: '20代後半（25〜29歳）',     value: '20代後半' },
      { id: 'age_30',      label: '30代（30〜39歳）',          value: '30代' },
      { id: 'age_40',      label: '40代（40〜49歳）',          value: '40代' },
      { id: 'age_50over',  label: '50代以上（50歳〜）',        value: '50代以上' },
    ],
  },
  {
    id: 'demo_job',
    type: 'demographic_job',
    text: '今の立場に一番近いものは？',
    discriminates: [],
    choices: [
      { id: 'job_employee',   label: '会社員・公務員',               value: '会社員' },
      { id: 'job_freelance',  label: 'フリーランス・自営業・経営者', value: 'フリーランス' },
      { id: 'job_student',    label: '学生',                         value: '学生' },
      { id: 'job_homemaker',  label: '主婦・主夫',                   value: '主婦/主夫' },
      { id: 'job_irregular',  label: 'パート・アルバイト・派遣',     value: '非正規雇用' },
      { id: 'job_none',       label: '現在は働いていない',           value: '無職' },
    ],
  },
];
