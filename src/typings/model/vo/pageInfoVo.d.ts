export interface PageInfoVO<T> {
  current: number;
  size: number;
  total: number;
  records: T[];
}
