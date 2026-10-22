
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { MENU_CSS, appPage, wireBack } from '../../legacy/menu-pages';

@Component({
  selector: 'app-about-app',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }']
})
export class AboutAppPage extends LegacyPage {
  protected markup = {
    html: appPage.html,
    css: MENU_CSS,
    title: appPage.title,
    bodyClass: 'page-menu'
  };

  protected run(location: any, __onReady: any): void {
    __onReady(() => {});
    wireBack(location);
  }
}
