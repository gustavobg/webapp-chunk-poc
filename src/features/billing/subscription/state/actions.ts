// Internal
import * as types from './constants';
import { Plan } from './types';

export const subscribe = (selectedPlan: Plan) => ({
  type: types.SUBSCRIBE,
  payload: selectedPlan,
} as const);
