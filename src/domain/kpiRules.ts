import type { Classification, ProductItem } from '@/types';

export const CLASSIFICATION_ORDER: Classification[] = [
  'A1',
  'A2',
  'A3',
  'B1',
  'B2',
  'B3',
  'C',
  'D',
];

/**
 * Làm tròn điểm về số gần nhất chia hết cho 5
 * Ví dụ: 82.4 -> 80, 82.5 -> 85
 */
export function roundToFive(score: number): number {
  return Math.round(score / 5) * 5;
}

/**
 * Ánh xạ tổng điểm sang 8 bậc xếp loại (theo thang điểm chuẩn Trường ĐH Kinh tế)
 * A1 >= 110, A2: 100-109, A3: 90-99, B1: 80-89, B2: 70-79, B3: 60-69, C: 50-59, D < 50
 */
export function classifyScore(score: number): Classification {
  if (score >= 110) return 'A1';
  if (score >= 100) return 'A2';
  if (score >= 90) return 'A3';
  if (score >= 80) return 'B1';
  if (score >= 70) return 'B2';
  if (score >= 60) return 'B3';
  if (score >= 50) return 'C';
  return 'D';
}

/**
 * Tính điểm thưởng Cải tiến - Sáng tạo (CTST)
 * Quy tắc: 1 đơn vị Sáng tạo (ST) = 3 điểm Cải tiến (CT)
 */
export function calculateInnovationScore(ctPoints: number, innovationUnits: number): number {
  return Math.max(0, ctPoints) + Math.max(0, innovationUnits) * 3;
}

/**
 * Khống chế trần xếp loại theo mức tăng trưởng KPI đơn vị (MODULE 3)
 * Nếu % giá trị KPI tăng thêm trong Quý < 5% -> Tối đa B3
 */
export function getKpiCeiling(kpiGrowth: number): Classification | null {
  if (kpiGrowth < 5) {
    return 'B3';
  }
  return null;
}

/**
 * Khống chế trần xếp loại theo số lỗi Thái độ (TĐ1 - TĐ11) - Theo Phụ lục V
 */
export function getAttitudeCeiling(count: number, highPerformance = false): Classification | null {
  if (highPerformance) {
    if (count >= 9) return 'D';
    if (count >= 6) return 'B1';
    return null;
  }

  if (count >= 9) return 'D';
  if (count === 8) return 'C';
  if (count >= 6) return 'B2';
  if (count >= 4) return 'B1';
  return null;
}

/**
 * Khống chế trần xếp loại theo lỗi Phối hợp liên phòng ban - Theo Phụ lục II/III mục 5.3
 */
export function getCoordinationCeiling(count: number): Classification | null {
  if (count >= 6) return 'D';
  if (count === 5) return 'C';
  if (count === 4) return 'B3';
  if (count === 3) return 'B2';
  if (count === 2) return 'B1';
  return null;
}

/**
 * Áp trần xếp loại: Trả về mức xếp loại thấp nhất (nghiêm ngặt nhất)
 * Thứ tự: A1 > A2 > A3 > B1 > B2 > B3 > C > D
 */
export function applyClassificationCeiling(
  classification: Classification,
  ceilings: Array<Classification | null | undefined>
): Classification {
  let highestIndex = CLASSIFICATION_ORDER.indexOf(classification);

  for (const ceiling of ceilings) {
    if (!ceiling) continue;
    const ceilingIndex = CLASSIFICATION_ORDER.indexOf(ceiling);
    if (ceilingIndex > highestIndex) {
      highestIndex = ceilingIndex;
    }
  }

  return CLASSIFICATION_ORDER[highestIndex];
}

/**
 * Tính tổng điểm và xếp loại cho một phiếu đánh giá
 */
export function calculateTicketScore(
  products: ProductItem[],
  ctPoints: number,
  innovationUnits: number,
  deduction = 0
): { rawScore: number; roundedScore: number; classification: Classification } {
  const productScore = products.reduce((sum, p) => {
    if (p.status === 'da-duyet') {
      const score = p.actualScore ?? (p.maxScore * p.contribution) / 100;
      return sum + score;
    }
    return sum;
  }, 0);

  const innovationScore = calculateInnovationScore(ctPoints, innovationUnits);
  const rawScore = Math.max(0, productScore + innovationScore - deduction);
  const roundedScore = roundToFive(rawScore);
  const classification = classifyScore(roundedScore);

  return { rawScore, roundedScore, classification };
}
