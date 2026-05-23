// data_v2 統合エクスポート

export { ANGLES } from './meta/angles.js';
export { biasInfo } from './meta/biasInfo.js';
export { cognitiveFunctionMap, famousPeople } from './meta/cognitiveFunctions.js';

export { eiSelf } from './self/ei.js';
export { tfSelf } from './self/tf.js';
export { snSelf } from './self/sn.js';
export { jpSelf } from './self/jp.js';

export { b01Loss } from './bias/b01_loss.js';
export { b02Present } from './bias/b02_present.js';
export { b06StatusQuo } from './bias/b06_status_quo.js';
export { b08SunkCost } from './bias/b08_sunk_cost.js';
export { situationQuestions } from './bias/situations.js';
export { ACCIDENTS } from './meta/accidents.js';

import { eiSelf } from './self/ei.js';
import { tfSelf } from './self/tf.js';
import { snSelf } from './self/sn.js';
import { jpSelf } from './self/jp.js';
import { b01Loss } from './bias/b01_loss.js';
import { b02Present } from './bias/b02_present.js';
import { b06StatusQuo } from './bias/b06_status_quo.js';
import { b08SunkCost } from './bias/b08_sunk_cost.js';
import { situationQuestions } from './bias/situations.js';

export const ALL_QUESTIONS = [
  ...eiSelf,
  ...tfSelf,
  ...snSelf,
  ...jpSelf,
  ...b01Loss,
  ...b02Present,
  ...b06StatusQuo,
  ...b08SunkCost,
  ...situationQuestions,
];

export const AXIS_QUESTIONS = ALL_QUESTIONS.filter(q => q.kind === 'axis');
export const BIAS_QUESTIONS = ALL_QUESTIONS.filter(q => q.kind === 'bias');
