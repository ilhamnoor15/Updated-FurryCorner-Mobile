// notify.ts
// Creates a row in the Supabase `notifications` table for the signed-in user.
// The Notifications page already reads that table, so new rows appear there automatically.
import { supabase } from '../../services/supabase.service';

export type NotificationKind = 'order_cancelled' | 'booking_cancelled' | 'contact_message';

export async function createNotification(opts: {
  type: NotificationKind;
  title: string;
  message?: string;
  relatedOrderId?: number | string | null;
}): Promise<boolean> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) return false; // guests have no account, so nothing to notify

    const { error } = await supabase.from('notifications').insert({
      user_id: user.id,
      title: opts.title,
      message: opts.message || '',
      notification_type: opts.type,
      is_read: false,
      related_order_id: opts.relatedOrderId ?? null
    });
    if (error) throw error;
    return true;
  } catch (error) {
    // Never block the cancel / send action itself because a notification failed.
    console.error('Could not create notification:', error);
    return false;
  }
}

/* Call these right AFTER the cancel / send succeeded. */

export const notifyOrderCancelled = (orderId: number | string, orderNumber?: string) =>
  createNotification({
    type: 'order_cancelled',
    title: `Order #${orderNumber || orderId} was cancelled`,
    message: 'Your order has been cancelled.',
    relatedOrderId: orderId
  });

export const notifyBookingCancelled = (bookingId: number | string, petName?: string) =>
  createNotification({
    type: 'booking_cancelled',
    title: `Booking #${bookingId} was cancelled${petName ? ` (${petName})` : ''}`,
    message: 'Your service booking has been cancelled.'
  });

export const notifyContactSent = () =>
  createNotification({
    type: 'contact_message',
    title: 'Your message was sent to FurryCorner',
    message: 'We received your message and will get back to you soon.'
  });