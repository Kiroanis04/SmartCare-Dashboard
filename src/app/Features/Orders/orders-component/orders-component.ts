// orders-component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, debounceTime, distinctUntilChanged, finalize, takeUntil } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
}

interface OrderStatusLookup {
  value: number;
  displayName: string;
}

interface OrderTypeLookup {
  value: number;
  displayName: string;
}

interface OrderItem {
  id: string;
  clientName: string;
  status: number;                // numeric status
  deliveryFees: number | null;
  createdAt: string;
  totalPrice: number;
  store: Store | null;
  address: any;                  // address object or null
  orderItems?: any[];
}

interface OrdersResponse {
  succeeded: boolean;
  message: string | null;
  errorsBag: any;
  data: {
    items: OrderItem[];
    totalCount: number;
    pageSize: number;
    pageNumber: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orders-component.html',
  styleUrls: ['./orders-component.css']
})
export class OrdersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private apiBase = 'https://smartcarepharmacy.tryasp.net/api';

  stores: Store[] = [];
  selectedStoreId: string | null = 'all';   // 'all' means all branches
  orders: OrderItem[] = [];
  orderStatuses: OrderStatusLookup[] = [];
  orderTypes: OrderTypeLookup[] = [];

  loadingStores = false;
  loadingOrders = false;
  errorMessage: string | null = null;

  currentPage = 1;
  pageSize = 12;
  totalOrders = 0;
  totalPages = 0;

  filterForm: FormGroup;
  private clientNameSubject = new Subject<string>();

  // Modal
  selectedOrder: OrderItem | null = null;
  showModal = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      clientName: [''],
      orderStatus: [''],
      orderType: [''],
      fromDate: [this.getDefaultFromDate()],
      toDate: [this.getDefaultToDate()]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupClientNameDebounce();
    this.setupFilterAutoReload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.loadStores();
    this.loadOrderStatuses();
    this.loadOrderTypes();
  }

  private loadStores(): void {
    this.loadingStores = true;
    this.errorMessage = null;
    this.http.get<{ succeeded: boolean; data: Store[] }>(`${this.apiBase}/stores`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingStores = false),
        catchError(err => {
          this.errorMessage = 'Failed to load stores. Please try again.';
          console.error(err);
          return of({ succeeded: false, data: [] });
        })
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.stores = response.data;
            // If we have stores and no store selected, default to 'all'
            if (this.stores.length > 0 && this.selectedStoreId === null) {
              this.selectedStoreId = 'all';
              this.loadOrders();
            }
          } else {
            this.errorMessage = 'No stores data received.';
          }
        },
        error: () => {
          this.errorMessage = 'Error loading stores.';
        }
      });
  }

  private loadOrderStatuses(): void {
    this.http.get<OrderStatusLookup[]>(`${this.apiBase}/lookups/order-statues`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.orderStatuses = data || [],
        error: (err) => console.error('Failed to load order statues', err)
      });
  }

  private loadOrderTypes(): void {
    this.http.get<OrderTypeLookup[]>(`${this.apiBase}/lookups/order-Types`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.orderTypes = data || [],
        error: (err) => console.error('Failed to load order types', err)
      });
  }

  // Get status display name from numeric value
  getStatusDisplayName(statusValue: number): string {
    const found = this.orderStatuses.find(s => s.value === statusValue);
    return found ? found.displayName : 'Unknown';
  }

  loadOrders(): void {
    this.loadingOrders = true;
    this.errorMessage = null;

    const params = this.buildRequestParams();

    this.http.get<OrdersResponse>(`${this.apiBase}/admin/orders/with-details`, { params })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingOrders = false),
        catchError(err => {
          this.errorMessage = 'Failed to load orders. Please check filters and try again.';
          console.error(err);
          const fallback: OrdersResponse = {
            succeeded: false,
            message: 'Network or server error',
            errorsBag: null,
            data: {
              items: [],
              totalCount: 0,
              pageSize: this.pageSize,
              pageNumber: 1,
              totalPages: 0,
              hasNext: false,
              hasPrevious: false
            }
          };
          return of(fallback);
        })
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.orders = response.data.items || [];
            this.totalOrders = response.data.totalCount;
            this.currentPage = response.data.pageNumber || 1;
            this.totalPages = response.data.totalPages || 0;
          } else {
            this.orders = [];
            this.totalOrders = 0;
            this.totalPages = 0;
            if (response.message) this.errorMessage = response.message;
          }
        }
      });
  }

  private buildRequestParams(): any {
    const params: any = {
      PageSize: this.pageSize,
      PageNumber: this.currentPage,
    };

    // Only add BranchId if a specific store is selected (not 'all')
    if (this.selectedStoreId && this.selectedStoreId !== 'all') {
      params.BranchId = this.selectedStoreId;
    }

    const clientName = this.filterForm.get('clientName')?.value?.trim();
    if (clientName) params.ClientName = clientName;

    const orderStatus = this.filterForm.get('orderStatus')?.value;
    if (orderStatus) params.OrderStatus = orderStatus;

    const orderType = this.filterForm.get('orderType')?.value;
    if (orderType !== undefined && orderType !== null && orderType !== '') {
      params.OrderType = orderType;
    }

    const fromDate = this.filterForm.get('fromDate')?.value;
    const toDate = this.filterForm.get('toDate')?.value;
    if (fromDate) params.FromDate = fromDate;
    if (toDate) params.ToDate = toDate;

    return params;
  }

  onStoreChange(storeId: string): void {
    this.selectedStoreId = storeId;
    this.resetPagination();
    this.loadOrders();
  }

  applyFilters(): void {
    this.resetPagination();
    this.loadOrders();
  }

  resetFilters(): void {
    this.filterForm.patchValue({
      clientName: '',
      orderStatus: '',
      orderType: '',
      fromDate: this.getDefaultFromDate(),
      toDate: this.getDefaultToDate()
    });
    this.resetPagination();
    this.loadOrders();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadOrders();
  }

  private resetPagination(): void {
    this.currentPage = 1;
  }

  private getDefaultFromDate(): string {
    const date = new Date();
    date.setDate(1);
    return this.formatDate(date);
  }

  private getDefaultToDate(): string {
    return this.formatDate(new Date());
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getOrderTypeDisplay(deliveryFees: number | null): string {
    // deliveryFees === 0 => InStore, else (null or any other) => Online
    return deliveryFees === 0 ? 'InStore' : 'Online';
  }

  // For status badge CSS class, map display name to class
  getStatusClass(statusValue: number): string {
    const displayName = this.getStatusDisplayName(statusValue);
    const mapping: { [key: string]: string } = {
      'Pending': 'pending',
      'Processing': 'processing',
      'Shipped': 'shipped',
      'Completed': 'completed',
      'Cancelled': 'cancelled',
      'Confirmed': 'confirmed',
      'Returned': 'returned',
      'PaymentFailed': 'payment-failed',
      'Expired': 'expired',
      'Refunded': 'refunded',
      'WaitingForPickup': 'waiting-pickup',
      'Ready_To_Ship': 'ready-to-ship',
      'DELIVERY_ACCEPTED': 'delivery-accepted'
    };
    return mapping[displayName] || 'default-status';
  }

  getPaginationPages(): (number | string)[] {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = this.currentPage - delta;
    const right = this.currentPage + delta;
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages || (i >= left && i <= right)) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  }

  private setupClientNameDebounce(): void {
    this.clientNameSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.resetPagination();
      this.loadOrders();
    });
  }

  onClientNameInput(): void {
    this.clientNameSubject.next(this.filterForm.get('clientName')?.value);
  }

  private setupFilterAutoReload(): void {
    this.filterForm.get('orderStatus')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetPagination();
        this.loadOrders();
      });

    this.filterForm.get('orderType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetPagination();
        this.loadOrders();
      });

    this.filterForm.get('fromDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetPagination();
        this.loadOrders();
      });

    this.filterForm.get('toDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetPagination();
        this.loadOrders();
      });
  }

  // Modal methods
  openOrderDetails(order: OrderItem): void {
    this.selectedOrder = order;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedOrder = null;
    document.body.style.overflow = '';
  }

  printOrder(): void {
    const printContent = document.getElementById('order-print-content');
    if (!printContent) return;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // to restore event listeners
  }
}
