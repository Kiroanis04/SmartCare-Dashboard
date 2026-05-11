import { Component, AfterViewInit, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminProfile, AdminProfileApiResponse } from '../../Models/dashboard.model';
import { DashboardService } from '../../Services/dashboard.service';

@Component({
  selector: 'app-adminprofiles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adminprofile.html',
  styleUrls: ['./adminprofile.css']
})
export class Adminprofile implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('usernameSpan') usernameSpan!: ElementRef<HTMLSpanElement>;

  profile: AdminProfile | null = null;
  isLoading    = true;
  errorMessage = '';

  private currentIndex  = 0;
  private typingInterval: any = null;
  private targetElement!: HTMLSpanElement;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadAdminProfile();
  }

  ngAfterViewInit() {}

loadAdminProfile() {
  this.isLoading = true;
  this.dashboardService.getAdminProfile().subscribe({
    next: (response: AdminProfileApiResponse) => {
      if (response.succeeded && response.data) {
        this.profile = {
          id:        response.data.id,
          firstName: response.data.firstName,
          lastName:  response.data.lastName,
          userName:  response.data.userName,
          email:     response.data.email,
          role:      'Administrator',
          avatar:    `https://ui-avatars.com/api/?background=6c63ac&color=fff&rounded=true&size=80&bold=true&name=${response.data.firstName}+${response.data.lastName}&length=2`
        };

        // ← انتظر الـ DOM يتحدث الأول
        setTimeout(() => {
          if (this.usernameSpan) {
            this.targetElement = this.usernameSpan.nativeElement;
            this.startTypewriterAnimation();
          }
        }, 100);

      } else {
        this.setDefaultProfile();
      }
      this.isLoading = false;
    },
    error: () => {
      this.setDefaultProfile();
      this.isLoading = false;
    }
  });
}

  setDefaultProfile() {
    this.profile = {
      id:        'default',
      firstName: 'Admin',
      lastName:  'User',
      userName:  'Admin User',
      email:     'admin@smartcare.com',
      role:      'Administrator',
      avatar:    'https://ui-avatars.com/api/?background=6c63ac&color=fff&rounded=true&size=80&bold=true&name=Admin+User&length=2'
    };
    setTimeout(() => {
      if (this.usernameSpan) {
        this.targetElement = this.usernameSpan.nativeElement;
        this.startTypewriterAnimation();
      }
    }, 0);
  }

startTypewriterAnimation() {
  if (!this.targetElement || !this.profile) return;
  if (this.typingInterval) clearInterval(this.typingInterval);

  this.targetElement.textContent = '';
  this.currentIndex = 0;
  const name = this.profile.firstName ?? this.profile.userName; // ← firstName

  this.typingInterval = setInterval(() => {
    if (this.currentIndex < name.length) {
      this.targetElement.textContent += name.charAt(this.currentIndex);
      this.currentIndex++;
    } else {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
  }, 80);
}

  ngOnDestroy() {
    if (this.typingInterval) clearInterval(this.typingInterval);
  }

  getFullName(): string {
    if (!this.profile) return '';
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }

  getInitials(): string {
    if (!this.profile) return 'A';
    return `${this.profile.firstName.charAt(0)}${this.profile.lastName.charAt(0)}`;
  }
}
