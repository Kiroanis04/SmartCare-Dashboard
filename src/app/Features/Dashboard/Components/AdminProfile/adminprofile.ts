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
  isLoading = true;
  errorMessage = '';

  private animationCompleted = false;
  private currentIndex = 0;
  private typingInterval: any = null;
  private viewInitialized = false;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadAdminProfile();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    if (this.profile && this.usernameSpan) {
      this.startTypewriterAnimation();
    }
  }

  loadAdminProfile(): void {
    this.animationCompleted = false;
    this.isLoading = true;
    this.dashboardService.getAdminProfile().subscribe({
      next: (response: AdminProfileApiResponse) => {
        if (response.succeeded && response.data) {
          this.profile = {
            id: response.data.id,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            userName: response.data.userName,
            email: response.data.email,
            role: 'Administrator',
            avatar: `https://ui-avatars.com/api/?background=6c63ac&color=fff&rounded=true&size=80&bold=true&name=${response.data.firstName}+${response.data.lastName}&length=2`
          };
        } else {
          this.setDefaultProfile();
        }
        this.isLoading = false;
        this.tryStartTyping();
      },
      error: () => {
        this.setDefaultProfile();
        this.isLoading = false;
        this.tryStartTyping();
      }
    });
  }

  setDefaultProfile(): void {
    this.profile = {
      id: 'default',
      firstName: 'Admin',
      lastName: 'User',
      userName: 'Admin User',
      email: 'admin@smartcare.com',
      role: 'Administrator',
      avatar: 'https://ui-avatars.com/api/?background=6c63ac&color=fff&rounded=true&size=80&bold=true&name=Admin+User&length=2'
    };
  }

 private tryStartTyping(): void {
  if (this.viewInitialized && this.profile && this.usernameSpan && !this.animationCompleted) {
    setTimeout(() => {
      this.targetElement = this.usernameSpan.nativeElement;
      this.startTypewriterAnimation();
      this.animationCompleted = true;
    }, 500);
  }
}

  private targetElement!: HTMLSpanElement;

  startTypewriterAnimation(): void {
    if (!this.targetElement || !this.profile) return;
    if (this.typingInterval) clearInterval(this.typingInterval);

    this.targetElement.textContent = '';
    this.currentIndex = 0;
    const name = this.profile.firstName ?? this.profile.userName;

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

  ngOnDestroy(): void {
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
