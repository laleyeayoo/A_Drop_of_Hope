import { isValidPartialDate } from '../dates';

describe('isValidPartialDate', () => {
  it.each(['2024', '2024-02', '2024-02-29', '2023-12-31'])('accepts %s', (value) => {
    expect(isValidPartialDate(value)).toBe(true);
  });
  it.each(['24', '2024-13', '2023-02-29', '2024/01/01', 'last year', ''])('rejects %s', (value) => {
    expect(isValidPartialDate(value)).toBe(false);
  });
});
