export const BRAND = {
  bordeaux: '#8A1538',
  bordeauxDark: '#6E1029',
  navy: '#1B2A4A',
  gold: '#C9A227',
} as const;

export const IMAGES = {
  logo: '/images/ueb-logo.png',
  shield: '/images/ueb-shield.png',
  campusE4: '/images/ueb-campus-e4.jpg',
  building: '/images/ueb-building.jpg',
} as const;

export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Tổng quan', href: '#tong-quan' },
  { label: 'Thực trạng', href: '#thuc-trang' },
  { label: 'Tính năng', href: '#tinh-nang' },
  { label: 'Quy trình', href: '#quy-trinh' },
  { label: 'Demo trực tiếp', href: '#demo' },
  { label: 'Nhà trường', href: '#nha-truong' },
];

export interface HeroStat {
  value: number;
  suffix: string;
  label: string;
}

export const HERO_STATS: HeroStat[] = [
  { value: 3, suffix: ' cấp', label: 'Luồng duyệt khép kín' },
  { value: 6, suffix: '', label: 'Vai trò phân quyền' },
  { value: 86, suffix: '+', label: 'Cán bộ trong dữ liệu mẫu' },
  { value: 4, suffix: '', label: 'Báo cáo tự động cuối quý' },
];

export interface PainItem {
  text: string;
}

export const PAIN_COMPARISON: { manual: PainItem[]; digital: PainItem[] } = {
  manual: [
    { text: 'Chấm KPI thủ công trên Excel, giấy tờ phân tán giữa các khoa phòng' },
    { text: 'Minh chứng nộp rời rạc qua email, khó kiểm soát tính hợp lệ' },
    { text: 'Tổng hợp điểm cuối quý mất nhiều ngày, dễ sai sót khi làm tròn và đối chiếu khung xếp loại' },
    { text: 'Khiếu nại xử lý thủ công, thiếu kênh theo dõi minh bạch' },
  ],
  digital: [
    { text: 'Phiếu đánh giá luân chuyển tự động qua 3 cấp theo đúng mốc thời gian quy định' },
    { text: 'Minh chứng điện tử đính kèm từng sản phẩm, thẩm định trực tuyến tại cấp duyệt' },
    { text: 'Tự động làm tròn về số chia hết cho 5, khóa trần xếp loại theo lỗi tích lũy, đóng băng dữ liệu một nút bấm' },
    { text: 'Cổng khiếu nại trực tuyến 2 cấp tới Phòng Thanh tra và Hiệu trưởng' },
  ],
};

export interface Feature {
  icon: string;
  title: string;
  description: string;
  points: string[];
}

export const FEATURES: Feature[] = [
  {
    icon: 'Layers',
    title: 'Quy trình 3 cấp khép kín',
    description:
      'Tự đánh giá, quản lý trực tiếp thẩm định, quản lý cấp cao chốt đơn vị, Hội đồng trường ban hành.',
    points: ['Trả phiếu kèm lý do bắt buộc', 'Lịch sử ký điện tử 3 cấp', 'Đóng băng dữ liệu quý'],
  },
  {
    icon: 'BookOpen',
    title: 'Bộ tiêu chí động 2 khối',
    description:
      'Giảng viên: giảng dạy, nghiên cứu khoa học, phục vụ cộng đồng. Chuyên viên: sản phẩm theo danh mục chuẩn.',
    points: ['Điểm định mức khóa read-only', 'Điểm cộng cải tiến sáng tạo', 'KPIs đơn vị theo quý'],
  },
  {
    icon: 'FileCheck',
    title: 'Minh chứng và giải trình minh bạch',
    description:
      'Mỗi sản phẩm bắt buộc kèm file hoặc link minh chứng. Luồng khiếu nại trực tuyến sau ngày ban hành.',
    points: ['File PDF/Word/ảnh hoặc link', 'Ký xác nhận ban chủ nhiệm', 'Khiếu nại 2 cấp trực tuyến'],
  },
  {
    icon: 'BarChart3',
    title: 'Dashboard trực quan thời gian thực',
    description:
      'Ban Giám hiệu theo dõi toàn trường theo thời gian thực: tiến độ duyệt, phân bổ xếp loại, kỷ luật.',
    points: ['Lưới cảnh báo KPI đơn vị', 'Xu hướng tăng trưởng theo quý', 'Bảng xếp hạng lỗi hệ thống'],
  },
];

export interface Step {
  title: string;
  timeline: string;
  description: string;
  items: string[];
}

export const STEPS: Step[] = [
  {
    title: 'Khai báo và tự đánh giá',
    timeline: 'Ngày 01–06 đầu quý sau',
    description: 'Phòng chức năng nhập vi phạm, cá nhân chọn sản phẩm từ danh mục và gửi cấp trên.',
    items: ['Nhập vi phạm kỷ luật, chuyên cần', 'Chọn sản phẩm, đính kèm minh chứng', 'Kê khai giờ chuẩn và thành tích'],
  },
  {
    title: 'Thẩm định 2 cấp quản lý',
    timeline: 'Ngày 07–12 đầu quý sau',
    description: 'Quản lý trực tiếp thẩm định minh chứng, quản lý cấp cao chốt bảng điểm đơn vị.',
    items: ['Kiểm tra minh chứng, thẩm định chất lượng', 'Ghi nhận CTST và lỗi thái độ', 'Chốt và khóa phiếu đơn vị'],
  },
  {
    title: 'Ban hành và khiếu nại',
    timeline: 'Ngày 13–15 đầu quý sau',
    description: 'Hội đồng trường làm tròn, chặn trần, ban hành và mở cổng khiếu nại trực tuyến.',
    items: ['Làm tròn về số chia hết cho 5', 'Khóa trần theo lỗi tích lũy', 'Xuất 4 báo cáo, mở khiếu nại'],
  },
];

export interface Preview {
  key: 'dashboard' | 'self-assessment' | 'approval';
  tab: string;
  title: string;
  description: string;
  bullets: string[];
}

export const PREVIEWS: Preview[] = [
  {
    key: 'dashboard',
    tab: 'Bảng điều khiển',
    title: 'Góc nhìn theo từng vai trò',
    description: 'Cá nhân theo dõi tiến độ, trưởng đơn vị duyệt phiếu, BGH xem toàn trường thời gian thực.',
    bullets: ['Đồng hồ điểm và dự báo xếp loại', 'So sánh điểm giữa các bộ môn', 'Lưới cảnh báo KPI toàn trường'],
  },
  {
    key: 'self-assessment',
    tab: 'Phiếu tự đánh giá',
    title: 'Khai báo sản phẩm theo danh mục',
    description: 'Chọn sản phẩm chuẩn hóa, điểm định mức khóa sẵn, đính kèm minh chứng rồi gửi duyệt.',
    bullets: ['Điểm định mức read-only', 'File hoặc link minh chứng bắt buộc', 'Nút gửi quản lý trực tiếp'],
  },
  {
    key: 'approval',
    tab: 'Phê duyệt',
    title: 'Thẩm định và trả phiếu trực tuyến',
    description: 'Cấp duyệt kiểm tra minh chứng, duyệt hoặc trả về kèm lý do bắt buộc.',
    bullets: ['Duyệt từng sản phẩm', 'Yêu cầu chỉnh sửa kèm lý do', 'Lịch sử phê duyệt đầy đủ'],
  },
];

export const REPORTS = [
  'Phiếu tự đánh giá và xếp loại cá nhân (PDF)',
  'Tổng hợp kết quả toàn đơn vị (Excel/PDF)',
  'Thống kê xếp loại phân khối toàn trường',
  'Quỹ điểm chi trả thu nhập tăng thêm',
] as const;

export const FOOTER_CONTACT = {
  school: 'Trường Đại học Kinh tế — ĐHQGHN',
  address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
  email: 'tuyensinh@ueb.edu.vn',
  phone: '(024) 3754 7506',
} as const;
