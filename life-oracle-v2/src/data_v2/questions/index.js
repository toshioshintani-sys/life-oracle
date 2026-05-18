import { UNIVERSAL_QUESTIONS }      from './universal.js';
import { WORK_QUESTIONS }           from './work.js';
import { RELATION_QUESTIONS }       from './relation.js';
import { SELF_QUESTIONS }           from './self.js';
import { DEMOGRAPHIC_QUESTIONS }    from './demographics.js';
import { DISCRIMINATING_QUESTIONS } from './discriminating.js';

export const ALL_QUESTIONS = [
  ...UNIVERSAL_QUESTIONS,
  ...DISCRIMINATING_QUESTIONS,
  ...WORK_QUESTIONS,
  ...RELATION_QUESTIONS,
  ...SELF_QUESTIONS,
  ...DEMOGRAPHIC_QUESTIONS,
];
