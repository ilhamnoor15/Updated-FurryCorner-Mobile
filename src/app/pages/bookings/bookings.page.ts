// @ts-nocheck
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './bookings.markup';
import { confirmDialog } from '../../legacy/confirm-dialog';
import { supabase } from '../../../services/supabase.service';
import { notifyBookingCancelled } from '../../legacy/notify';

@Component({
  selector: 'app-bookings',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }']
})
export class BookingsPage extends LegacyPage {
  private router = inject(Router);

  protected markup = {
    html: HTML,
    css: CSS,
    title: TITLE,
    bodyClass: BODY_CLASS
  };

  protected run(location: any, __onReady: any): void {
    __onReady(() => {});

    const message = document.getElementById('bookingsMessage');
    const list = document.getElementById('bookingsList');
    const filters = document.getElementById('bookingFilters');

    let currentFilter = 'all';
    let currentUserId: string | null = null;

    const ICON_CALENDAR =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>';
    const ICON_PAW =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="10" r="1.8"/><circle cx="10" cy="6" r="1.8"/><circle cx="14" cy="6" r="1.8"/><circle cx="18" cy="10" r="1.8"/><path d="M12 12c-3 0-5 2.5-5 4.5 0 1.7 1.5 2.5 3 2.2 1-.2 1.4-.4 2-.4s1 .2 2 .4c1.5.3 3-.5 3-2.2 0-2-2-4.5-5-4.5z"/></svg>';

    const FILTERS: Record<string, (s: string) => boolean> = {
      all: () => true,
      upcoming: (s) => ['pending', 'confirmed', 'in progress'].includes(s),
      completed: (s) => s === 'completed',
      cancelled: (s) => s === 'cancelled' || s === 'canceled'
    };

    const showMessage = (text: string) => {
      if (message) {
        message.textContent = text;
        message.style.display = 'block';
      }
    };

    const hideMessage = () => {
      if (message) message.style.display = 'none';
    };

    const escapeHtml = (value: any): string =>
      String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[character]);

    const formatDate = (value: string) => {
      if (!value) return 'Not specified';

      const date = new Date(value + 'T00:00:00');
      return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
    };

    const formatTime = (value: string) => {
      if (!value) return 'Not specified';

      const parts = value.split(':');
      const date = new Date();
      date.setHours(Number(parts[0]), Number(parts[1] || 0), 0, 0);

      return date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit'
      });
    };

    const formatPrice = (value: any) => {
      const amount = Number(value);
      return Number.isFinite(amount)
        ? '₱' + amount.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        : 'Price unavailable';
    };

    // Show/hide cards for the active chip
    const applyFilter = () => {
      if (!list) return;
      const test = FILTERS[currentFilter] || FILTERS.all;
      let visible = 0;

      list.querySelectorAll('.booking-card').forEach((card: any) => {
        const show = test(card.dataset.status);
        card.hidden = !show;
        if (show) visible++;
      });

      if (list.children.length > 0 && visible === 0) {
        showMessage('No bookings in this category.');
      } else if (list.children.length > 0) {
        hideMessage();
      }
    };

    const renderCard = (booking: any, serviceNames: Record<string, string>) => {
      const serviceName =
        serviceNames[String(booking.service_id)] || 'Pet care service';

      const petDetails = [
        booking.pet_name,
        booking.pet_type,
        booking.pet_breed
      ].filter(Boolean).join(' · ');

      const statusKey = String(booking.status || 'pending')
        .replace(/[_-]+/g, ' ')
        .toLowerCase();
      const statusClass = 'status-' + statusKey.replace(/\s+/g, '-');
      const canCancel = statusKey === 'pending' || statusKey === 'confirmed';

      return `
        <article class="booking-card" data-status="${escapeHtml(statusKey)}">
          <div class="booking-top">
            <div>
              <h2>${escapeHtml(serviceName)}</h2>
              <span class="booking-number">Booking #${escapeHtml(booking.id)}</span>
            </div>
            <span class="booking-status ${escapeHtml(statusClass)}">
              ${escapeHtml(statusKey)}
            </span>
          </div>

          <div class="booking-meta">
            <div class="meta-row">
              <span class="meta-left">
                ${ICON_CALENDAR}
                <span>${escapeHtml(formatDate(booking.booking_date))} · ${escapeHtml(formatTime(booking.booking_time))}</span>
              </span>
            </div>
            <div class="meta-row">
              <span class="meta-left">
                ${ICON_PAW}
                <span>${escapeHtml(petDetails || 'Not specified')}</span>
              </span>
              <span class="booking-price">${escapeHtml(formatPrice(booking.price))}</span>
            </div>
          </div>

          ${booking.notes ? `
            <div class="booking-notes">
              <span class="detail-label">Notes</span>
              <span class="detail-value">${escapeHtml(booking.notes)}</span>
            </div>
          ` : ''}

          <div class="booking-actions">
            <button class="btn btn-track" type="button"
              data-action="track" data-id="${escapeHtml(booking.id)}">
              Track Booking
            </button>
            ${canCancel ? `
              <button class="btn btn-cancel" type="button"
                data-action="cancel" data-id="${escapeHtml(booking.id)}">
                Cancel Booking
              </button>
            ` : ''}
          </div>
        </article>
      `;
    };

    const cancelBooking = async (id: string, button: HTMLButtonElement) => {
      if (!currentUserId) return;
      const ok = await confirmDialog({
  title: 'Cancel this booking?',
  message: 'This action cannot be undone.'
});
if (!ok) return;

      button.disabled = true;
      button.textContent = 'Cancelling...';

      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('user_id', currentUserId)
        .select('id, pet_name')
        .maybeSingle();

      if (error) {
        console.error('Failed to cancel booking:', error);
        button.disabled = false;
        button.textContent = 'Cancel Booking';
        window.alert('We could not cancel this booking. Please try again.');
        return;
      }

      // Add a "Booking cancelled" entry to the Notifications page.
      await notifyBookingCancelled(id, data?.pet_name);

      loadBookings();
    };

    const loadBookings = async () => {
      try {
        showMessage('Loading your bookings...');

        if (list) list.innerHTML = '';

        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData?.user) {
          showMessage('Please sign in to view your bookings.');
          return;
        }

        const userId = authData.user.id;
        currentUserId = userId;

        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(
            'id, user_id, service_id, pet_name, pet_type, pet_breed, booking_date, booking_time, status, notes, price, created_at'
          )
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (bookingsError) {
          console.error('Failed to load bookings:', bookingsError);
          showMessage(
            'We could not load your bookings. Please try again later.'
          );
          return;
        }

        if (!bookings || bookings.length === 0) {
          showMessage('You have no bookings yet.');
          return;
        }

        const serviceIds = [
          ...new Set(
            bookings
              .map((booking: any) => booking.service_id)
              .filter((id: any) => id !== null && id !== undefined)
              .map((id: any) => String(id))
          )
        ];

        const serviceNames: Record<string, string> = {};

        if (serviceIds.length > 0) {
          const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('id, name')
            .in('id', serviceIds);

          if (servicesError) {
            console.error('Failed to load service names:', servicesError);
          } else {
            (services || []).forEach((service: any) => {
              serviceNames[String(service.id)] = service.name;
            });
          }
        }

        if (!list) {
          showMessage('The bookings list could not be displayed.');
          return;
        }

        list.innerHTML = bookings
          .map((booking: any) => renderCard(booking, serviceNames))
          .join('');

        hideMessage();
        applyFilter();

      } catch (error) {
        console.error('Unexpected bookings error:', error);
        showMessage(
          'Something went wrong while loading your bookings. Please try again.'
        );
      }
    };

    // Filter chips
    filters?.addEventListener('click', (event: any) => {
      const chip = event.target.closest('.chip');
      if (!chip) return;

      currentFilter = chip.dataset.filter || 'all';
      filters.querySelectorAll('.chip').forEach((c: any) => {
        const on = c === chip;
        c.classList.toggle('active', on);
        c.setAttribute('aria-selected', String(on));
      });
      applyFilter();
    });

    // Track / Cancel buttons
    list?.addEventListener('click', (event: any) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;

      const id = button.dataset.id;

      if (button.dataset.action === 'cancel') {
        cancelBooking(id, button);
      }

      if (button.dataset.action === 'track') {
        this.router.navigate(['/booking-details'], { queryParams: { id } });
      }
    });

    loadBookings();
  }
}