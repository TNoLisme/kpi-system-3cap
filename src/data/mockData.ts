import type {
  User, ProductItem, AssessmentTicket, ViolationRecord, ViolationCodeInfo,
  UnitSummary, Notification, Complaint, PeriodOption, RoleConfig,
  Classification, CompetencyAxis,
} from '@/types';

export const CURRENT_USER: User = {
  id: 'u001',
  name: 'Nguyễn Văn An',
  role: 'chuyen-vien',
  position: 'Chuyên viên',
  unit: 'Phòng Đào tạo',
  avatar: '',
};

export const PERIODS: PeriodOption[] = [
  { value: 'Q3-2026', label: 'Quý 3 / 2026' },
  { value: 'Q2-2026', label: 'Quý 2 / 2026' },
  { value: 'Q1-2026', label: 'Quý 1 / 2026' },
  { value: 'Q4-2025', label: 'Quý 4 / 2025' },
];

export const CURRENT_PERIOD = 'Q3-2026';

export const ROLE_CONFIGS: RoleConfig[] = [
  {
    role: 'chuyen-vien',
    label: 'Chuyên viên',
    icon: 'User',
    pages: ['dashboard', 'self-assessment', 'complaint'],
    defaultPage: 'dashboard',
  },
  {
    role: 'giang-vien',
    label: 'Giảng viên',
    icon: 'GraduationCap',
    pages: ['dashboard', 'self-assessment', 'complaint'],
    defaultPage: 'dashboard',
  },
  {
    role: 'truong-khoa',
    label: 'Trưởng Khoa/Phòng',
    icon: 'Users',
    pages: ['dashboard', 'approval'],
    defaultPage: 'dashboard',
  },
  {
    role: 'lanh-dao',
    label: 'Lãnh đạo & TCNS',
    icon: 'Building2',
    pages: ['dashboard', 'approval'],
    defaultPage: 'dashboard',
  },
  {
    role: 'ban-giam-hieu',
    label: 'Ban Giám Hiệu',
    icon: 'Award',
    pages: ['dashboard', 'admin-classification'],
    defaultPage: 'dashboard',
  },
  {
    role: 'thanh-tra',
    label: 'Phòng Thanh tra',
    icon: 'ShieldCheck',
    pages: ['dashboard', 'admin-classification', 'complaint'],
    defaultPage: 'dashboard',
  },
];

export const VIOLATION_CODES: ViolationCodeInfo[] = [
  { code: 'TĐ1', label: 'Đi muộn', category: 'hanh-chinh', description: 'Đi muộn quá giờ quy định không có lý do' },
  { code: 'TĐ2', label: 'Vắng không phép', category: 'hanh-chinh', description: 'Vắng mặt không xin phép' },
  { code: 'TĐ3', label: 'Quá hạn nộp sản phẩm', category: 'hanh-chinh', description: 'Nộp sản phẩm sau thời hạn quy định' },
  { code: 'TĐ4', label: 'Sai sót hành chính', category: 'hanh-chinh', description: 'Lỗi sai sót trong thủ tục hành chính' },
  { code: 'TĐ5', label: 'Không họp định kỳ', category: 'hanh-chinh', description: 'Vắng họp định kỳ không lý do' },
  { code: 'TĐ6', label: 'Chất lượng sản phẩm kém', category: 'chuyen-mon', description: 'Sản phẩm không đạt yêu cầu chất lượng' },
  { code: 'TĐ7', label: 'Sai sót chuyên môn', category: 'chuyen-mon', description: 'Lỗi sai sót trong công tác chuyên môn' },
  { code: 'TĐ8', label: 'Thái độ không hợp tác', category: 'thai-do', description: 'Thái độ không hợp tác với đồng nghiệp' },
  { code: 'TĐ9', label: 'Xung khắc khách hàng', category: 'thai-do', description: 'Có xung khắc với khách hàng/sinh viên' },
  { code: 'TĐ10', label: 'Vi phạm đạo đức', category: 'thai-do', description: 'Vi phạm đạo đức nghề nghiệp' },
  { code: 'TĐ11', label: 'Khác', category: 'thai-do', description: 'Các vi phạm khác' },
  { code: 'PH1', label: 'Không phối hợp', category: 'phoi-hop', description: 'Không phối hợp công tác liên ngành' },
  { code: 'PH2', label: 'Chậm trễ phối hợp', category: 'phoi-hop', description: 'Chậm trễ trong phối hợp thực hiện' },
];

export const PRODUCT_CATEGORIES = [
  { code: 'SP01', label: 'Báo cáo chuyên đề', maxScore: 10 },
  { code: 'SP02', label: 'Đề án quản lý', maxScore: 15 },
  { code: 'SP03', label: 'Nghiên cứu khoa học', maxScore: 20 },
  { code: 'SP04', label: 'Bài báo khoa học', maxScore: 15 },
  { code: 'SP05', label: 'Giáo trình/Bài giảng', maxScore: 10 },
  { code: 'SP06', label: 'Hội thảo/Tập huấn', maxScore: 10 },
  { code: 'SP07', label: 'Đề tài nghiên cứu', maxScore: 20 },
  { code: 'SP08', label: 'Sản phẩm phần mềm', maxScore: 15 },
  { code: 'SP09', label: 'Công trình xây dựng', maxScore: 10 },
  { code: 'SP10', label: 'Hồ sơ thi đua', maxScore: 5 },
];

export const MY_PRODUCTS: ProductItem[] = [
  {
    id: 'p001', userId: 'u001', category: 'Báo cáo chuyên đề', categoryCode: 'SP01',
    contribution: 15, completedDate: '2026-10-02',
    evidenceName: 'Bao_cao_chuyen_de_Q3.pdf', evidenceType: 'file',
    status: 'da-duyet', maxScore: 10, actualScore: 9,
  },
  {
    id: 'p002', userId: 'u001', category: 'Đề án quản lý', categoryCode: 'SP02',
    contribution: 20, completedDate: '2026-10-03',
    evidenceName: 'De_an_quan_ly_2026.pdf', evidenceType: 'file',
    status: 'da-duyet', maxScore: 15, actualScore: 14,
  },
  {
    id: 'p003', userId: 'u001', category: 'Bài báo khoa học', categoryCode: 'SP04',
    contribution: 25, completedDate: '2026-10-04',
    evidenceName: 'https://journal.edu.vn/article/123', evidenceType: 'link',
    status: 'cho-duyet', maxScore: 15,
  },
  {
    id: 'p004', userId: 'u001', category: 'Hội thảo/Tập huấn', categoryCode: 'SP06',
    contribution: 10, completedDate: '2026-10-04',
    evidenceName: 'Bao_cao_hoi_thao.pdf', evidenceType: 'file',
    status: 'cho-duyet', maxScore: 10,
  },
  {
    id: 'p005', userId: 'u001', category: 'Đề tài nghiên cứu', categoryCode: 'SP07',
    contribution: 30, completedDate: '2026-10-05',
    evidenceName: 'De_tai_NC_2026.pdf', evidenceType: 'file',
    status: 'yeu-cau-sua', maxScore: 20,
    revisionFeedback: 'Minh chứng file PDF bị mờ, thiếu chữ ký xác nhận của ban chủ nhiệm đề tài. Vui lòng bổ sung bản scan rõ nét trước ngày 10/10.',
    revisionFrom: 'Trưởng phòng Đào tạo',
  },
  // Sản phẩm của các nhân sự khác phục vụ duyệt
  {
    id: 'p010_1', userId: 'u010', category: 'Báo cáo chuyên môn', categoryCode: 'SP01',
    contribution: 20, completedDate: '2026-10-02',
    evidenceName: 'Bao_cao_pdt_u010.pdf', evidenceType: 'file',
    status: 'cho-duyet', maxScore: 20, actualScore: 19,
  },
  {
    id: 'p010_2', userId: 'u010', category: 'Hệ thống quản lý điểm', categoryCode: 'SP02',
    contribution: 30, completedDate: '2026-10-02',
    evidenceName: 'https://diem.ueb.edu.vn/report', evidenceType: 'link',
    status: 'cho-duyet', maxScore: 30, actualScore: 29,
  },
  {
    id: 'p011_1', userId: 'u011', category: 'Bài báo tạp chí', categoryCode: 'SP04',
    contribution: 25, completedDate: '2026-10-03',
    evidenceName: 'Minh_chung_SP04.pdf', evidenceType: 'file',
    status: 'cho-duyet', maxScore: 20, actualScore: 18,
  },
  {
    id: 'p012_1', userId: 'u012', category: 'Bài giảng điện tử', categoryCode: 'SP05',
    contribution: 35, completedDate: '2026-10-01',
    evidenceName: 'Bai_giang_Dung.pdf', evidenceType: 'file',
    status: 'cho-duyet', maxScore: 30, actualScore: 28,
  },
  {
    id: 'p013_1', userId: 'u013', category: 'Bài giảng du lịch bền vững', categoryCode: 'SP05',
    contribution: 30, completedDate: '2026-10-02',
    evidenceName: 'Bai_giang_ban_sua.pdf', evidenceType: 'file',
    status: 'cho-duyet', maxScore: 25, actualScore: 23,
  },
  {
    id: 'p014_1', userId: 'u014', category: 'Đề án cải cách tiền lương', categoryCode: 'SP02',
    contribution: 40, completedDate: '2026-10-04',
    evidenceName: 'De_an_tien_luong.pdf', evidenceType: 'file',
    status: 'da-duyet', maxScore: 40, actualScore: 38,
  },
];

export const MY_VIOLATIONS: ViolationRecord[] = [
  {
    id: 'v001', code: 'TĐ1', description: 'Đi muộn 3 ngày trong tháng 8',
    evidenceName: 'Bang_cham_cong.pdf', recordedBy: 'Trưởng phòng Đào tạo',
    date: '2026-08-15',
  },
  {
    id: 'v002', code: 'TĐ3', description: 'Nộp báo cáo chậm 2 ngày so với hạn',
    evidenceName: 'Email_nhac_nop.pdf', recordedBy: 'Trưởng phòng Đào tạo',
    date: '2026-08-22',
  },
];

export const MY_ALERTS = [
  { id: 'a1', severity: 'warning' as const, title: 'Đi muộn (TĐ1)', detail: 'Ghi nhận 3 ngày đi muộn trong tháng 8/2026', date: '15/08/2026' },
  { id: 'a2', severity: 'danger' as const, title: 'Quá hạn nộp sản phẩm (TĐ3)', detail: 'Báo cáo Q3 nộp chậm 2 ngày so với thời hạn', date: '22/08/2026' },
];

export const PENDING_TICKETS: AssessmentTicket[] = [
  {
    id: 't001', userId: 'u010', userName: 'Trần Thị Bình', userPosition: 'Chuyên viên',
    unit: 'Phòng Đào tạo', period: 'Q3-2026', status: 'pending-l1',
    totalProducts: 5, totalScore: 78, maxScore: 100,
    submittedDate: '2026-09-01', violations: [], innovationCtPoints: 0, innovationUnits: 0, approvalHistory: [], flagCeiling: false,
    classification: null, roundedScore: null,
  },
  {
    id: 't002', userId: 'u011', userName: 'Lê Hoàng Cường', userPosition: 'Chuyên viên',
    unit: 'Phòng Đào tạo', period: 'Q3-2026', status: 'pending-l1',
    totalProducts: 4, totalScore: 65, maxScore: 100,
    submittedDate: '2026-09-01', violations: [
      { id: 'v101', code: 'TĐ1', description: 'Đi muộn 2 ngày', evidenceName: 'cham_cong.pdf', recordedBy: 'Trưởng phòng', date: '2026-08-10' },
    ], innovationCtPoints: 0, innovationUnits: 0, approvalHistory: [], flagCeiling: true, classification: null, roundedScore: null,
  },
  {
    id: 't003', userId: 'u012', userName: 'Phạm Thu Dung', userPosition: 'Giảng viên',
    unit: 'Khoa Du lịch', period: 'Q3-2026', status: 'pending-l2',
    totalProducts: 6, totalScore: 85, maxScore: 120,
    submittedDate: '2026-08-30', violations: [], innovationCtPoints: 0, innovationUnits: 0, approvalHistory: [], flagCeiling: false,
    classification: null, roundedScore: null,
  },
  {
    id: 't004', userId: 'u013', userName: 'Võ Minh Đức', userPosition: 'Giảng viên',
    unit: 'Khoa Du lịch', period: 'Q3-2026', status: 'pending-l2',
    totalProducts: 5, totalScore: 92, maxScore: 120,
    submittedDate: '2026-08-28', violations: [
      { id: 'v201', code: 'TĐ7', description: 'Sai sót trong bài giảng', evidenceName: 'bai_giang.pdf', recordedBy: 'Trưởng Khoa', date: '2026-08-18' },
    ], innovationCtPoints: 0, innovationUnits: 0, approvalHistory: [], flagCeiling: true, classification: null, roundedScore: null,
  },
  {
    id: 't005', userId: 'u014', userName: 'Hoàng Thị Lan', userPosition: 'Chuyên viên',
    unit: 'Phòng TCNS', period: 'Q3-2026', status: 'pending-l1',
    totalProducts: 7, totalScore: 88, maxScore: 100,
    submittedDate: '2026-09-02', violations: [], innovationCtPoints: 0, innovationUnits: 0, approvalHistory: [], flagCeiling: false,
    classification: null, roundedScore: null,
  },
];

export const UNIT_SUMMARIES: UnitSummary[] = [
  {
    id: 'unit01', name: 'Phòng Đào tạo', code: 'PDT', totalStaff: 12, completedStaff: 10,
    avgScore: 82, avgCompetency: { quality: 85, timeliness: 78, collaboration: 82, innovation: 70 },
    classificationDistribution: [
      { classification: 'A1', count: 2 }, { classification: 'A2', count: 4 },
      { classification: 'B1', count: 3 }, { classification: 'B2', count: 2 },
      { classification: 'C', count: 1 }, { classification: 'D', count: 0 },
    ],
    kpiProgress: 85, kpiStatus: 'on-track', flagCount: 1,
  },
  {
    id: 'unit02', name: 'Khoa Du lịch', code: 'KDL', totalStaff: 25, completedStaff: 22,
    avgScore: 78, avgCompetency: { quality: 80, timeliness: 75, collaboration: 85, innovation: 65 },
    classificationDistribution: [
      { classification: 'A1', count: 3 }, { classification: 'A2', count: 8 },
      { classification: 'B1', count: 7 }, { classification: 'B2', count: 5 },
      { classification: 'C', count: 2 }, { classification: 'D', count: 0 },
    ],
    kpiProgress: 72, kpiStatus: 'at-risk', flagCount: 3,
  },
  {
    id: 'unit03', name: 'Khoa Quản trị Kinh doanh', code: 'KQTKD', totalStaff: 20, completedStaff: 18,
    avgScore: 88, avgCompetency: { quality: 90, timeliness: 85, collaboration: 88, innovation: 80 },
    classificationDistribution: [
      { classification: 'A1', count: 5 }, { classification: 'A2', count: 7 },
      { classification: 'B1', count: 4 }, { classification: 'B2', count: 3 },
      { classification: 'C', count: 1 }, { classification: 'D', count: 0 },
    ],
    kpiProgress: 92, kpiStatus: 'on-track', flagCount: 0,
  },
  {
    id: 'unit04', name: 'Phòng TCNS', code: 'PTCNS', totalStaff: 8, completedStaff: 7,
    avgScore: 85, avgCompetency: { quality: 82, timeliness: 88, collaboration: 80, innovation: 75 },
    classificationDistribution: [
      { classification: 'A1', count: 2 }, { classification: 'A2', count: 3 },
      { classification: 'B1', count: 2 }, { classification: 'B2', count: 1 },
      { classification: 'C', count: 0 }, { classification: 'D', count: 0 },
    ],
    kpiProgress: 88, kpiStatus: 'on-track', flagCount: 0,
  },
  {
    id: 'unit05', name: 'Khoa CNTT', code: 'KCNTT', totalStaff: 15, completedStaff: 9,
    avgScore: 70, avgCompetency: { quality: 75, timeliness: 60, collaboration: 72, innovation: 85 },
    classificationDistribution: [
      { classification: 'A1', count: 1 }, { classification: 'A2', count: 3 },
      { classification: 'B1', count: 4 }, { classification: 'B2', count: 4 },
      { classification: 'C', count: 2 }, { classification: 'D', count: 1 },
    ],
    kpiProgress: 55, kpiStatus: 'delayed', flagCount: 4,
  },
  {
    id: 'unit06', name: 'Phòng Thanh tra', code: 'PTT', totalStaff: 6, completedStaff: 6,
    avgScore: 90, avgCompetency: { quality: 92, timeliness: 90, collaboration: 88, innovation: 82 },
    classificationDistribution: [
      { classification: 'A1', count: 3 }, { classification: 'A2', count: 2 },
      { classification: 'B1', count: 1 }, { classification: 'B2', count: 0 },
      { classification: 'C', count: 0 }, { classification: 'D', count: 0 },
    ],
    kpiProgress: 95, kpiStatus: 'on-track', flagCount: 0,
  },
];

export const UNIT_LEADERBOARD = [
  { id: 'u010', name: 'Trần Thị Bình', unit: 'Phòng Đào tạo', score: 92, flag: false },
  { id: 'u011', name: 'Lê Hoàng Cường', unit: 'Phòng Đào tạo', score: 88, flag: true },
  { id: 'u012', name: 'Phạm Thu Dung', unit: 'Khoa Du lịch', score: 85, flag: false },
  { id: 'u013', name: 'Võ Minh Đức', unit: 'Khoa Du lịch', score: 82, flag: true },
  { id: 'u014', name: 'Hoàng Thị Lan', unit: 'Phòng TCNS', score: 80, flag: false },
  { id: 'u015', name: 'Đặng Văn Em', unit: 'Khoa QTKD', score: 78, flag: false },
  { id: 'u016', name: 'Bùi Thị Phương', unit: 'Khoa CNTT', score: 72, flag: true },
  { id: 'u017', name: 'Ngô Hoàng Quân', unit: 'Khoa QTKD', score: 68, flag: false },
];

export const KPI_GROWTH_DATA = [
  { quarter: 'Q1/2025', value: 1250 },
  { quarter: 'Q2/2025', value: 1380 },
  { quarter: 'Q3/2025', value: 1420 },
  { quarter: 'Q4/2025', value: 1550 },
  { quarter: 'Q1/2026', value: 1680 },
  { quarter: 'Q2/2026', value: 1820 },
  { quarter: 'Q3/2026', value: 1950 },
];

export const COMPLAINTS: Complaint[] = [
  {
    id: 'c001', complainant: 'Lê Hoàng Cường', unit: 'Phòng Đào tạo',
    type: 'Khiếu nại điểm sản phẩm', reason: 'Đề nghị xem xét lại điểm sản phẩm SP04 do minh chứng chưa được đánh giá đầy đủ',
    evidenceName: 'Minh_chung_SP04.pdf', status: 'dang-xu-ly',
    submittedDate: '2026-09-02', assignedTo: 'Phòng Thanh tra',
  },
  {
    id: 'c002', complainant: 'Võ Minh Đức', unit: 'Khoa Du lịch',
    type: 'Khiếu nại lỗi vi phạm', reason: 'Không đồng tình với ghi nhận lỗi TĐ7 sai sót chuyên môn, bài giảng đã được kiểm tra',
    evidenceName: 'Bai_giang_ban_sua.pdf', status: 'mo',
    submittedDate: '2026-09-03', assignedTo: null,
  },
  {
    id: 'c003', complainant: 'Nguyễn Văn An', unit: 'Phòng Đào tạo',
    type: 'Khiếu nại xếp loại', reason: 'Đề nghị xem xét lại xếp loại do đóng góp ý tưởng cải tiến quy trình',
    evidenceName: null, status: 'da-dong',
    submittedDate: '2026-08-15', assignedTo: 'Hội đồng BGH',
  },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'approval', message: 'Có 5 phiếu chờ duyệt', time: '5 phút trước', read: false },
  { id: 'n2', type: 'rejected', message: 'Phiếu của bạn bị trả lại, yêu cầu sửa đổi sản phẩm SP07', time: '1 giờ trước', read: false },
  { id: 'n3', type: 'warning', message: 'Cảnh báo: Sắp đến hạn nộp phiếu tự đánh giá (05/09/2026)', time: '3 giờ trước', read: false },
  { id: 'n4', type: 'info', message: 'Kỳ đánh giá Q3/2026 đã được mở', time: '1 ngày trước', read: true },
  { id: 'n5', type: 'approval', message: 'Phiếu của Trần Thị Bình đã được phê duyệt cấp 2', time: '2 ngày trước', read: true },
];

export const APPROVAL_TIMELINE = [
  { unit: 'Phòng Đào tạo', submitted: 10, approved: 8, pending: 2, deadline: '10/09/2026', status: 'on-track' as const },
  { unit: 'Khoa Du lịch', submitted: 22, approved: 15, pending: 7, deadline: '10/09/2026', status: 'at-risk' as const },
  { unit: 'Khoa QTKD', submitted: 18, approved: 16, pending: 2, deadline: '10/09/2026', status: 'on-track' as const },
  { unit: 'Phòng TCNS', submitted: 7, approved: 5, pending: 2, deadline: '10/09/2026', status: 'on-track' as const },
  { unit: 'Khoa CNTT', submitted: 9, approved: 4, pending: 5, deadline: '10/09/2026', status: 'delayed' as const },
  { unit: 'Phòng Thanh tra', submitted: 6, approved: 6, pending: 0, deadline: '10/09/2026', status: 'on-track' as const },
];

export const TOP_VIOLATIONS = [
  { code: 'TĐ1', label: 'Đi muộn', count: 28, category: 'hanh-chinh' as const },
  { code: 'TĐ3', label: 'Quá hạn nộp sản phẩm', count: 22, category: 'hanh-chinh' as const },
  { code: 'TĐ7', label: 'Sai sót chuyên môn', count: 15, category: 'chuyen-mon' as const },
  { code: 'TĐ8', label: 'Thái độ không hợp tác', count: 12, category: 'thai-do' as const },
  { code: 'TĐ6', label: 'Chất lượng sản phẩm kém', count: 10, category: 'chuyen-mon' as const },
  { code: 'PH1', label: 'Không phối hợp', count: 8, category: 'phoi-hop' as const },
];

export const FINAL_CLASSIFICATION_DATA = [
  { id: 'u010', name: 'Trần Thị Bình', unit: 'Phòng Đào tạo', finalScore: 92.4, roundedScore: 90, classification: 'A2' as Classification, flag: false },
  { id: 'u011', name: 'Lê Hoàng Cường', unit: 'Phòng Đào tạo', finalScore: 82.5, roundedScore: 85, classification: 'B1' as Classification, flag: true },
  { id: 'u012', name: 'Phạm Thu Dung', unit: 'Khoa Du lịch', finalScore: 88.0, roundedScore: 90, classification: 'A2' as Classification, flag: false },
  { id: 'u013', name: 'Võ Minh Đức', unit: 'Khoa Du lịch', finalScore: 77.3, roundedScore: 75, classification: 'B2' as Classification, flag: true },
  { id: 'u014', name: 'Hoàng Thị Lan', unit: 'Phòng TCNS', finalScore: 85.0, roundedScore: 85, classification: 'B1' as Classification, flag: false },
  { id: 'u015', name: 'Đặng Văn Em', unit: 'Khoa QTKD', finalScore: 95.2, roundedScore: 95, classification: 'A1' as Classification, flag: false },
  { id: 'u016', name: 'Bùi Thị Phương', unit: 'Khoa CNTT', finalScore: 68.7, roundedScore: 70, classification: 'C' as Classification, flag: true },
  { id: 'u017', name: 'Ngô Hoàng Quân', unit: 'Khoa QTKD', finalScore: 55.1, roundedScore: 55, classification: 'D' as Classification, flag: false },
];

export const COMPLAINT_TYPES = [
  'Khiếu nại điểm sản phẩm',
  'Khiếu nại lỗi vi phạm',
  'Khiếu nại xếp loại',
  'Khiếu nại quy trình duyệt',
  'Khác',
];

export function getClassificationLabel(c: Classification): string {
  const labels: Record<Classification, string> = {
    A1: 'A1 - Xuất sắc',
    A2: 'A2 - Xuất sắc',
    A3: 'A3 - Xuất sắc',
    B1: 'B1 - Tốt',
    B2: 'B2 - Tốt',
    B3: 'B3 - Tốt',
    C: 'C - Khá',
    D: 'D - Trung bình',
  };
  return labels[c];
}

export function getClassificationColor(c: Classification): string {
  const colors: Record<Classification, string> = {
    A1: 'bg-success-100 text-success-700',
    A2: 'A2 - Xuất sắc',
    A3: 'A3 - Xuất sắc',
    B1: 'bg-primary-100 text-primary-700',
    B2: 'B2 - Tốt',
    B3: 'B3 - Tốt',
    C: 'bg-warning-100 text-warning-700',
    D: 'bg-danger-100 text-danger-700',
  };
  return colors[c];
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-success-600';
  if (score >= 80) return 'text-primary-600';
  if (score >= 65) return 'text-warning-600';
  return 'text-danger-600';
}

export function getGaugeColor(score: number): string {
  if (score >= 90) return '#16a34a';
  if (score >= 80) return '#2563eb';
  if (score >= 65) return '#f59e0b';
  return '#ef4444';
}

export function predictClassification(score: number): Classification {
  if (score >= 95) return 'A1';
  if (score >= 85) return 'A2';
  if (score >= 80) return 'B1';
  if (score >= 65) return 'B2';
  if (score >= 50) return 'C';
  return 'D';
}

export function roundToFive(score: number): number {
  return Math.round(score / 5) * 5;
}

export const COMPETENCY_AXES: CompetencyAxis[] = [
  { label: 'Chất lượng công việc', value: 85, max: 100 },
  { label: 'Tuân thủ thời hạn', value: 78, max: 100 },
  { label: 'Tinh thần phối hợp', value: 82, max: 100 },
  { label: 'Cải tiến sáng tạo', value: 70, max: 100 },
];

export const CEILING_CAP_REASONS: Record<string, string> = {
  'u011': 'Nhân sự vi phạm 2 lần lỗi TĐ3 (Quá hạn nộp sản phẩm > 2 ngày) theo Điều 12 Quy chế đánh giá KPI → Mức xếp loại tối đa bị khống chế ở bậc B2 (Tốt), không được xét bậc A1/A2.',
  'u013': 'Nhân sự vi phạm 1 lần lỗi TĐ7 (Sai sót chuyên môn nghiêm trọng) theo Điều 12 Quy chế đánh giá KPI → Mức xếp loại tối đa bị khống chế ở bậc B2 (Tốt), không được xét bậc A1/A2.',
  'u016': 'Nhân sự vi phạm 3 lần lỗi TĐ1 (Đi muộn) và 1 lần TĐ8 (Thái độ không hợp tác) theo Điều 12 Quy chế đánh giá KPI → Mức xếp loại tối đa bị khống chế ở bậc B2 (Tốt), không được xét bậc A1/A2.',
};

export function getCeilingCapReason(userId: string): string {
  return CEILING_CAP_REASONS[userId] || 'Nhân sự vướng lỗi vi phạm theo Điều 12 Quy chế đánh giá KPI → Xếp loại tối đa bị khống chế ở bậc B2 (Tốt).';
}

export const GIANG_VIEN_GROUPS = [
  { id: 'gv1', label: 'Giảng dạy', maxScore: 25, items: [
    { id: 'gv1a', label: 'Số tiết giảng dạy', maxScore: 15, score: 14 },
    { id: 'gv1b', label: 'Đánh giá giờ dạy', maxScore: 10, score: 8 },
  ]},
  { id: 'gv2', label: 'Nghiên cứu khoa học', maxScore: 25, items: [
    { id: 'gv2a', label: 'Bài báo khoa học', maxScore: 15, score: 12 },
    { id: 'gv2b', label: 'Đề tài nghiên cứu', maxScore: 10, score: 7 },
  ]},
  { id: 'gv3', label: 'Tiêu chí khác', maxScore: 15, items: [
    { id: 'gv3a', label: 'Hướng dẫn sinh viên', maxScore: 8, score: 7 },
    { id: 'gv3b', label: 'Phục vụ học liệu', maxScore: 7, score: 5 },
  ]},
  { id: 'gv4', label: 'Tiêu chí phát triển', maxScore: 35, items: [
    { id: 'gv4a', label: 'Bồi dưỡng chuyên môn', maxScore: 15, score: 12 },
    { id: 'gv4b', label: 'Cải tiến sáng tạo', maxScore: 20, score: 15 },
  ]},
  { id: 'gv5', label: 'Điểm cộng đóng góp HPT', maxScore: 20, items: [
    { id: 'gv5a', label: 'Đóng góp HPT', maxScore: 20, score: 10 },
  ]},
];

export const DEMO_CURRENT_DATE = '2026-10-10';
