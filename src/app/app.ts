import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from "./Features/Dashboard/dashboard";
import { DonutChartComponent } from "./Features/Dashboard/Components/category-distribution-chart/category-distribution-chart";
import { Sidebar } from "./Shared/Components/sidebar/sidebar";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar],
  template: `<app-dashboard></app-dashboard>`,
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'SmartCare-Dashboard';
}
