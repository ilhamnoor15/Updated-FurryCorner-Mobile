// @ts-nocheck
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { MENU_CSS, aboutUsPage, wireBack } from '../../legacy/menu-pages';

@Component({
  selector: 'app-about-us',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }']
})
export class AboutUsPage extends LegacyPage {
  protected markup = { html: aboutUsPage.html, css: MENU_CSS, title: aboutUsPage.title, bodyClass: 'page-menu' };
  protected run(location: any, __onReady: any): void {
  __onReady(() => {});
  wireBack(location);
  }
}