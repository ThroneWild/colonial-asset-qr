export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const DAYS_IN_PERIOD = {
  WEEK: 7,
  MONTH: 30,
  QUARTER: 90,
  YEAR: 365,
} as const;

export const getDaysFromNow = (date: Date): number => {
  return (Date.now() - date.getTime()) / MS_PER_DAY;
};
