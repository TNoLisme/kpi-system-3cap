import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  ArrowRight, Award, BarChart3, BookOpen, CheckCircle2, ChevronRight,
  FileCheck, FileWarning, Home, Layers, MonitorPlay, ShieldCheck, Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { PageKey } from '@/types';
import {
  BRAND, FEATURES, FOOTER_CONTACT, HERO_STATS, IMAGES, NAV_LINKS,
  PAIN_COMPARISON, PREVIEWS, REPORTS, STEPS, type Preview,
} from './landingData';

interface LandingPageProps {
  onEnterDemo: (page?: PageKey) => void;
}

const FEATURE_ICONS: Record<string, LucideIcon> = {
  Layers, BookOpen, FileCheck, BarChart3,
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const inViewProps = {
  initial: 'hidden' as const,
  whileInView: 'show' as const,
  viewport: { once: true, margin: '-40px' } as const,
};

function StatCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1200, 1);
          setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);
  return (
    <span ref={ref}>
      {shown}
      {suffix}
    </span>
  );
}

function SectionHeading({ kicker, title, desc }: { kicker: string; title: string; desc: string }) {
  return (
    <motion.div
      variants={fadeUp}
      {...inViewProps}
      className="mx-auto max-w-3xl text-center"
    >
      <p
        className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider"
        style={{ backgroundColor: `${BRAND.gold}22`, color: BRAND.bordeaux }}
      >
        <Sparkles size={13} aria-hidden />
        {kicker}
      </p>
      <h2 className="text-balance text-3xl font-bold text-neutral-900 md:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-relaxed text-neutral-600">{desc}</p>
    </motion.div>
  );
}

export function LandingPage({ onEnterDemo }: LandingPageProps) {
  const [activePreview, setActivePreview] = useState<Preview>(PREVIEWS[0]);
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <a href="#tong-quan" className="flex items-center gap-3">
            <img src={IMAGES.logo} alt="Logo Trường Đại học Kinh tế - ĐHQGHN" className="h-10 w-auto" />
            <span className="hidden sm:block">
              <span className="block text-sm font-bold leading-tight" style={{ color: BRAND.bordeaux }}>
                Hệ thống đánh giá KPI 3 cấp
              </span>
              <span className="block text-xs text-neutral-500">Dành cho Trường ĐH Kinh tế — ĐHQGHN</span>
            </span>
          </a>
          <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={() => onEnterDemo('dashboard')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-ueb-glow hidden items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white sm:inline-flex"
              style={{ backgroundColor: BRAND.bordeaux }}
            >
              <MonitorPlay size={16} aria-hidden />
              Trải nghiệm hệ thống demo
            </motion.button>
            <button
              type="button"
              aria-label={mobileNav ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={mobileNav}
              onClick={() => setMobileNav((v) => !v)}
              className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 lg:hidden"
            >
              <Home size={20} aria-hidden />
            </button>
          </div>
        </div>
        {mobileNav && (
          <nav aria-label="Điều hướng di động" className="border-t border-neutral-200 bg-white px-4 py-2 lg:hidden">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileNav(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                {l.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => onEnterDemo('dashboard')}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: BRAND.bordeaux }}
            >
              <MonitorPlay size={16} aria-hidden />
              Trải nghiệm hệ thống demo
            </button>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section id="tong-quan" className="relative overflow-hidden text-white" style={{ backgroundColor: BRAND.navy }}>
        <img
          src={IMAGES.campusE4}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          loading="eager"
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(100deg, ${BRAND.navy}F2 20%, ${BRAND.navy}B3 55%, ${BRAND.bordeaux}99 100%)` }}
          aria-hidden
        />
        <img
          src={IMAGES.shield}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-16 top-1/2 hidden w-[420px] -translate-y-1/2 opacity-15 md:block"
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-2 lg:items-center">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
              <ShieldCheck size={14} aria-hidden style={{ color: BRAND.gold }} />
              Giải pháp chuyển đổi số cho UEB — VNU
            </p>
            <h1 className="text-balance text-3xl font-extrabold leading-tight md:text-5xl">
              Giải pháp chuyển đổi số đánh giá và xếp loại KPI chuẩn hóa dành riêng cho Trường Đại học Kinh tế — ĐHQGHN
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              Minh bạch từng minh chứng, tự động hóa quy trình 3 cấp từ tự đánh giá tới Hội đồng trường,
              báo cáo thời gian thực cho Ban Giám hiệu.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <motion.button
                type="button"
                onClick={() => onEnterDemo('dashboard')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-ueb-glow inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white"
                style={{ backgroundColor: BRAND.bordeaux }}
              >
                <MonitorPlay size={18} aria-hidden />
                Xem demo trực tiếp
                <ArrowRight size={16} aria-hidden />
              </motion.button>
              <a
                href="#quy-trinh"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                Quy trình 3 cấp hoạt động thế nào
              </a>
            </div>
            <motion.dl
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {HERO_STATS.map((s) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur"
                >
                  <dt className="order-2 mt-1 text-xs leading-snug text-white/75">{s.label}</dt>
                  <dd className="order-1 text-2xl font-extrabold md:text-3xl" style={{ color: BRAND.gold }}>
                    <StatCounter value={s.value} suffix={s.suffix} />
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative"
          >
            <div className="overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
              <img
                src={IMAGES.campusE4}
                alt="Tòa nhà E4 Trường Đại học Kinh tế - ĐHQGHN"
                className="h-64 w-full object-cover md:h-80"
                loading="eager"
              />
              <div className="bg-white p-5 text-neutral-900">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">Bảng điều khiển Ban Giám hiệu</p>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: BRAND.bordeaux }}
                  >
                    Thời gian thực
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">Lưới cảnh báo KPI, xu hướng theo quý, phân bổ xếp loại toàn trường.</p>
                <motion.button
                  type="button"
                  onClick={() => onEnterDemo('dashboard')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: BRAND.navy }}
                >
                  Mở dashboard mẫu
                  <ChevronRight size={16} aria-hidden />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Thực trạng */}
      <section id="thuc-trang" className="bg-neutral-50 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            kicker="Thực trạng và giải pháp"
            title="Từ Excel phân tán tới hệ thống khép kín"
            desc="Cách làm thủ công khiến minh chứng khó kiểm soát, tổng hợp cuối quý chậm và dễ sai sót. Giải pháp số hóa toàn bộ vòng đời phiếu đánh giá theo đúng tài liệu nghiệp vụ của nhà trường."
          />
          <motion.div
            variants={stagger}
            {...inViewProps}
            className="mt-10 grid gap-6 lg:grid-cols-2"
          >
            <motion.div variants={fadeUp} className="card p-6 md:p-8" style={{ borderTop: '4px solid #94a3b8' }}>
              <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
                <FileWarning size={20} className="text-neutral-400" aria-hidden />
                Chấm KPI thủ công
              </h3>
              <ul className="mt-5 space-y-4">
                {PAIN_COMPARISON.manual.map((p) => (
                  <li key={p.text} className="flex items-start gap-3 text-sm leading-relaxed text-neutral-600">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-600" aria-hidden>
                      ✕
                    </span>
                    {p.text}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={fadeUp} className="card p-6 md:p-8" style={{ borderTop: `4px solid ${BRAND.bordeaux}` }}>
              <h3 className="flex items-center gap-2 text-lg font-bold" style={{ color: BRAND.bordeaux }}>
                <CheckCircle2 size={20} aria-hidden />
                Số hóa toàn diện
              </h3>
              <ul className="mt-5 space-y-4">
                {PAIN_COMPARISON.digital.map((p) => (
                  <li key={p.text} className="flex items-start gap-3 text-sm leading-relaxed text-neutral-700">
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: BRAND.bordeaux }}
                      aria-hidden
                    >
                      ✓
                    </span>
                    {p.text}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tính năng */}
      <section id="tinh-nang" className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            kicker="Tính năng cốt lõi"
            title="Đúng nghiệp vụ đánh giá giảng viên và chuyên viên"
            desc="Bốn nhóm tính năng bám sát thiết kế luồng ứng dụng đánh giá KPI theo quý và 5 mẫu bảng điều khiển trong biểu mẫu báo cáo."
          />
          <motion.div
            variants={stagger}
            {...inViewProps}
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {FEATURES.map((f) => {
              const Icon = FEATURE_ICONS[f.icon] ?? Layers;
              return (
                <motion.article
                  key={f.title}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="card group p-6"
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: BRAND.bordeaux }}
                  >
                    <Icon size={22} aria-hidden />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{f.description}</p>
                  <ul className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-xs leading-relaxed text-neutral-600">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: BRAND.bordeaux }} aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Quy trình */}
      <section id="quy-trinh" className="py-16 text-white md:py-24" style={{ backgroundColor: BRAND.navy }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div
            variants={fadeUp}
            {...inViewProps}
            className="mx-auto max-w-3xl text-center"
          >
            <p
              className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider"
              style={{ backgroundColor: `${BRAND.gold}26`, color: BRAND.gold }}
            >
              <Layers size={13} aria-hidden />
              Vận hành theo quý
            </p>
            <h2 className="text-balance text-3xl font-bold md:text-4xl">Quy trình 3 bước trong học kỳ và năm học</h2>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              Mốc thời gian theo đúng sơ đồ luồng xử lý đánh giá quý chuẩn: phiếu luân chuyển tuần tự,
              không bỏ bước, khóa số liệu trước khi ban hành.
            </p>
          </motion.div>
          <motion.ol
            variants={stagger}
            {...inViewProps}
            className="mt-10 grid gap-6 lg:grid-cols-3"
          >
            {STEPS.map((s, i) => (
              <motion.li
                key={s.title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur"
              >
                <span
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-lg font-extrabold"
                  style={{ backgroundColor: BRAND.gold, color: BRAND.navy }}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: BRAND.gold }}>
                  {s.timeline}
                </p>
                <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{s.description}</p>
                <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-white/85">
                      <ChevronRight size={15} className="mt-0.5 shrink-0" style={{ color: BRAND.gold }} aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </motion.ol>
          <motion.div
            variants={fadeUp}
            {...inViewProps}
            className="mt-10 rounded-2xl border border-white/15 bg-white/5 p-6"
          >
            <h3 className="flex items-center gap-2 text-base font-bold">
              <Award size={18} style={{ color: BRAND.gold }} aria-hidden />
              Hệ thống tự động xuất 4 báo cáo khi đóng băng dữ liệu quý
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {REPORTS.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-white/85">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0" style={{ color: BRAND.gold }} aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Demo preview */}
      <section id="demo" className="bg-neutral-50 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            kicker="Xem trước trực tiếp"
            title="Ba màn hình chính của hệ thống demo"
            desc="Chuyển tab để xem mô tả từng màn hình, sau đó bấm để nhảy thẳng vào đúng trang trong ứng dụng demo với đầy đủ 6 vai trò và dữ liệu mẫu."
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mt-8 flex flex-wrap justify-center gap-2"
            role="tablist"
            aria-label="Chọn màn hình xem trước"
          >
            {PREVIEWS.map((p) => {
              const active = activePreview.key === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActivePreview(p)}
                  className="relative rounded-xl px-5 py-2.5 text-sm font-semibold"
                  style={
                    active
                      ? { color: '#fff' }
                      : { backgroundColor: '#fff', color: '#475569', border: '1px solid #e2e8f0' }
                  }
                >
                  {active && (
                    <motion.span
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 rounded-xl"
                      style={{ backgroundColor: BRAND.bordeaux }}
                      transition={{ duration: 0.25 }}
                    />
                  )}
                  <span className="relative z-10">{p.tab}</span>
                </button>
              );
            })}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="card mx-auto mt-6 max-w-4xl p-6 md:p-10"
            role="tabpanel"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activePreview.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: BRAND.bordeaux }}>
                  {activePreview.tab}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-neutral-900">{activePreview.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 md:text-base">{activePreview.description}</p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                  {activePreview.bullets.map((b) => (
                    <li key={b} className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <motion.button
                    type="button"
                    onClick={() => onEnterDemo(activePreview.key)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-ueb-glow inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white"
                    style={{ backgroundColor: BRAND.bordeaux }}
                  >
                    <MonitorPlay size={17} aria-hidden />
                    Mở {activePreview.tab.toLowerCase()} trong demo
                    <ArrowRight size={16} aria-hidden />
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => onEnterDemo('dashboard')}
                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
                  >
                    Vào trang chủ hệ thống
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Nhà trường */}
      <section id="nha-truong" className="bg-white py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <p
              className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider"
              style={{ backgroundColor: `${BRAND.gold}22`, color: BRAND.bordeaux }}
            >
              <ShieldCheck size={13} aria-hidden />
              Tin cậy học thuật
            </p>
            <h2 className="text-balance text-3xl font-bold text-neutral-900 md:text-4xl">
              Thiết kế cho môi trường đại học nghiên cứu
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-600">
              Phân quyền theo đúng cơ cấu khoa, phòng, Ban Giám hiệu. Mỗi cấp chỉ thấy đúng phần việc của mình,
              mọi thao tác duyệt và trả phiếu đều lưu lịch sử ký điện tử để phục vụ thanh tra và kiểm định.
            </p>
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <img src={IMAGES.shield} alt="Biểu tượng khiên UEB 1974" className="h-16 w-16 shrink-0 object-contain" loading="lazy" />
              <p className="text-sm leading-relaxed text-neutral-600">
                Nhận diện bordeaux, navy và gold lấy trực tiếp từ logo khiên UEB, đồng bộ từ landing page
                tới từng màn hình trong hệ thống demo.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <img
              src={IMAGES.campusE4}
              alt="Tòa nhà E4 hiện đại của Trường Đại học Kinh tế - ĐHQGHN"
              className="h-56 w-full rounded-2xl object-cover shadow-md"
              loading="lazy"
            />
            <img
              src={IMAGES.building}
              alt="Cổng trường và tòa nhà chính diện UEB"
              className="h-56 w-full rounded-2xl object-cover shadow-md sm:mt-8"
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white" style={{ backgroundColor: BRAND.navy }}>
        <div
          className="h-1"
          style={{ background: `linear-gradient(90deg, ${BRAND.bordeaux}, ${BRAND.gold})` }}
          aria-hidden
        />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:px-6 lg:grid-cols-3">
          <div>
            <img src={IMAGES.logo} alt="Logo Trường Đại học Kinh tế - ĐHQGHN" className="h-12 w-auto rounded bg-white p-1" loading="lazy" />
            <p className="mt-4 text-sm font-bold">{FOOTER_CONTACT.school}</p>
            <p className="mt-1 text-sm text-white/70">{FOOTER_CONTACT.address}</p>
          </div>
          <nav aria-label="Liên kết nhanh">
            <p className="text-sm font-bold uppercase tracking-wider" style={{ color: BRAND.gold }}>
              Khám phá
            </p>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-white/75 transition-colors hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider" style={{ color: BRAND.gold }}>
              Bắt đầu trình diễn
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Mở hệ thống demo với đầy đủ 6 vai trò, dữ liệu mẫu quý 3/2026 và luồng duyệt 3 cấp.
            </p>
            <motion.button
              type="button"
              onClick={() => onEnterDemo('dashboard')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-ueb-glow mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold"
              style={{ color: BRAND.bordeaux }}
            >
              <MonitorPlay size={16} aria-hidden />
              Vào hệ thống demo
            </motion.button>
            <p className="mt-4 text-xs text-white/55">
              Liên hệ: {FOOTER_CONTACT.email} • {FOOTER_CONTACT.phone}
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/55 md:flex-row md:px-6">
            <p>Bản trình diễn phục vụ pitching. Hình ảnh và nhận diện UEB thuộc về nhà trường.</p>
            <p>Kỳ dữ liệu mẫu: Quý 3/2026</p>
          </div>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
}
