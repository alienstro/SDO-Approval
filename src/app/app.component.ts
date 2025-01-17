import { Component } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: false
})
export class AppComponent {
  title = 'SDO-Signature';

  showSideBar: boolean = true;
  sideBarOpen = true;
  sideBarMode: MatDrawerMode = 'side';

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showSideBar = this.router.url !== '/login';
      }
    });
  }
}
