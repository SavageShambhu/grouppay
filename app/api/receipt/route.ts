import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { TRANSACTIONS, MEMBERS } from '@/lib/data';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('gp_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const txId = searchParams.get('id');
  if (!txId) return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });

  const tx = TRANSACTIONS.find(t => t.id === txId);
  if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

  // Members can only get their own receipts
  if (payload.role === 'member' && tx.memberId !== payload.memberId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const member = MEMBERS.find(m => m.id === tx.memberId);

  // Generate PDF as HTML-based response (rendered as PDF via browser print)
  // For true server-side PDF, install puppeteer or @react-pdf/renderer
  const html = generateReceiptHTML(tx, member);

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'X-Receipt-No': tx.receiptNo,
    },
  });
}

function generateReceiptHTML(tx: import('@/lib/data').Transaction, member: import('@/lib/data').Member | undefined) {
  const statusColor = tx.status === 'paid' ? '#4ade80' : tx.status === 'overdue' ? '#f87171' : '#fbbf24';
  const categoryIcon = { maintenance: '🏢', electricity: '⚡', water: '💧', security: '🔒', amenity: '🏊', penalty: '⚠️' }[tx.category] || '📋';
  const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const dueFormatted = new Date(tx.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const paidFormatted = tx.paidDate ? new Date(tx.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Pending';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Receipt ${tx.receiptNo}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #f4f6f4; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .receipt { background: white; width: 100%; max-width: 520px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
  .header { background: #0d0f0e; padding: 28px 32px; color: white; }
  .logo { font-family: 'DM Serif Display', serif; font-size: 22px; color: #4ade80; margin-bottom: 4px; }
  .subtitle { font-size: 11px; color: #5c6e63; text-transform: uppercase; letter-spacing: 0.08em; font-family: 'DM Mono', monospace; }
  .receipt-no { font-family: 'DM Mono', monospace; font-size: 11px; color: #9aada0; margin-top: 16px; }
  .body { padding: 28px 32px; }
  .status-banner { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; background: ${tx.status === 'paid' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)'}; border: 1px solid ${statusColor}33; }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; }
  .status-text { font-size: 13px; font-weight: 600; color: ${statusColor}; text-transform: uppercase; letter-spacing: 0.04em; font-family: 'DM Mono', monospace; }
  .amount { font-family: 'DM Serif Display', serif; font-size: 36px; color: #0d0f0e; margin-bottom: 4px; }
  .amount-label { font-size: 11px; color: #9aada0; text-transform: uppercase; letter-spacing: 0.06em; font-family: 'DM Mono', monospace; margin-bottom: 24px; }
  .divider { height: 1px; background: #f0f0f0; margin: 20px 0; }
  .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .row-label { font-size: 12px; color: #9aada0; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'DM Mono', monospace; }
  .row-value { font-size: 13px; color: #0d0f0e; font-weight: 500; }
  .category-badge { display: inline-flex; align-items: center; gap: 5px; background: #f4f6f4; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
  .footer { background: #f9faf9; padding: 20px 32px; border-top: 1px solid #f0f0f0; text-align: center; }
  .footer-text { font-size: 11px; color: #c0c0c0; font-family: 'DM Mono', monospace; }
  .watermark { font-family: 'DM Serif Display', serif; font-size: 11px; color: #9aada0; margin-top: 6px; }
  @media print { body { background: white; padding: 0; } .receipt { box-shadow: none; border-radius: 0; max-width: 100%; } }
  .print-btn { position: fixed; bottom: 24px; right: 24px; background: #0d0f0e; color: #4ade80; border: none; padding: 12px 20px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; }
  .print-btn:hover { background: #1c201e; }
  @media print { .print-btn { display: none; } }
</style>
</head>
<body>
<div class="receipt">
  <div class="header">
    <div class="logo">GroupPay</div>
    <div class="subtitle">Ledger of the Commons — Payment Receipt</div>
    <div class="receipt-no">Receipt No: ${tx.receiptNo} &nbsp;·&nbsp; Generated ${now}</div>
  </div>
  <div class="body">
    <div class="status-banner">
      <div class="status-dot"></div>
      <div class="status-text">${tx.status === 'paid' ? '✓ Payment Confirmed' : tx.status === 'overdue' ? '✗ Overdue' : tx.status === 'partial' ? '⚡ Partially Paid' : 'Pending'}</div>
    </div>
    <div class="amount">₹${tx.paidAmount.toLocaleString('en-IN')}</div>
    <div class="amount-label">${tx.status === 'partial' ? `Paid of ₹${tx.amount.toLocaleString('en-IN')} total` : 'Amount Paid'}</div>

    <div class="row">
      <span class="row-label">Member</span>
      <span class="row-value">${tx.memberName}</span>
    </div>
    <div class="row">
      <span class="row-label">Flat</span>
      <span class="row-value">${tx.flat}</span>
    </div>
    <div class="row">
      <span class="row-label">Email</span>
      <span class="row-value">${member?.email || 'N/A'}</span>
    </div>
    <div class="divider"></div>
    <div class="row">
      <span class="row-label">Description</span>
      <span class="row-value">${tx.description}</span>
    </div>
    <div class="row">
      <span class="row-label">Category</span>
      <span class="row-value"><span class="category-badge">${categoryIcon} ${tx.category}</span></span>
    </div>
    <div class="row">
      <span class="row-label">Due Date</span>
      <span class="row-value">${dueFormatted}</span>
    </div>
    <div class="row">
      <span class="row-label">Paid On</span>
      <span class="row-value">${paidFormatted}</span>
    </div>
    ${tx.status === 'partial' ? `
    <div class="divider"></div>
    <div class="row">
      <span class="row-label">Total Due</span>
      <span class="row-value">₹${tx.amount.toLocaleString('en-IN')}</span>
    </div>
    <div class="row">
      <span class="row-label">Balance</span>
      <span class="row-value" style="color:#f87171">₹${(tx.amount - tx.paidAmount).toLocaleString('en-IN')}</span>
    </div>` : ''}
  </div>
  <div class="footer">
    <div class="footer-text">${tx.receiptNo} &nbsp;·&nbsp; This is a computer-generated receipt</div>
    <div class="watermark">GroupPay — Ledger of the Commons</div>
  </div>
</div>
<button class="print-btn" onclick="window.print()">⬇ Save as PDF</button>
</body>
</html>`;
}
