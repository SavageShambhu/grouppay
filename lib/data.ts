// Centralized mock data store — replace with real DB (Postgres/MongoDB) in production

export type Role = 'admin' | 'member';
export type TxStatus = 'paid' | 'pending' | 'overdue' | 'partial';
export type TxCategory = 'maintenance' | 'electricity' | 'water' | 'security' | 'amenity' | 'penalty';

export interface Member {
  id: string;
  name: string;
  flat: string;
  email: string;
  phone: string;
  passwordHash: string; // bcrypt hash
  role: Role;
  joinDate: string;
  avatar: string; // initials color
  paymentScore: number; // 0-100
  isLate: boolean; // historically late payer
}

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  flat: string;
  category: TxCategory;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paidDate?: string;
  status: TxStatus;
  description: string;
  receiptNo: string;
}

export interface UtilityBill {
  month: string; // YYYY-MM
  electricity: number;
  water: number;
  maintenance: number;
  security: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  type: 'payment' | 'admin' | 'system' | 'member';
}

// ---- MEMBERS ----
// Passwords: demo123 for all
export const MEMBERS: Member[] = [
  { id: 'm1', name: 'Arjun Sharma',    flat: 'A-101', email: 'arjun@example.com',   phone: '9876543210', passwordHash: '$2a$10$rQmK8BxoZ3VWvEoN.DUMMY.HASH.HERE', role: 'admin',  joinDate: '2022-01-15', avatar: '#4ade80', paymentScore: 95, isLate: false },
  { id: 'm2', name: 'Priya Nair',      flat: 'A-102', email: 'priya@example.com',    phone: '9876543211', passwordHash: '$2a$10$rQmK8BxoZ3VWvEoN.DUMMY.HASH.HERE', role: 'member', joinDate: '2022-02-01', avatar: '#60a5fa', paymentScore: 78, isLate: false },
  { id: 'm3', name: 'Rahul Gupta',     flat: 'B-201', email: 'rahul@example.com',    phone: '9876543212', passwordHash: '$2a$10$rQmK8BxoZ3VWvEoN.DUMMY.HASH.HERE', role: 'member', joinDate: '2022-03-10', avatar: '#f87171', paymentScore: 42, isLate: true  },
  { id: 'm4', name: 'Sunita Reddy',    flat: 'B-202', email: 'sunita@example.com',   phone: '9876543213', passwordHash: '$2a$10$rQmK8BxoZ3VWvEoN.DUMMY.HASH.HERE', role: 'member', joinDate: '2022-04-20', avatar: '#fbbf24', paymentScore: 88, isLate: false },
  { id: 'm5', name: 'Vikram Singh',    flat: 'C-301', email: 'vikram@example.com',   phone: '9876543214', passwordHash: '$2a$10$rQmK8BxoZ3VWvEoN.DUMMY.HASH.HERE', role: 'member', joinDate: '2022-05-05', avatar: '#a78bfa', paymentScore: 33, isLate: true  },
  { id: 'm6', name: 'Deepika Iyer',    flat: 'C-302', email: 'deepika@example.com',  phone: '9876543215', passwordHash: '$2a$10$rQmK8BxoZ3VWvEoN.DUMMY.HASH.HERE', role: 'member', joinDate: '2022-06-18', avatar: '#34d399', paymentScore: 91, isLate: false },
  { id: 'm7', name: 'Manish Patel',    flat: 'D-401', email: 'manish@example.com',   phone: '9876543216', passwordHash: '$2a$10$rQmK8BxoZ3VWvEoN.DUMMY.HASH.HERE', role: 'member', joinDate: '2022-07-22', avatar: '#fb923c', paymentScore: 60, isLate: false },
  { id: 'm8', name: 'Kavitha Menon',   flat: 'D-402', email: 'kavitha@example.com',  phone: '9876543217', passwordHash: '$2a$10$rQmK8BxoZ3VWvEoN.DUMMY.HASH.HERE', role: 'member', joinDate: '2022-08-30', avatar: '#e879f9', paymentScore: 55, isLate: true  },
];

// ---- TRANSACTIONS ----
function gen(id: string, mId: string, mName: string, flat: string, cat: TxCategory, amt: number, paid: number, due: string, paidDate: string | undefined, status: TxStatus, desc: string, receipt: string): Transaction {
  return { id, memberId: mId, memberName: mName, flat, category: cat, amount: amt, paidAmount: paid, dueDate: due, paidDate, status, description: desc, receiptNo: receipt };
}

export const TRANSACTIONS: Transaction[] = [
  gen('t1',  'm1','Arjun Sharma',  'A-101','maintenance',2500,2500,'2026-01-05','2026-01-04','paid',   'Jan 2026 Maintenance','RCP-2601-001'),
  gen('t2',  'm2','Priya Nair',    'A-102','maintenance',2500,2500,'2026-01-05','2026-01-06','paid',   'Jan 2026 Maintenance','RCP-2601-002'),
  gen('t3',  'm3','Rahul Gupta',   'B-201','maintenance',2500,0,   '2026-01-05',undefined,   'overdue','Jan 2026 Maintenance','RCP-2601-003'),
  gen('t4',  'm4','Sunita Reddy',  'B-202','maintenance',2500,2500,'2026-01-05','2026-01-05','paid',   'Jan 2026 Maintenance','RCP-2601-004'),
  gen('t5',  'm5','Vikram Singh',  'C-301','maintenance',2500,1000,'2026-01-05',undefined,   'partial','Jan 2026 Maintenance','RCP-2601-005'),
  gen('t6',  'm6','Deepika Iyer',  'C-302','maintenance',2500,2500,'2026-01-05','2026-01-03','paid',   'Jan 2026 Maintenance','RCP-2601-006'),
  gen('t7',  'm7','Manish Patel',  'D-401','maintenance',2500,2500,'2026-01-05','2026-01-07','paid',   'Jan 2026 Maintenance','RCP-2601-007'),
  gen('t8',  'm8','Kavitha Menon', 'D-402','maintenance',2500,0,   '2026-01-05',undefined,   'overdue','Jan 2026 Maintenance','RCP-2601-008'),
  gen('t9',  'm1','Arjun Sharma',  'A-101','electricity',  850, 850,'2026-02-05','2026-02-04','paid',  'Feb 2026 Electricity', 'RCP-2602-001'),
  gen('t10', 'm2','Priya Nair',    'A-102','electricity',  920, 920,'2026-02-05','2026-02-05','paid',  'Feb 2026 Electricity', 'RCP-2602-002'),
  gen('t11', 'm3','Rahul Gupta',   'B-201','electricity',  780,   0,'2026-02-05',undefined,  'overdue','Feb 2026 Electricity', 'RCP-2602-003'),
  gen('t12', 'm4','Sunita Reddy',  'B-202','electricity',  990, 990,'2026-02-05','2026-02-04','paid',  'Feb 2026 Electricity', 'RCP-2602-004'),
  gen('t13', 'm5','Vikram Singh',  'C-301','electricity',  860,   0,'2026-02-05',undefined,  'pending','Feb 2026 Electricity','RCP-2602-005'),
  gen('t14', 'm6','Deepika Iyer',  'C-302','electricity',  910, 910,'2026-02-05','2026-02-02','paid',  'Feb 2026 Electricity', 'RCP-2602-006'),
  gen('t15', 'm1','Arjun Sharma',  'A-101','maintenance',2500,2500,'2026-02-05','2026-02-04','paid',   'Feb 2026 Maintenance','RCP-2602-007'),
  gen('t16', 'm3','Rahul Gupta',   'B-201','maintenance',2500,   0,'2026-02-05',undefined,   'overdue','Feb 2026 Maintenance','RCP-2602-008'),
  gen('t17', 'm5','Vikram Singh',  'C-301','maintenance',2500, 800,'2026-02-05',undefined,   'partial','Feb 2026 Maintenance','RCP-2602-009'),
  gen('t18', 'm7','Manish Patel',  'D-401','security',    600, 600,'2026-02-05','2026-02-06','paid',   'Feb 2026 Security',   'RCP-2602-010'),
  gen('t19', 'm8','Kavitha Menon', 'D-402','security',    600,   0,'2026-02-05',undefined,   'overdue','Feb 2026 Security',   'RCP-2602-011'),
  gen('t20', 'm2','Priya Nair',    'A-102','water',        350, 350,'2026-03-05','2026-03-04','paid',  'Mar 2026 Water',       'RCP-2603-001'),
  gen('t21', 'm3','Rahul Gupta',   'B-201','water',        320,   0,'2026-03-05',undefined,  'overdue','Mar 2026 Water',      'RCP-2603-002'),
  gen('t22', 'm6','Deepika Iyer',  'C-302','maintenance',2500,2500,'2026-03-05','2026-03-01','paid',  'Mar 2026 Maintenance', 'RCP-2603-003'),
  gen('t23', 'm4','Sunita Reddy',  'B-202','amenity',      400, 400,'2026-03-10','2026-03-09','paid',  'Pool maintenance fee', 'RCP-2603-004'),
  gen('t24', 'm5','Vikram Singh',  'C-301','penalty',      250,   0,'2026-03-15',undefined,  'pending','Late payment penalty','RCP-2603-005'),
  gen('t25', 'm1','Arjun Sharma',  'A-101','maintenance',2500,2500,'2026-03-05','2026-03-04','paid',  'Mar 2026 Maintenance', 'RCP-2603-006'),
  gen('t26', 'm7','Manish Patel',  'D-401','electricity',  920, 920,'2026-03-05','2026-03-05','paid', 'Mar 2026 Electricity', 'RCP-2603-007'),
  gen('t27', 'm8','Kavitha Menon', 'D-402','maintenance',2500,1000,'2026-03-05',undefined,  'partial','Mar 2026 Maintenance','RCP-2603-008'),
  gen('t28', 'm2','Priya Nair',    'A-102','maintenance',2500,2500,'2026-04-05',undefined,  'pending','Apr 2026 Maintenance', 'RCP-2604-001'),
  gen('t29', 'm3','Rahul Gupta',   'B-201','maintenance',2500,   0,'2026-04-05',undefined,  'overdue','Apr 2026 Maintenance', 'RCP-2604-002'),
  gen('t30', 'm6','Deepika Iyer',  'C-302','electricity',  940, 940,'2026-04-05',undefined,  'paid',  'Apr 2026 Electricity', 'RCP-2604-003'),
];

// ---- UTILITY HISTORY (for predictions) ----
export const UTILITY_HISTORY: UtilityBill[] = [
  { month: '2025-10', electricity: 7200, water: 2400, maintenance: 20000, security: 4800 },
  { month: '2025-11', electricity: 7560, water: 2450, maintenance: 20000, security: 4800 },
  { month: '2025-12', electricity: 8100, water: 2500, maintenance: 20000, security: 4800 },
  { month: '2026-01', electricity: 7800, water: 2480, maintenance: 20000, security: 4800 },
  { month: '2026-02', electricity: 8200, water: 2520, maintenance: 20000, security: 4800 },
  { month: '2026-03', electricity: 8450, water: 2560, maintenance: 20000, security: 4800 },
];

// ---- AUDIT LOG ----
export const AUDIT_LOG: AuditLog[] = [
  { id: 'a1',  timestamp: '2026-04-04T09:15:00Z', actor: 'System',        action: 'Invoice Generated',    details: 'Apr 2026 invoices dispatched to 8 members',   type: 'system'  },
  { id: 'a2',  timestamp: '2026-04-03T14:32:00Z', actor: 'Arjun Sharma',  action: 'Payment Recorded',     details: 'Deepika Iyer — Electricity ₹940 marked paid', type: 'payment' },
  { id: 'a3',  timestamp: '2026-04-03T11:05:00Z', actor: 'System',        action: 'Overdue Alert',        details: 'Rahul Gupta (B-201) — 3 bills overdue',       type: 'system'  },
  { id: 'a4',  timestamp: '2026-04-02T16:48:00Z', actor: 'Arjun Sharma',  action: 'Member Updated',       details: 'Kavitha Menon phone number updated',          type: 'admin'   },
  { id: 'a5',  timestamp: '2026-04-01T10:00:00Z', actor: 'System',        action: 'Monthly Rollover',     details: 'March 2026 books closed. Recovery: 72.4%',    type: 'system'  },
  { id: 'a6',  timestamp: '2026-03-31T18:22:00Z', actor: 'Vikram Singh',  action: 'Partial Payment',      details: 'Mar Maintenance — ₹800 of ₹2500 paid',       type: 'payment' },
  { id: 'a7',  timestamp: '2026-03-30T09:10:00Z', actor: 'System',        action: 'Split-Pay Offered',    details: 'Vikram Singh offered EMI plan (late payer)',  type: 'system'  },
  { id: 'a8',  timestamp: '2026-03-28T14:55:00Z', actor: 'Arjun Sharma',  action: 'Penalty Issued',       details: 'Vikram Singh — ₹250 late payment penalty',   type: 'admin'   },
  { id: 'a9',  timestamp: '2026-03-15T11:30:00Z', actor: 'System',        action: 'Reminder Sent',        details: '3 members notified for pending dues',         type: 'system'  },
  { id: 'a10', timestamp: '2026-03-05T08:00:00Z', actor: 'System',        action: 'Invoice Generated',    details: 'Mar 2026 invoices dispatched to 8 members',   type: 'system'  },
  { id: 'a11', timestamp: '2026-02-28T17:40:00Z', actor: 'Priya Nair',    action: 'Payment Made',         details: 'Feb Maintenance — ₹2500 self-service portal', type: 'payment' },
  { id: 'a12', timestamp: '2026-02-20T10:22:00Z', actor: 'Arjun Sharma',  action: 'New Member',           details: 'Manish Patel added to D-401',                 type: 'member'  },
  { id: 'a13', timestamp: '2026-02-05T08:00:00Z', actor: 'System',        action: 'Invoice Generated',    details: 'Feb 2026 invoices dispatched to 8 members',   type: 'system'  },
  { id: 'a14', timestamp: '2026-01-31T15:10:00Z', actor: 'System',        action: 'Monthly Rollover',     details: 'January 2026 books closed. Recovery: 62.5%',  type: 'system'  },
  { id: 'a15', timestamp: '2026-01-05T08:00:00Z', actor: 'System',        action: 'Invoice Generated',    details: 'Jan 2026 invoices dispatched to 8 members',   type: 'system'  },
];

// ---- COMPUTED STATS ----
export function getStats() {
  const total = TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
  const collected = TRANSACTIONS.reduce((s, t) => s + t.paidAmount, 0);
  const pending = TRANSACTIONS.filter(t => t.status === 'pending' || t.status === 'partial').reduce((s, t) => s + (t.amount - t.paidAmount), 0);
  const overdue = TRANSACTIONS.filter(t => t.status === 'overdue').reduce((s, t) => s + t.amount, 0);
  const collectionRate = Math.round((collected / total) * 100);
  const overdueCount = TRANSACTIONS.filter(t => t.status === 'overdue').length;
  const lateMembers = MEMBERS.filter(m => m.isLate).length;
  return { total, collected, pending, overdue, collectionRate, overdueCount, lateMembers };
}

export function getMemberTransactions(memberId: string) {
  return TRANSACTIONS.filter(t => t.memberId === memberId);
}

// Predictive: simple linear regression on utility history
export function getPrediction() {
  const n = UTILITY_HISTORY.length;
  const elec = UTILITY_HISTORY.map(u => u.electricity);
  const water = UTILITY_HISTORY.map(u => u.water);

  function predict(arr: number[]) {
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    const slope = arr.map((v, i) => (v - mean) * (i - (n - 1) / 2)).reduce((a, b) => a + b, 0) /
      arr.map((_, i) => Math.pow(i - (n - 1) / 2, 2)).reduce((a, b) => a + b, 0);
    return Math.round(arr[n - 1] + slope);
  }

  const stats = getStats();
  const delinquencyRate = (stats.overdue + stats.pending) / stats.total;

  return {
    electricity: predict(elec),
    water: predict(water),
    maintenance: 20000,
    security: 4800,
    delinquencyRate: Math.round(delinquencyRate * 100),
    expectedCollection: Math.round((1 - delinquencyRate) * (predict(elec) + predict(water) + 20000 + 4800)),
    projectedShortfall: Math.round(delinquencyRate * (predict(elec) + predict(water) + 20000 + 4800)),
  };
}
