
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { App } from '@capacitor/app';
import { initSafeArea } from './legacy/safe-area';
import { installNativeHttp } from './legacy/native-http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: [':host { display: contents; }'],
})
export class AppComponent {
  constructor(private router: Router) {
    // Keep the top bar below the status bar and bottom tabs above the gesture bar.
    initSafeArea();

    // Make API calls work from the installed app.
    installNativeHttp();

    // Handle links that reopen the installed app after PayMongo checkout.
    App.addListener('appUrlOpen', ({ url }) => {
      try {
        const deepLink = new URL(url);

        if (
          deepLink.protocol === 'furrycorner:' &&
          deepLink.hostname === 'payment-success'
        ) {
          const orderId = deepLink.searchParams.get('order_id');

          if (orderId) {
            this.router.navigate(['/order-confirmation'], {
              queryParams: { order_id: orderId },
            });
          } else {
            this.router.navigate(['/purchase-status']);
          }
        }
      } catch (error) {
        console.error('[FurryCorner deep link] Invalid URL:', error);
      }
    }).catch(() => {});

    // Old pages use plain <a href="page.html"> links.
    document.addEventListener('click', (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) return;

      const a = (e.target as Element)?.closest?.('a[href') as HTMLAnchorElement | null;
      if (!a || a.target || a.hasAttribute('download')) return;

      const href = a.getAttribute('href') || '';

      // Handle in-page anchors.
      if (href.startsWith('#')) {
        const id = decodeURIComponent(href.slice(1));
        const target = id ? document.getElementById(id) : null;

        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      if (!href || /^(mailto:|tel:|sms:|javascript:)/i.test(href)) return;

      const u = new URL(a.href, window.location.href);
      if (u.origin !== window.location.origin) return;

      e.preventDefault();

      const seg = (u.pathname.split('/').pop() || 'index')
        .replace(/\.html$/, '');

      const route =
        (seg === 'index' ? '/' : '/' + seg) + u.search + u.hash;

      console.log(
        '[FurryCorner navigation] clickedHref=' + href +
        ' | resolvedUrl=' + u.href +
        ' | route=' + route
      );

      this.router.navigateByUrl(route);
    });

    // Android hardware back button.
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    }).catch(() => {});
  }
}
