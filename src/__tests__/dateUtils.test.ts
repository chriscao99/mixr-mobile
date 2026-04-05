import { daysFromNow, datetimeFromNow, resolveDateRange, isDateInRange } from '../data/dateUtils';

// Helper: format a Date to YYYY-MM-DD
function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

describe('daysFromNow', () => {
  it('returns today when n is 0', () => {
    const today = formatDate(new Date());
    expect(daysFromNow(0)).toBe(today);
  });

  it('returns tomorrow when n is 1', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(daysFromNow(1)).toBe(formatDate(tomorrow));
  });

  it('returns yesterday when n is -1', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(daysFromNow(-1)).toBe(formatDate(yesterday));
  });

  it('returns a date far in the future', () => {
    const future = new Date();
    future.setDate(future.getDate() + 365);
    expect(daysFromNow(365)).toBe(formatDate(future));
  });

  it('returns a YYYY-MM-DD formatted string', () => {
    const result = daysFromNow(0);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('datetimeFromNow', () => {
  it('returns an ISO datetime string', () => {
    const result = datetimeFromNow(0, 14);
    // Should be a valid ISO string
    expect(() => new Date(result)).not.toThrow();
    expect(result).toContain('T');
  });

  it('includes the specified hour', () => {
    const result = datetimeFromNow(0, 22, 30);
    const d = new Date(result);
    expect(d.getHours()).toBe(22);
    expect(d.getMinutes()).toBe(30);
  });

  it('defaults minute to 0', () => {
    const result = datetimeFromNow(0, 10);
    const d = new Date(result);
    expect(d.getMinutes()).toBe(0);
  });
});

describe('resolveDateRange', () => {
  // We freeze "today" for predictable assertions
  const realDate = Date;

  afterEach(() => {
    global.Date = realDate;
  });

  function mockDate(isoDate: string) {
    const MockDate = class extends realDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(isoDate);
        } else {
          // @ts-ignore
          super(...args);
        }
      }
    } as any;
    MockDate.now = () => new realDate(isoDate).getTime();
    global.Date = MockDate;
  }

  describe('today preset', () => {
    it('returns start and end as the same date', () => {
      mockDate('2025-03-12T12:00:00.000Z');
      const { startDate, endDate } = resolveDateRange('today');
      expect(startDate).toBe(endDate);
      expect(startDate).toBe('2025-03-12');
    });
  });

  describe('this_week preset', () => {
    it('starts today and ends on Sunday', () => {
      // Wednesday March 12, 2025
      mockDate('2025-03-12T12:00:00.000Z');
      const { startDate, endDate } = resolveDateRange('this_week');
      expect(startDate).toBe('2025-03-12');
      // March 12 is Wednesday (day 3), Sunday is March 16
      expect(endDate).toBe('2025-03-16');
    });

    it('returns same day when today is Sunday', () => {
      // Sunday March 16, 2025
      mockDate('2025-03-16T12:00:00.000Z');
      const { startDate, endDate } = resolveDateRange('this_week');
      expect(startDate).toBe('2025-03-16');
      expect(endDate).toBe('2025-03-16');
    });
  });

  describe('this_weekend preset', () => {
    it('returns Saturday and Sunday of the current week', () => {
      // Wednesday March 12, 2025
      mockDate('2025-03-12T12:00:00.000Z');
      const { startDate, endDate } = resolveDateRange('this_weekend');
      expect(startDate).toBe('2025-03-15'); // Saturday
      expect(endDate).toBe('2025-03-16'); // Sunday
    });

    it('returns today and tomorrow when today is Saturday', () => {
      // Saturday March 15, 2025
      mockDate('2025-03-15T12:00:00.000Z');
      const { startDate, endDate } = resolveDateRange('this_weekend');
      expect(startDate).toBe('2025-03-15');
      expect(endDate).toBe('2025-03-16');
    });
  });

  describe('next_week preset', () => {
    it('returns Monday through Sunday of next week', () => {
      // Wednesday March 12, 2025
      mockDate('2025-03-12T12:00:00.000Z');
      const { startDate, endDate } = resolveDateRange('next_week');
      expect(startDate).toBe('2025-03-17'); // Next Monday
      expect(endDate).toBe('2025-03-23'); // Next Sunday
    });

    it('returns tomorrow through next Sunday when today is Sunday', () => {
      // Sunday March 16, 2025
      mockDate('2025-03-16T12:00:00.000Z');
      const { startDate, endDate } = resolveDateRange('next_week');
      expect(startDate).toBe('2025-03-17'); // Monday
      expect(endDate).toBe('2025-03-23'); // Sunday
    });
  });

  describe('this_month preset', () => {
    it('returns today through end of month', () => {
      // March 12, 2025
      mockDate('2025-03-12T12:00:00.000Z');
      const { startDate, endDate } = resolveDateRange('this_month');
      expect(startDate).toBe('2025-03-12');
      expect(endDate).toBe('2025-03-31');
    });

    it('handles February in a leap year', () => {
      // February 10, 2024 (leap year)
      mockDate('2024-02-10T12:00:00.000Z');
      const { startDate, endDate } = resolveDateRange('this_month');
      expect(startDate).toBe('2024-02-10');
      expect(endDate).toBe('2024-02-29');
    });

    it('handles February in a non-leap year', () => {
      // February 10, 2025 (not a leap year)
      mockDate('2025-02-10T12:00:00.000Z');
      const { startDate, endDate } = resolveDateRange('this_month');
      expect(startDate).toBe('2025-02-10');
      expect(endDate).toBe('2025-02-28');
    });
  });
});

describe('isDateInRange', () => {
  it('returns true when date equals start', () => {
    expect(isDateInRange('2025-03-12', '2025-03-12', '2025-03-15')).toBe(true);
  });

  it('returns true when date equals end', () => {
    expect(isDateInRange('2025-03-15', '2025-03-12', '2025-03-15')).toBe(true);
  });

  it('returns true when date is between start and end', () => {
    expect(isDateInRange('2025-03-13', '2025-03-12', '2025-03-15')).toBe(true);
  });

  it('returns false when date is before start', () => {
    expect(isDateInRange('2025-03-11', '2025-03-12', '2025-03-15')).toBe(false);
  });

  it('returns false when date is after end', () => {
    expect(isDateInRange('2025-03-16', '2025-03-12', '2025-03-15')).toBe(false);
  });

  it('returns true when start equals end and date matches', () => {
    expect(isDateInRange('2025-03-12', '2025-03-12', '2025-03-12')).toBe(true);
  });

  it('returns false when start equals end and date does not match', () => {
    expect(isDateInRange('2025-03-13', '2025-03-12', '2025-03-12')).toBe(false);
  });

  it('handles year boundaries', () => {
    expect(isDateInRange('2025-01-01', '2024-12-31', '2025-01-02')).toBe(true);
  });
});
