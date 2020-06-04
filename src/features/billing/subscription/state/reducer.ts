// Internal
import * as types from './constants';
import * as actions from './actions';
import { SubscriptionState } from './types';
import { ActionType } from '@types';

export const initialState: SubscriptionState = {
  selectedPlan: null,
  plans: [
    'starter',
    'plus',
    'pro',
  ],
};

type SubscriptionActions = ActionType<typeof actions>;

export default (
  state = initialState,
  action: SubscriptionActions,
): SubscriptionState => {
  if (action.type === types.SUBSCRIBE) {
    return {
      ...state,
      selectedPlan: action.payload.,
    };
  } else {
    return state;
  }
};
