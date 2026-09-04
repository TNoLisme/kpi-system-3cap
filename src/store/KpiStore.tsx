import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type {
  AssessmentTicket,
  ProductItem,
  UnitSummary,
  Complaint,
  User,
  ComplaintResolution,
  Classification,
} from '@/types';
import {
  PENDING_TICKETS,
  MY_PRODUCTS,
  UNIT_SUMMARIES,
  COMPLAINTS,
  CURRENT_PERIOD,
} from '@/data/mockData';
import { calculateTicketScore, applyClassificationCeiling, getKpiCeiling } from '@/domain/kpiRules';

export interface KpiState {
  tickets: AssessmentTicket[];
  myProducts: ProductItem[];
  units: UnitSummary[];
  complaints: Complaint[];
  isFrozen: boolean;
  frozenAt: string | null;
  period: string;
}

export type KpiAction =
  | { type: 'REQUEST_REVISION'; ticketId: string; reason: string; actor: User }
  | {
      type: 'RESUBMIT_TICKET';
      ticketId: string;
      evidence: { name: string; type: 'file' | 'link' };
      actor: User;
    }
  | {
      type: 'APPROVE_L2';
      ticketId: string;
      ctPoints: number;
      innovationUnits: number;
      actor: User;
    }
  | { type: 'APPROVE_L3'; ticketId: string; actor: User }
  | { type: 'UPDATE_UNIT_KPI'; unitId: string; value: number }
  | { type: 'CREATE_COMPLAINT'; complaint: Complaint }
  | { type: 'START_COMPLAINT'; complaintId: string; actor: User }
  | {
      type: 'RESOLVE_COMPLAINT';
      complaintId: string;
      resolution: ComplaintResolution;
      actor: User;
    }
  | { type: 'ADD_PRODUCT'; product: ProductItem }
  | { type: 'DELETE_PRODUCT'; productId: string }
  | { type: 'SUBMIT_ASSESSMENT'; userId: string; actor: User }
  | { type: 'FREEZE_PERIOD'; at: string; actor: User };

export const initialKpiState: KpiState = {
  tickets: PENDING_TICKETS.map(t => ({
    ...t,
    status: (t.status as string) === 'pending-l1' ? 'pending-l2' : t.status,
    innovationCtPoints: t.innovationCtPoints ?? 0,
    innovationUnits: t.innovationUnits ?? 0,
    approvalHistory: t.approvalHistory ?? [],
  })),
  myProducts: MY_PRODUCTS,
  units: UNIT_SUMMARIES.map(u => ({
    ...u,
    kpiActualGrowth: u.code === 'KDL' ? 4.2 : 10.5,
    kpiCeiling: u.code === 'KDL' ? ('B3' as Classification) : null,
    ceilingReason:
      u.code === 'KDL' ? 'KPI tăng thêm 4.2% < 5% (khống chế tối đa bậc B3)' : undefined,
  })),
  complaints: COMPLAINTS,
  isFrozen: false,
  frozenAt: null,
  period: CURRENT_PERIOD,
};

export function kpiReducer(state: KpiState, action: KpiAction): KpiState {
  // Khi đã đóng băng, chỉ cho phép thanh tra xử lý khiếu nại (RESOLVE_COMPLAINT)
  if (state.isFrozen && action.type !== 'RESOLVE_COMPLAINT') {
    return state;
  }

  switch (action.type) {
    case 'REQUEST_REVISION': {
      const tickets = state.tickets.map(ticket => {
        if (ticket.id !== action.ticketId) return ticket;
        if (ticket.status !== 'pending-l2' && ticket.status !== 'pending-l3') return ticket;

        const newEvent = {
          id: `ev-${Date.now()}`,
          action: 'revision-requested' as const,
          actor: action.actor.name,
          role: action.actor.role,
          at: new Date().toISOString(),
          note: action.reason,
        };

        return {
          ...ticket,
          status: 'revision-requested' as const,
          revisionReason: action.reason,
          approvalHistory: [newEvent, ...ticket.approvalHistory],
        };
      });

      // Cập nhật trạng thái sản phẩm cá nhân nếu trùng user
      const targetTicket = state.tickets.find(t => t.id === action.ticketId);
      const myProducts = state.myProducts.map(p => {
        if (targetTicket && (p.userId === targetTicket.userId || !p.userId)) {
          if (p.status === 'cho-duyet') {
            return {
              ...p,
              status: 'yeu-cau-sua' as const,
              revisionFeedback: action.reason,
              revisionFrom: action.actor.name,
            };
          }
        }
        return p;
      });

      return { ...state, tickets, myProducts };
    }

    case 'RESUBMIT_TICKET': {
      const tickets = state.tickets.map(ticket => {
        if (ticket.id !== action.ticketId) return ticket;
        if (ticket.status !== 'revision-requested') return ticket;

        const newEvent = {
          id: `ev-${Date.now()}`,
          action: 'resubmitted' as const,
          actor: action.actor.name,
          role: action.actor.role,
          at: new Date().toISOString(),
          note: 'Đã cập nhật minh chứng bổ sung và nộp lại',
        };

        return {
          ...ticket,
          status: 'pending-l2' as const,
          revisionReason: undefined,
          approvalHistory: [newEvent, ...ticket.approvalHistory],
        };
      });

      const myProducts = state.myProducts.map(p => {
        if (p.status === 'yeu-cau-sua') {
          return {
            ...p,
            status: 'cho-duyet' as const,
            evidenceName: action.evidence.name,
            evidenceType: action.evidence.type,
            revisionFeedback: undefined,
          };
        }
        return p;
      });

      return { ...state, tickets, myProducts };
    }

    case 'APPROVE_L2': {
      const tickets = state.tickets.map(ticket => {
        if (ticket.id !== action.ticketId) return ticket;
        if (ticket.status !== 'pending-l2') return ticket;

        const { rawScore, roundedScore, classification } = calculateTicketScore(
          state.myProducts,
          action.ctPoints,
          action.innovationUnits,
          ticket.violations.length * 2
        );

        // Áp trần nếu có
        const finalClassification = applyClassificationCeiling(classification, [
          ticket.ceiling,
          ticket.flagCeiling ? 'B2' : null,
        ]);

        const newEvent = {
          id: `ev-${Date.now()}`,
          action: 'approved-l2' as const,
          actor: action.actor.name,
          role: action.actor.role,
          at: new Date().toISOString(),
          note: `Trưởng Khoa/Phòng duyệt: điểm ${roundedScore}đ, xếp loại ${finalClassification}`,
        };

        return {
          ...ticket,
          status: 'pending-l3' as const,
          innovationCtPoints: action.ctPoints,
          innovationUnits: action.innovationUnits,
          totalScore: rawScore,
          roundedScore,
          classification: finalClassification,
          approvalHistory: [newEvent, ...ticket.approvalHistory],
        };
      });

      return { ...state, tickets };
    }

    case 'APPROVE_L3': {
      const tickets = state.tickets.map(ticket => {
        if (ticket.id !== action.ticketId) return ticket;
        if (ticket.status !== 'pending-l3') return ticket;

        const newEvent = {
          id: `ev-${Date.now()}`,
          action: 'approved-l3' as const,
          actor: action.actor.name,
          role: action.actor.role,
          at: new Date().toISOString(),
          note: 'Lãnh đạo & TCNS duyệt chuyển Hội đồng Ban Giám Hiệu',
        };

        return {
          ...ticket,
          status: 'pending-council' as const,
          approvalHistory: [newEvent, ...ticket.approvalHistory],
        };
      });

      return { ...state, tickets };
    }

    case 'UPDATE_UNIT_KPI': {
      const ceiling = getKpiCeiling(action.value);
      const units = state.units.map(u => {
        if (u.id !== action.unitId && u.code !== action.unitId) return u;
        return {
          ...u,
          kpiActualGrowth: action.value,
          kpiCeiling: ceiling,
          kpiStatus: action.value < 5 ? ('at-risk' as const) : ('on-track' as const),
          ceilingReason:
            action.value < 5
              ? `KPI tăng thêm ${action.value}% < 5% (khống chế tối đa bậc B3)`
              : undefined,
        };
      });

      // Áp trần B3 cho nhân sự thuộc đơn vị này nếu KPI < 5%
      const targetUnit = units.find(u => u.id === action.unitId || u.code === action.unitId);
      const tickets = state.tickets.map(t => {
        if (targetUnit && t.unit === targetUnit.name) {
          const newCeilings = [ceiling, t.flagCeiling ? ('B2' as Classification) : null];
          const newClass = t.classification
            ? applyClassificationCeiling(t.classification, newCeilings)
            : null;
          return {
            ...t,
            ceiling: ceiling ?? undefined,
            classification: newClass,
            ceilingReasons:
              action.value < 5
                ? [...(t.ceilingReasons ?? []), `KPI đơn vị ${action.value}% < 5%`]
                : t.ceilingReasons,
          };
        }
        return t;
      });

      return { ...state, units, tickets };
    }

    case 'CREATE_COMPLAINT': {
      return {
        ...state,
        complaints: [action.complaint, ...state.complaints],
      };
    }

    case 'START_COMPLAINT': {
      const complaints = state.complaints.map(c => {
        if (c.id !== action.complaintId) return c;
        return {
          ...c,
          status: 'dang-xu-ly' as const,
          assignedTo: action.actor.name,
        };
      });
      return { ...state, complaints };
    }

    case 'RESOLVE_COMPLAINT': {
      const complaints = state.complaints.map(c => {
        if (c.id !== action.complaintId) return c;
        return {
          ...c,
          status: 'da-dong' as const,
          resolution: action.resolution.conclusion,
          resolutionType: action.resolution.decision,
          scoreAdjustment: action.resolution.scoreAdjustment,
          resolvedDate: action.resolution.resolvedAt,
          resolutionHistory: [...(c.resolutionHistory ?? []), action.resolution],
        };
      });

      // Nếu có điều chỉnh điểm và có ticket liên kết, cập nhật điểm ticket
      let tickets = state.tickets;
      if (action.resolution.decision === 'adjust' && action.resolution.scoreAdjustment) {
        const targetComplaint = state.complaints.find(c => c.id === action.complaintId);
        if (targetComplaint) {
          tickets = state.tickets.map(t => {
            if (
              t.id === targetComplaint.ticketId ||
              t.userName === targetComplaint.complainant
            ) {
              const newRaw = Math.max(0, t.totalScore + action.resolution.scoreAdjustment);
              const newRound = Math.round(newRaw / 5) * 5;
              const baseClass =
                newRound >= 110
                  ? 'A1'
                  : newRound >= 100
                  ? 'A2'
                  : newRound >= 90
                  ? 'A3'
                  : newRound >= 80
                  ? 'B1'
                  : newRound >= 70
                  ? 'B2'
                  : newRound >= 60
                  ? 'B3'
                  : newRound >= 50
                  ? 'C'
                  : 'D';
              const newClass = applyClassificationCeiling(baseClass, [
                t.ceiling,
                t.flagCeiling ? 'B2' : null,
              ]);
              return {
                ...t,
                totalScore: newRaw,
                roundedScore: newRound,
                classification: newClass,
              };
            }
            return t;
          });
        }
      }

      return { ...state, complaints, tickets };
    }

    case 'ADD_PRODUCT': {
      return {
        ...state,
        myProducts: [action.product, ...state.myProducts],
      };
    }

    case 'DELETE_PRODUCT': {
      return {
        ...state,
        myProducts: state.myProducts.filter(p => p.id !== action.productId),
      };
    }

    case 'SUBMIT_ASSESSMENT': {
      const tickets = state.tickets.map(t => {
        if (t.userId === action.userId) {
          const newEvent = {
            id: `ev-${Date.now()}`,
            action: 'submitted' as const,
            actor: action.actor.name,
            role: action.actor.role,
            at: new Date().toISOString(),
            note: 'Nộp phiếu tự đánh giá lên Quản lý trực tiếp (Cấp 2)',
          };
          return {
            ...t,
            status: 'pending-l2' as const,
            submittedDate: new Date().toISOString().split('T')[0],
            approvalHistory: [newEvent, ...t.approvalHistory],
          };
        }
        return t;
      });
      return { ...state, tickets };
    }

    case 'FREEZE_PERIOD': {
      const tickets = state.tickets.map(t => {
        const newEvent = {
          id: `ev-${Date.now()}`,
          action: 'frozen' as const,
          actor: action.actor.name,
          role: action.actor.role,
          at: action.at,
          note: 'Ban Giám Hiệu ban hành & chính thức đóng băng dữ liệu Quý',
        };
        return {
          ...t,
          status: 'frozen' as const,
          approvalHistory: [newEvent, ...t.approvalHistory],
        };
      });

      return {
        ...state,
        isFrozen: true,
        frozenAt: action.at,
        tickets,
      };
    }

    default:
      return state;
  }
}

interface KpiStoreContextValue {
  state: KpiState;
  dispatch: React.Dispatch<KpiAction>;
}

const KpiStoreContext = createContext<KpiStoreContextValue | undefined>(undefined);

export function KpiStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(kpiReducer, initialKpiState);

  return (
    <KpiStoreContext.Provider value={{ state, dispatch }}>
      {children}
    </KpiStoreContext.Provider>
  );
}

export function useKpiStore(): KpiStoreContextValue {
  const context = useContext(KpiStoreContext);
  if (!context) {
    throw new Error('useKpiStore must be used within a KpiStoreProvider');
  }
  return context;
}
