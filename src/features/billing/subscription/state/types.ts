export type Plan = 'starter' | 'plus' | 'pro';

export interface ISubscriptionState {
  selectedPlan: Plan | null,
  plans: Plan[],
}

export type SubscriptionState = Readonly<ISubscriptionState>;
