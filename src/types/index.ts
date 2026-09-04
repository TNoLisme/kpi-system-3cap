export type Role =
  | 'chuyen-vien'
  | 'giang-vien'
  | 'truong-khoa'
  | 'lanh-dao'
  | 'ban-giam-hieu'
  | 'thanh-tra';

export type PageKey =
  | 'dashboard'
  | 'self-assessment'
  | 'approval'
  | 'admin-classification'
  | 'complaint';

export type TicketStatus = 'draft' | 'pending-l1' | 'pending-l2' | 'approved' | 'rejected';

export type Classification = 'A1' | 'A2' | 'B1' | 'B2' | 'C' | 'D';

export type ProductStatus = 'cho-duyet' | 'da-duyet' | 'yeu-cau-sua';

export type ComplaintStatus = 'mo' | 'dang-xu-ly' | 'da-dong';

export type ViolationCode =
  | 'TĐ1' | 'TĐ2' | 'TĐ3' | 'TĐ4' | 'TĐ5' | 'TĐ6' | 'TĐ7'
  | 'TĐ8' | 'TĐ9' | 'TĐ10' | 'TĐ11' | 'PH1' | 'PH2';

export interface User {
  id: string;
  name: string;
  role: Role;
  position: string;
  unit: string;
  avatar: string;
}

export interface ProductItem {
  id: string;
  category: string;
  categoryCode: string;
  contribution: number;
  completedDate: string;
  evidenceName: string;
  evidenceType: 'file' | 'link';
  status: ProductStatus;
  maxScore: number;
  actualScore?: number;
  revisionFeedback?: string;
  revisionFrom?: string;
}

export interface AssessmentTicket {
  id: string;
  userId: string;
  userName: string;
  userPosition: string;
  unit: string;
  period: string;
  status: TicketStatus;
  totalProducts: number;
  totalScore: number;
  maxScore: number;
  submittedDate: string | null;
  violations: ViolationRecord[];
  flagCeiling: boolean;
  classification: Classification | null;
  roundedScore: number | null;
}

export interface ViolationRecord {
  id: string;
  code: ViolationCode;
  description: string;
  evidenceName: string;
  recordedBy: string;
  date: string;
}

export interface ViolationCodeInfo {
  code: ViolationCode;
  label: string;
  category: 'hanh-chinh' | 'chuyen-mon' | 'thai-do' | 'phoi-hop';
  description: string;
}

export interface UnitSummary {
  id: string;
  name: string;
  code: string;
  totalStaff: number;
  completedStaff: number;
  avgScore: number;
  avgCompetency: {
    quality: number;
    timeliness: number;
    collaboration: number;
    innovation: number;
  };
  classificationDistribution: { classification: Classification; count: number }[];
  kpiProgress: number;
  kpiStatus: 'on-track' | 'at-risk' | 'delayed';
  flagCount: number;
}

export interface Notification {
  id: string;
  type: 'approval' | 'rejected' | 'warning' | 'info';
  message: string;
  time: string;
  read: boolean;
}

export interface Complaint {
  id: string;
  complainant: string;
  unit: string;
  type: string;
  reason: string;
  evidenceName: string | null;
  status: ComplaintStatus;
  submittedDate: string;
  assignedTo: string | null;
  resolution?: string;
  resolutionType?: 'reject' | 'adjust';
  scoreAdjustment?: number;
  resolvedDate?: string;
}

export interface CompetencyAxis {
  label: string;
  value: number;
  max: number;
}

export interface NotificationItem {
  id: string;
  type: 'approval' | 'rejected' | 'warning' | 'info';
  message: string;
  time: string;
  read: boolean;
}

export interface PeriodOption {
  value: string;
  label: string;
}

export interface RoleConfig {
  role: Role;
  label: string;
  icon: string;
  pages: PageKey[];
  defaultPage: PageKey;
}
