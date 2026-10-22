// ====================================================================
// TataDana - Midtrans Payment & Manual Bank Transfer Service
// Handles Snap token generation, payment webhooks, manual transfer proofs,
// and Admin approve/reject flow for Pro subscriptions
// ====================================================================

import { supabase } from '../db/supabaseClient.js';

export class MidtransService {
  constructor() {
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-placeholder';
    this.clientKey = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-placeholder';
    this.isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  }

  // Create payment order
  async createPaymentOrder(userId, plan = 'pro', paymentType = 'midtrans') {
    const amount = plan === 'starter' ? 49000 : 99000;
    const orderId = `TD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const paymentRecord = {
      user_id: userId,
      order_id: orderId,
      plan,
      amount,
      payment_type: paymentType,
      status: 'pending'
    };

    const { data: order } = await supabase.from('payments').insert(paymentRecord);

    return {
      orderId,
      plan,
      amount,
      paymentType,
      snapToken: `SNAP-${orderId}-MOCK_TOKEN`,
      redirectUrl: `/payment/checkout?order_id=${orderId}`
    };
  }

  // Submit manual transfer proof
  async submitManualTransferProof(orderId, proofImageUrl) {
    const { data: updated } = await supabase
      .from('payments')
      .eq('order_id', orderId)
      .update({
        proof_image_url: proofImageUrl,
        status: 'pending'
      });

    return { success: true, updated };
  }

  // Midtrans Webhook Handler
  async handleMidtransWebhook(payload) {
    const { order_id, transaction_status, fraud_status } = payload;

    let isSuccess = false;
    if (transaction_status === 'capture') {
      isSuccess = fraud_status === 'accept';
    } else if (transaction_status === 'settlement') {
      isSuccess = true;
    }

    if (isSuccess) {
      // Find order
      const { data: order } = await supabase
        .from('payments')
        .eq('order_id', order_id)
        .single()
        .execute();

      if (order) {
        await supabase
          .from('payments')
          .eq('order_id', order_id)
          .update({
            status: 'settlement',
            midtrans_response: payload,
            approved_at: new Date().toISOString()
          });

        // Upgrade user plan
        await supabase
          .from('profiles')
          .eq('id', order.user_id)
          .update({ plan: order.plan });

        return { success: true, upgraded: true, userId: order.user_id };
      }
    }

    return { success: true, updated: false };
  }

  // Admin Approve Payment (Part 10)
  async adminApprovePayment(paymentId, adminId) {
    const { data: payment } = await supabase
      .from('payments')
      .eq('id', paymentId)
      .single()
      .execute();

    if (!payment) return { success: false, error: 'Pembayaran tidak ditemukan.' };

    await supabase
      .from('payments')
      .eq('id', paymentId)
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString()
      });

    // Upgrade user plan
    await supabase
      .from('profiles')
      .eq('id', payment.user_id)
      .update({ plan: payment.plan });

    // Log admin audit
    await supabase.from('admin_audit_logs').insert({
      admin_id: adminId,
      target_user_id: payment.user_id,
      action: 'approve_payment',
      details: { payment_id: paymentId, order_id: payment.order_id, plan: payment.plan }
    });

    return { success: true };
  }

  // Admin Reject Payment
  async adminRejectPayment(paymentId, adminId, reason = 'Bukti transfer tidak valid') {
    const { data: payment } = await supabase
      .from('payments')
      .eq('id', paymentId)
      .single()
      .execute();

    if (!payment) return { success: false, error: 'Pembayaran tidak ditemukan.' };

    await supabase
      .from('payments')
      .eq('id', paymentId)
      .update({
        status: 'rejected',
        approved_by: adminId,
        approved_at: new Date().toISOString()
      });

    // Log admin audit
    await supabase.from('admin_audit_logs').insert({
      admin_id: adminId,
      target_user_id: payment.user_id,
      action: 'reject_payment',
      details: { payment_id: paymentId, reason }
    });

    return { success: true };
  }
}

export const midtransService = new MidtransService();
