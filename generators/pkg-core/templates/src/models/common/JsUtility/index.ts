export type Modify<R, T> = Omit<R, keyof T> & T;
