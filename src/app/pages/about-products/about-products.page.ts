// @ts-nocheck
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { MENU_CSS, productsPage, wireBack } from '../../legacy/menu-pages';

@Component({
  selector: 'app-about-products',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }']
})
export class AboutProductsPage extends LegacyPage {
  protected markup = {
  html: productsPage.html,
  css: MENU_CSS,
  title: productsPage.title,
  bodyClass: 'page-menu'
};
  protected run(location: any, __onReady: any): void {
  __onReady(() => {});
  wireBack(location);
  }
}