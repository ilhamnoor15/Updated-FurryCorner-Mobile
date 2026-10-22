import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { MENU_CSS, contactPage, wireBack } from '../../legacy/menu-pages';
import { MODAL_CSS, wireContactForm } from '../../legacy/contactForm';

@Component({
  selector: 'app-contact',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }']
})
export class ContactPage extends LegacyPage {
  protected markup = {
    html: contactPage.html,
    css: MENU_CSS + MODAL_CSS,
    title: contactPage.title,
    bodyClass: 'page-menu'
  };

  protected run(location: any, __onReady: any): void {
    __onReady(() => {
      wireBack(location);
      wireContactForm();
    });
  }
}