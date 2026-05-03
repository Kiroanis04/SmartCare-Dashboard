import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { DashboardService } from '../../Services/dashboard.service';
import { LowStockItem } from '../../Models/dashboard.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface StockItem {
  productName:  string;
  branchName:   string;
  storeId:      string;
  currentStock: number;
  threshold:    number;
}

export interface StoreOption {
  storeId:   string;
  storeName: string;
}

@Component({
  selector: 'app-low-stock-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule],
  templateUrl: './low-stock-table.html',
  styleUrls: ['./low-stock-table.css']
})
export class LowStockTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private destroy$ = new Subject<void>();

  showFilterPanel   = false;
  thresholdValue    = 10;
  selectedStoreId   = 'all';   // ← holds UUID or 'all'

  appliedThreshold  = 10;
  appliedStoreId    = 'all';

  storeOptions: StoreOption[] = [];

  filteredItems: StockItem[] = [];

  criticalCount = 0;
  warningCount  = 0;
  lowCount      = 0;

  totalCount      = 0;
  pageNumber      = 1;
  pageSize        = 10;
  pageSizeOptions = [5, 10, 25, 50];

  isLoading    = false;
  errorMessage = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.paginator.page
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: PageEvent) => {
        this.pageNumber = event.pageIndex + 1;
        this.pageSize   = event.pageSize;
        this.loadData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.isLoading    = true;
    this.errorMessage = '';

    this.dashboardService
      .getLowStock(this.pageNumber, this.pageSize, this.appliedThreshold, this.appliedStoreId)
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data?.items) {
            this.filteredItems = response.data.items.map((item: LowStockItem) => ({
              productName:  item.productName,
              branchName:   item.storeName,
              storeId:      item.storeId,
              currentStock: item.currentStock,
              threshold:    item.threshold
            }));

            this.totalCount = response.data.totalCount;

            // Build store dropdown using UUID as value
            const map = new Map<string, string>();
            response.data.items.forEach((item: LowStockItem) => {
              if (!map.has(item.storeId)) {
                map.set(item.storeId, item.storeName.trim());
              }
            });
            // Merge with existing options so dropdown keeps growing
            map.forEach((storeName, storeId) => {
              if (!this.storeOptions.find(s => s.storeId === storeId)) {
                this.storeOptions.push({ storeId, storeName });
              }
            });
            this.storeOptions.sort((a, b) => a.storeName.localeCompare(b.storeName));

            this.updateCounts();
          } else {
            this.errorMessage  = response.message || 'Failed to load data';
            this.filteredItems = [];
            this.totalCount    = 0;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('HTTP error:', err);
          this.errorMessage  = 'Failed to connect to the server.';
          this.isLoading     = false;
          this.filteredItems = [];
          this.totalCount    = 0;
        }
      });
  }

  applyFilters(): void {
    this.appliedThreshold = this.thresholdValue > 0 ? this.thresholdValue : 10;
    this.appliedStoreId   = this.selectedStoreId;
    this.pageNumber       = 1;
    if (this.paginator) this.paginator.firstPage();
    this.loadData();
  }

  resetFilters(): void {
    this.thresholdValue   = 10;
    this.selectedStoreId  = 'all';
    this.appliedThreshold = 10;
    this.appliedStoreId   = 'all';
    this.pageNumber       = 1;
    if (this.paginator) this.paginator.firstPage();
    this.loadData();
  }

  updateCounts(): void {
    this.criticalCount = this.filteredItems.filter(i => i.currentStock === 0).length;
    this.warningCount  = this.filteredItems.filter(i => i.currentStock > 0 && i.currentStock <= 3).length;
    this.lowCount      = this.filteredItems.filter(i => i.currentStock > 3).length;
  }

  getStatusText(stock: number): string {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 3)  return 'Critical';
    if (stock <= 5)  return 'Warning';
    return 'Low';
  }

  toggleFilterPanel(): void { this.showFilterPanel = !this.showFilterPanel; }
  onThresholdChange(): void { /* wait for Apply */ }
  onBranchChange():   void { /* wait for Apply */ }
}
