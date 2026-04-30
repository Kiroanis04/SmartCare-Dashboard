import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminProfile } from '../../Models/dashboard.model';

@Component({
  selector: 'app-adminprofile',
  standalone: true,
  imports: [CommonModule],  
  templateUrl: './adminprofile.html',
  styleUrls: ['./adminprofile.css']
})
export class Adminprofile implements AfterViewInit, OnDestroy {
  @ViewChild('usernameSpan') usernameSpan!: ElementRef<HTMLSpanElement>;
  @Input() profile!: AdminProfile;  // ← Add this Input property

  private currentIndex: number = 0;
  private typingInterval: any = null;
  private targetElement!: HTMLSpanElement;

  ngAfterViewInit() {
    if (this.profile && this.usernameSpan) {
      this.targetElement = this.usernameSpan.nativeElement;
      this.startTypewriterAnimation();
    }
  }

  startTypewriterAnimation() {
    if (!this.targetElement || !this.profile) return;

    if (this.typingInterval) clearInterval(this.typingInterval);

    this.targetElement.textContent = '';
    this.currentIndex = 0;
    const username = this.profile.username;

    this.typingInterval = setInterval(() => {
      if (this.currentIndex < username.length) {
        this.targetElement.textContent += username.charAt(this.currentIndex);
        this.currentIndex++;
      } else {
        clearInterval(this.typingInterval);
        this.typingInterval = null;
      }
    }, 80);
  }

  ngOnDestroy() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }
}
