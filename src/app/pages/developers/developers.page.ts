import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { MENU_CSS, developersPage, wireBack } from '../../legacy/menu-pages';

@Component({
  selector: 'app-developers',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }']
})
export class DevelopersPage extends LegacyPage {
  protected markup = {
    html: developersPage.html,
    css: MENU_CSS,
    title: developersPage.title,
    bodyClass: 'page-menu'
  };

  protected run(location: any, __onReady: any): void {
    __onReady(() => {});
    wireBack(location);
  }
}
