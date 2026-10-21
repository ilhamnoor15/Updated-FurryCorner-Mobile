
 // @ts-nocheck
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './bookings.markup';
import { supabase } from '../../../services/supabase.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }']
})
export class BookingsPage extends LegacyPage {
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

    const showMessage = (text: string) => {
      if (message) {
        message.textContent = text;
        message.style.display = 'block';
      }
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

        list.innerHTML = bookings.map((booking: any) => {
          const serviceName =
            serviceNames[String(booking.service_id)] || 'Pet care service';

          const petDetails = [
            booking.pet_name,
            booking.pet_type,
            booking.pet_breed
          ].filter(Boolean).join(' · ');

          const status = String(booking.status || 'pending')
            .replace(/[_-]+/g, ' ');

          return `
            <article class="booking-card">
              <div class="booking-top">
                <div>
                  <h2>${escapeHtml(serviceName)}</h2>
                  <div class="booking-number">
                    Booking #${escapeHtml(booking.id)}
                  </div>
                </div>
                <span class="booking-status">
                  ${escapeHtml(status)}
                </span>
              </div>

              <div class="booking-details">
                <div>
                  <span class="detail-label">Booking date</span>
                  <span class="detail-value">
                    ${escapeHtml(formatDate(booking.booking_date))}
                  </span>
                </div>

                <div>
                  <span class="detail-label">Booking time</span>
                  <span class="detail-value">
                    ${escapeHtml(formatTime(booking.booking_time))}
                  </span>
                </div>

                <div>
                  <span class="detail-label">Pet</span>
                  <span class="detail-value">
                    ${escapeHtml(petDetails || 'Not specified')}
                  </span>
                </div>

                <div>
                  <span class="detail-label">Price</span>
                  <span class="booking-price">
                    ${escapeHtml(formatPrice(booking.price))}
                  </span>
                </div>
              </div>

              ${booking.notes ? `
                <div class="booking-notes">
                  <span class="detail-label">Notes</span>
                  <span class="detail-value">
                    ${escapeHtml(booking.notes)}
                  </span>
                </div>
              ` : ''}
            </article>
          `;
        }).join('');

        if (message) message.style.display = 'none';

      } catch (error) {
        console.error('Unexpected bookings error:', error);
        showMessage(
          'Something went wrong while loading your bookings. Please try again.'
        );
      }
    };

    loadBookings();
  }
}
