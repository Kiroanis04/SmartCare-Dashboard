import { MediaMatcher } from '@angular/cdk/layout';
import { Component, OnDestroy, inject, signal, ViewChild } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

interface NavChild {
  label: string;
  icon: string;
  route: string;
}

interface NavItem {
  label: string;
  icon: string;
  route: string;
  children?: NavChild[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterModule,
    MatExpansionModule
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar implements OnDestroy {
  @ViewChild('snav') sidenav!: MatSidenav;

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Products', icon: 'inventory', route: '/inventory' },
    { label: 'Orders', icon: 'shopping_cart', route: '/orders' },
    {
      label: 'Users',
      icon: 'group',
      route: '/users',
      children: [
        { label: 'Pharmacists', icon: 'medication', route: '/users/pharmacists' },
      ],
    },
    { label: 'Notifications', icon: 'notifications', route: '/notifications' }
  ];

  protected readonly isMobile = signal(true);
  private readonly _mobileQuery: MediaQueryList;
  private readonly _mobileQueryListener: () => void;

  constructor(
    private router: Router
  ) {
    const media = inject(MediaMatcher);
    this._mobileQuery = media.matchMedia('(max-width: 600px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () => this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);

    // Close sidebar on route change for mobile
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobile() && this.sidenav) {
        this.sidenav.close();
      }
    });
  }

  ngOnDestroy(): void {
    this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  // Method to close sidebar (can be called from template)
  closeSidebar(): void {
    if (this.sidenav && this.isMobile()) {
      this.sidenav.close();
    }
  }

  // Method to toggle sidebar
  toggleSidebar(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  // Check if a route is active (for expansion panels)
  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  // Check if any child route is active
  isChildRouteActive(children: NavChild[]): boolean {
    return children.some(child => this.router.url === child.route);
  }
}
