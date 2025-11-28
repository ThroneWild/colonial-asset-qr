import { describe, it, expect } from 'vitest';
import { MS_PER_DAY, DAYS_IN_PERIOD, getDaysFromNow } from './dateConstants';

describe('dateConstants', () => {
  describe('MS_PER_DAY', () => {
    it('should equal milliseconds in a day', () => {
      expect(MS_PER_DAY).toBe(1000 * 60 * 60 * 24);
      expect(MS_PER_DAY).toBe(86400000);
    });
  });

  describe('DAYS_IN_PERIOD', () => {
    it('should have correct period values', () => {
      expect(DAYS_IN_PERIOD.WEEK).toBe(7);
      expect(DAYS_IN_PERIOD.MONTH).toBe(30);
      expect(DAYS_IN_PERIOD.QUARTER).toBe(90);
      expect(DAYS_IN_PERIOD.YEAR).toBe(365);
    });
  });

  describe('getDaysFromNow', () => {
    it('should calculate days from now correctly', () => {
      const today = new Date();
      expect(getDaysFromNow(today)).toBeCloseTo(0, 1);
    });

    it('should calculate days for past date', () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * MS_PER_DAY);
      expect(getDaysFromNow(sevenDaysAgo)).toBeCloseTo(7, 1);
    });

    it('should calculate days for 30 days ago', () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * MS_PER_DAY);
      expect(getDaysFromNow(thirtyDaysAgo)).toBeCloseTo(30, 1);
    });

    it('should return negative for future dates', () => {
      const tomorrow = new Date(Date.now() + MS_PER_DAY);
      expect(getDaysFromNow(tomorrow)).toBeLessThan(0);
    });
  });
});
