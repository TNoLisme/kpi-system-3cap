import { describe, it, expect } from 'vitest';
import {
  roundToFive,
  classifyScore,
  calculateInnovationScore,
  getKpiCeiling,
  getCoordinationCeiling,
  getAttitudeCeiling,
  applyClassificationCeiling,
  calculateTicketScore,
} from './kpiRules';
import type { ProductItem } from '@/types';

describe('kpiRules domain functions', () => {
  it('classifies scores into 8 categories accurately', () => {
    expect(classifyScore(115)).toBe('A1');
    expect(classifyScore(110)).toBe('A1');
    expect(classifyScore(100)).toBe('A2');
    expect(classifyScore(90)).toBe('A3');
    expect(classifyScore(80)).toBe('B1');
    expect(classifyScore(70)).toBe('B2');
    expect(classifyScore(60)).toBe('B3');
    expect(classifyScore(50)).toBe('C');
    expect(classifyScore(49.9)).toBe('D');
    expect(classifyScore(30)).toBe('D');
  });

  it('rounds scores to the nearest multiple of 5', () => {
    expect(roundToFive(82.4)).toBe(80);
    expect(roundToFive(82.5)).toBe(85);
    expect(roundToFive(107.5)).toBe(110);
    expect(roundToFive(59.9)).toBe(60);
    expect(roundToFive(0)).toBe(0);
  });

  it('calculates innovation CTST scores (1 ST = 3 CT)', () => {
    expect(calculateInnovationScore(6, 2)).toBe(12); // 6 + 2*3 = 12
    expect(calculateInnovationScore(0, 0)).toBe(0);
    expect(calculateInnovationScore(5, 1)).toBe(8);
  });

  it('evaluates unit KPI ceiling (< 5% => B3)', () => {
    expect(getKpiCeiling(4.9)).toBe('B3');
    expect(getKpiCeiling(3.0)).toBe('B3');
    expect(getKpiCeiling(5.0)).toBeNull();
    expect(getKpiCeiling(10.0)).toBeNull();
  });

  it('evaluates coordination error ceiling', () => {
    expect(getCoordinationCeiling(1)).toBeNull();
    expect(getCoordinationCeiling(2)).toBe('B1');
    expect(getCoordinationCeiling(3)).toBe('B2');
    expect(getCoordinationCeiling(4)).toBe('B3');
    expect(getCoordinationCeiling(5)).toBe('C');
    expect(getCoordinationCeiling(6)).toBe('D');
  });

  it('evaluates attitude error ceiling', () => {
    expect(getAttitudeCeiling(2)).toBeNull();
    expect(getAttitudeCeiling(4)).toBe('B1');
    expect(getAttitudeCeiling(7)).toBe('B2');
    expect(getAttitudeCeiling(8)).toBe('C');
    expect(getAttitudeCeiling(9)).toBe('D');
  });

  it('applies strictest ceiling correctly', () => {
    expect(applyClassificationCeiling('A1', ['B3', 'B2'])).toBe('B3');
    expect(applyClassificationCeiling('A2', ['B1'])).toBe('B1');
    expect(applyClassificationCeiling('B2', ['A1'])).toBe('B2'); // ceiling is higher, stays B2
    expect(applyClassificationCeiling('A1', [null, undefined])).toBe('A1');
    expect(applyClassificationCeiling('A3', ['D'])).toBe('D');
  });

  it('calculates full ticket score from products, CTST, and deductions', () => {
    const products: ProductItem[] = [
      {
        id: 'p1',
        category: 'Báo cáo',
        categoryCode: 'SP01',
        contribution: 100,
        completedDate: '2026-10-05',
        evidenceName: 'report.pdf',
        evidenceType: 'file',
        status: 'da-duyet',
        maxScore: 20,
      },
      {
        id: 'p2',
        category: 'Đề án',
        categoryCode: 'SP02',
        contribution: 50,
        completedDate: '2026-10-06',
        evidenceName: 'project.pdf',
        evidenceType: 'file',
        status: 'da-duyet',
        maxScore: 40, // 40 * 50% = 20
      },
      {
        id: 'p3',
        category: 'Bài báo',
        categoryCode: 'SP03',
        contribution: 100,
        completedDate: '2026-10-07',
        evidenceName: 'paper.pdf',
        evidenceType: 'file',
        status: 'cho-duyet', // Pending - not counted
        maxScore: 30,
      },
    ];

    // productScore = 20 + 20 = 40
    // innovationScore = 5 + 1*3 = 8
    // deduction = 2
    // raw = 40 + 8 - 2 = 46
    // rounded = 45 -> 'D' (since 45 < 50)
    const result = calculateTicketScore(products, 5, 1, 2);
    expect(result.rawScore).toBe(46);
    expect(result.roundedScore).toBe(45);
    expect(result.classification).toBe('D');
  });
});
