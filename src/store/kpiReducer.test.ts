import { describe, it, expect } from 'vitest';
import { kpiReducer, initialKpiState, type KpiState } from './KpiStore';
import type { User } from '@/types';

const mockActor: User = {
  id: 'u001',
  name: 'Trần Văn Quản Lý',
  role: 'truong-khoa',
  position: 'Trưởng Khoa',
  unit: 'Khoa Du lịch',
  avatar: '',
};

describe('kpiReducer workflows', () => {
  it('handles REQUEST_REVISION: sets status and records feedback', () => {
    const firstTicket = initialKpiState.tickets[0];
    const state: KpiState = {
      ...initialKpiState,
      tickets: [{ ...firstTicket, status: 'pending-l2' }],
    };

    const nextState = kpiReducer(state, {
      type: 'REQUEST_REVISION',
      ticketId: firstTicket.id,
      reason: 'Minh chứng thiếu chữ ký số',
      actor: mockActor,
    });

    const updated = nextState.tickets.find(t => t.id === firstTicket.id);
    expect(updated?.status).toBe('revision-requested');
    expect(updated?.revisionReason).toBe('Minh chứng thiếu chữ ký số');
    expect(updated?.approvalHistory[0].action).toBe('revision-requested');
  });

  it('handles RESUBMIT_TICKET: transitions back to pending-l2', () => {
    const firstTicket = initialKpiState.tickets[0];
    const state: KpiState = {
      ...initialKpiState,
      tickets: [{ ...firstTicket, status: 'revision-requested' }],
    };

    const nextState = kpiReducer(state, {
      type: 'RESUBMIT_TICKET',
      ticketId: firstTicket.id,
      evidence: { name: 'updated_evidence.pdf', type: 'file' },
      actor: { ...mockActor, role: 'chuyen-vien' },
    });

    const updated = nextState.tickets.find(t => t.id === firstTicket.id);
    expect(updated?.status).toBe('pending-l2');
    expect(updated?.revisionReason).toBeUndefined();
    expect(updated?.approvalHistory[0].action).toBe('resubmitted');
  });

  it('handles APPROVE_L2: moves to pending-l3 with CTST score', () => {
    const firstTicket = initialKpiState.tickets[0];
    const state: KpiState = {
      ...initialKpiState,
      tickets: [{ ...firstTicket, status: 'pending-l2' }],
    };

    const nextState = kpiReducer(state, {
      type: 'APPROVE_L2',
      ticketId: firstTicket.id,
      ctPoints: 5,
      innovationUnits: 1,
      actor: mockActor,
    });

    const updated = nextState.tickets.find(t => t.id === firstTicket.id);
    expect(updated?.status).toBe('pending-l3');
    expect(updated?.innovationCtPoints).toBe(5);
    expect(updated?.innovationUnits).toBe(1);
    expect(updated?.approvalHistory[0].action).toBe('approved-l2');
  });

  it('handles APPROVE_L3: moves to pending-council', () => {
    const firstTicket = initialKpiState.tickets[0];
    const state: KpiState = {
      ...initialKpiState,
      tickets: [{ ...firstTicket, status: 'pending-l3' }],
    };

    const nextState = kpiReducer(state, {
      type: 'APPROVE_L3',
      ticketId: firstTicket.id,
      actor: { ...mockActor, role: 'lanh-dao' },
    });

    const updated = nextState.tickets.find(t => t.id === firstTicket.id);
    expect(updated?.status).toBe('pending-council');
    expect(updated?.approvalHistory[0].action).toBe('approved-l3');
  });

  it('handles UPDATE_UNIT_KPI: sets B3 ceiling when KPI < 5%', () => {
    const unit = initialKpiState.units[0];
    const nextState = kpiReducer(initialKpiState, {
      type: 'UPDATE_UNIT_KPI',
      unitId: unit.id,
      value: 4.5,
    });

    const updatedUnit = nextState.units.find(u => u.id === unit.id);
    expect(updatedUnit?.kpiActualGrowth).toBe(4.5);
    expect(updatedUnit?.kpiCeiling).toBe('B3');
  });

  it('handles FREEZE_PERIOD: locks the system and sets all tickets to frozen', () => {
    const nextState = kpiReducer(initialKpiState, {
      type: 'FREEZE_PERIOD',
      at: '2026-10-15T17:00:00+07:00',
      actor: { ...mockActor, role: 'ban-giam-hieu' },
    });

    expect(nextState.isFrozen).toBe(true);
    expect(nextState.frozenAt).toBe('2026-10-15T17:00:00+07:00');
    expect(nextState.tickets.every(t => t.status === 'frozen')).toBe(true);

    // Mutation after freeze is blocked
    const mutationAttempt = kpiReducer(nextState, {
      type: 'REQUEST_REVISION',
      ticketId: nextState.tickets[0].id,
      reason: 'Thử sửa sau khi đóng băng',
      actor: mockActor,
    });
    expect(mutationAttempt).toBe(nextState);
  });

  it('handles RESOLVE_COMPLAINT with score adjustment', () => {
    const firstTicket = initialKpiState.tickets[0];
    const complaint = {
      id: 'c-test',
      ticketId: firstTicket.id,
      complainant: firstTicket.userName,
      unit: firstTicket.unit,
      type: 'Khiếu nại điểm',
      reason: 'Thiếu điểm bài báo',
      evidenceName: 'evidence.pdf',
      status: 'dang-xu-ly' as const,
      submittedDate: '2026-10-16',
      assignedTo: 'Thanh tra',
    };

    const state: KpiState = {
      ...initialKpiState,
      complaints: [complaint],
    };

    const nextState = kpiReducer(state, {
      type: 'RESOLVE_COMPLAINT',
      complaintId: 'c-test',
      resolution: {
        level: 1,
        decision: 'adjust',
        conclusion: 'Đồng ý cộng 5 điểm cho bài báo',
        scoreAdjustment: 5,
        resolvedAt: '2026-10-17',
      },
      actor: { ...mockActor, role: 'thanh-tra' },
    });

    const updatedComplaint = nextState.complaints.find(c => c.id === 'c-test');
    expect(updatedComplaint?.status).toBe('da-dong');
    expect(updatedComplaint?.resolutionType).toBe('adjust');

    const updatedTicket = nextState.tickets.find(t => t.id === firstTicket.id);
    expect(updatedTicket?.totalScore).toBe(firstTicket.totalScore + 5);
  });
});
