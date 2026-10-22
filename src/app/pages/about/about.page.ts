// @ts-nocheck  (legacy script below is plain JavaScript carried over from about.html)
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './about.markup';
import { MODAL_CSS, wireContactForm } from '../../legacy/contactForm';

@Component({
  selector: 'app-about',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }'],
})
export class AboutPage extends LegacyPage {
  protected markup = { html: HTML, css: CSS + MODAL_CSS, title: TITLE, bodyClass: BODY_CLASS };

  // `location` is a shim that routes through the Angular Router.
  protected run(location: any, __onReady: any): void {
    __onReady(() => {
      wireContactForm();
    });
  }
}