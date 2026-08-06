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
export { b03Confirmation } from './bias/b03_confirmation.js';
export { b04Conformity } from './bias/b04_conformity.js';
export { b05Overconfidence } from './bias/b05_overconfidence.js';
export { b07Anchoring } from './bias/b07_anchoring.js';
export { b09Framing } from './bias/b09_framing.js';
export { b10Hindsight } from './bias/b10_hindsight.js';
export { b11Halo } from './bias/b11_halo.js';
export { b12Dissonance } from './bias/b12_dissonance.js';
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
import { b03Confirmation } from './bias/b03_confirmation.js';
import { b04Conformity } from './bias/b04_conformity.js';
import { b05Overconfidence } from './bias/b05_overconfidence.js';
import { b07Anchoring } from './bias/b07_anchoring.js';
import { b09Framing } from './bias/b09_framing.js';
import { b10Hindsight } from './bias/b10_hindsight.js';
import { b11Halo } from './bias/b11_halo.js';
import { b12Dissonance } from './bias/b12_dissonance.js';
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
  ...b03Confirmation,
  ...b04Conformity,
  ...b05Overconfidence,
  ...b07Anchoring,
  ...b09Framing,
  ...b10Hindsight,
  ...b11Halo,
  ...b12Dissonance,
  ...b06StatusQuo,
  ...b08SunkCost,
  ...situationQuestions,
];

export const AXIS_QUESTIONS = ALL_QUESTIONS.filter(q => q.kind === 'axis');
export const BIAS_QUESTIONS = ALL_QUESTIONS.filter(q => q.kind === 'bias');
