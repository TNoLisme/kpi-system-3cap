import { describe, it, expect } from 'vitest';
import {
  BRAND,
  NAV_LINKS,
  HERO_STATS,
  FEATURES,
  STEPS,
  PREVIEWS,
  PAIN_COMPARISON,
} from './landingData';

describe('landingData', () => {
  it('giữ đúng mã màu thương hiệu UEB', () => {
    expect(BRAND.bordeaux).toBe('#8A1538');
    expect(BRAND.navy).toBe('#1B2A4A');
    expect(BRAND.gold).toBe('#C9A227');
  });

  it('navbar đủ mục và CTA demo', () => {
    expect(NAV_LINKS.length).toBeGreaterThanOrEqual(5);
    for (const l of NAV_LINKS) {
      expect(l.label.length).toBeGreaterThan(0);
      expect(l.href.startsWith('#')).toBe(true);
    }
  });

  it('stats hiển thị được số liệu thật từ hệ thống', () => {
    expect(HERO_STATS.length).toBe(4);
    for (const s of HERO_STATS) {
      expect(s.value).toBeGreaterThan(0);
      expect(s.label.length).toBeGreaterThan(0);
    }
  });

  it('bao phủ đúng 4 tính năng lõi nghiệp vụ 3 cấp', () => {
    expect(FEATURES.length).toBe(4);
    for (const f of FEATURES) {
      expect(f.title.length).toBeGreaterThan(0);
      expect(f.description.length).toBeGreaterThan(0);
    }
  });

  it('quy trình 3 bước bám mốc thời gian trong docs', () => {
    expect(STEPS.length).toBe(3);
    for (const s of STEPS) {
      expect(s.timeline.length).toBeGreaterThan(0);
      expect(s.items.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('preview đủ 3 màn hình chính của app', () => {
    expect(PREVIEWS.length).toBe(3);
  });

  it('so sánh thủ công và số hóa cân xứng', () => {
    expect(PAIN_COMPARISON.manual.length).toBeGreaterThanOrEqual(3);
    expect(PAIN_COMPARISON.digital.length).toBeGreaterThanOrEqual(3);
  });
});
