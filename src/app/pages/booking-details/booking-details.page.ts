// @ts-nocheck
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './booking-details.markup';
import { supabase } from '../../../services/supabase.service';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }']
})
export class BookingDetailsPage extends LegacyPage {
  protected markup = {
    html: HTML,
    css: CSS,
    title: TITLE,
    bodyClass: BODY_CLASS
  };

  protected run(location: any, __onReady: any): void {
    __onReady(() => {});

    const $ = (id: string) => document.getElementById(id);

    const showMessage = (text: string) => {
      const m = $('detailsMessage');
      if (m) {
        m.textContent = text;
        m.hidden = false;
      }
      const c = $('detailsContent');
      if (c) c.hidden = true;
    };

    const escapeHtml = (value: any): string =>
      String(value ?? '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[ch]);

    const formatDate = (value: string) => {
      if (!value) return 'Not specified';
      const d = new Date(value + 'T00:00:00');
      return Number.isNaN(d.getTime())
        ? value
        : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = (value: string) => {
      if (!value) return 'Not specified';
      const parts = value.split(':');
      const d = new Date();
      d.setHours(Number(parts[0]), Number(parts[1] || 0), 0, 0);
      return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    };

    const formatStamp = (value: string) => {
      const d = new Date(value);
      if (!value || Number.isNaN(d.getTime())) return '';
      return (
        d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
        ' · ' +
        d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
      );
    };

    const formatPrice = (value: any) => {
      const amount = Number(value);
      return Number.isFinite(amount)
        ? '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : 'Price unavailable';
    };

    // Build the progress steps from the booking status.
    // States: done (green) | current (blue) | todo (grey) | cancelled-step (red)
    const buildSteps = (booking: any) => {
      const status = String(booking.status || 'pending').toLowerCase();
      const submittedAt = formatStamp(booking.created_at);

      const steps = [
        {
          title: 'Booking Submitted',
          desc: 'Your booking request was received.',
          time: submittedAt,
          state: 'done'
        }
      ];

      if (status === 'cancelled') {
        steps.push({
          title: 'Booking Cancelled',
          desc: 'This booking has been cancelled.',
          time: '',
          state: 'cancelled-step'
        });
        return steps;
      }

      const confirmed = status === 'confirmed' || status === 'completed';
      const completed = status === 'completed';

      steps.push({
        title: 'Booking Confirmed',
        desc: confirmed
          ? 'Your appointment has been approved.'
          : 'Waiting for the shop to approve your appointment.',
        time: '',
        state: confirmed ? 'done' : 'current'
      });

      steps.push({
        title: 'In Progress',
        desc: completed
          ? 'The service was carried out.'
          : 'This step will update when the service begins.',
        time: '',
        state: completed ? 'done' : confirmed ? 'current' : 'todo'
      });

      steps.push({
        title: 'Completed',
        desc: completed ? 'Your appointment is finished.' : 'Your appointment will be marked finished here.',
        time: '',
        state: completed ? 'done' : 'todo'
      });

      return steps;
    };

    const renderSteps = (steps: any[]) =>
      steps
        .map(
          (s) => `
        <li class="${escapeHtml(s.state)}">
          <span class="dot">${s.state === 'done' ? '✓' : s.state === 'cancelled-step' ? '✕' : ''}</span>
          <div>
            <div class="step-title">${escapeHtml(s.title)}</div>
            <p class="step-desc">${escapeHtml(s.desc)}</p>
            ${s.time ? `<span class="step-time">${escapeHtml(s.time)}</span>` : ''}
          </div>
        </li>`
        )
        .join('');

    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('id');

    const loadBooking = async () => {
      try {
        if (!bookingId) {
          showMessage('No booking was selected. Go back to My Bookings and try again.');
          return;
        }

        showMessage('Loading booking...');

        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
          showMessage('Please sign in to view this booking.');
          return;
        }
        const userId = authData.user.id;

        const { data: booking, error } = await supabase
          .from('bookings')
          .select(
            'id, user_id, service_id, pet_name, pet_type, pet_breed, booking_date, booking_time, status, notes, price, created_at'
          )
          .eq('id', bookingId)
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('Failed to load booking:', error);
          showMessage('We could not load this booking. Please try again later.');
          return;
        }
        if (!booking) {
          showMessage('We could not find this booking.');
          return;
        }

        let serviceName = 'Pet care service';
        if (booking.service_id !== null && booking.service_id !== undefined) {
          const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('name')
            .eq('id', booking.service_id)
            .maybeSingle();
          if (serviceError) console.error('Failed to load service name:', serviceError);
          else if (service?.name) serviceName = service.name;
        }

        const status = String(booking.status || 'pending').toLowerCase();
        const petDetails = [booking.pet_name, booking.pet_type, booking.pet_breed]
          .filter(Boolean)
          .join(' · ');
        const canCancel = status === 'pending' || status === 'confirmed';

        $('detailsBookingNumber').textContent = 'Booking #' + booking.id;

        const pill = $('detailsStatus');
        pill.textContent = status;
        const statusKey = status.replace(/[_-]+/g, ' ');
        pill.textContent = statusKey;
        pill.className = 'booking-status status-' + statusKey.replace(/\s+/g, '-');
        pill.hidden = false;

        $('detailsService').textContent = serviceName;
        $('detailsDate').textContent = formatDate(booking.booking_date);
        $('detailsTime').textContent = formatTime(booking.booking_time);
        $('detailsPet').textContent = petDetails || 'Not specified';
        $('detailsPrice').textContent = formatPrice(booking.price);

        const notesWrap = $('detailsNotesWrap');
        if (booking.notes) {
          $('detailsNotes').textContent = booking.notes;
          notesWrap.hidden = false;
        } else {
          notesWrap.hidden = true;
        }

        $('detailsTimeline').innerHTML = renderSteps(buildSteps(booking));

        const reminder = $('detailsReminder');
        if (canCancel) {
          $('detailsReminderText').textContent =
            'Please be ready for your scheduled appointment on ' +
            formatDate(booking.booking_date) +
            ' at ' +
            formatTime(booking.booking_time) +
            '.';
          reminder.hidden = false;
        } else {
          reminder.hidden = true;
        }

        const cancelBtn = $('detailsCancel') as HTMLButtonElement;
        cancelBtn.hidden = !canCancel;
        cancelBtn.disabled = false;
        cancelBtn.textContent = 'Cancel Booking';
        cancelBtn.onclick = async () => {
       const ok = await confirmDialog({
          title: 'Cancel this booking?',
          message: 'This action cannot be undone.'
        });
        if (!ok) return;

          cancelBtn.disabled = true;
          cancelBtn.textContent = 'Cancelling...';

          const { error: cancelError } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', booking.id)
            .eq('user_id', userId);

          if (cancelError) {
            console.error('Failed to cancel booking:', cancelError);
            cancelBtn.disabled = false;
            cancelBtn.textContent = 'Cancel Booking';
            window.alert('We could not cancel this booking. Please try again.');
            return;
          }

          loadBooking();
        };

        $('detailsMessage').hidden = true;
        $('detailsContent').hidden = false;
      } catch (err) {
        console.error('Unexpected booking details error:', err);
        showMessage('Something went wrong while loading this booking. Please try again.');
      }
    };

    loadBooking();
  }
}