export type ActionType<TActions extends { [key: string]: (...args: any) => any }> = ReturnType<
TActions[keyof TActions]
>;
