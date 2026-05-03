import { AfterViewInit, Component, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';

export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Orders {
  position: number;
  ClientName: string;
  price: number;
  BranchName: string;
  OrderType: string;
  Orderstatus: string;
  date: Date;
  orderId: string;
  items: OrderItem[];
  totalItems: number;
  paymentMethod: string;
}

// Order Details Dialog Component
@Component({
  selector: 'order-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="order-dialog-container">
      <div class="dialog-header">
        <h2>Order Details</h2>
        <button mat-icon-button class="close-btn" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <!-- Order Info -->
        <div class="info-section">
          <h3>Order Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Order ID:</span>
              <span class="value">{{ data.orderId }}</span>
            </div>
            <div class="info-item">
              <span class="label">Client Name:</span>
              <span class="value">{{ data.ClientName }}</span>
            </div>
            <div class="info-item">
              <span class="label">Date:</span>
              <span class="value">{{ data.date | date:'medium' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Branch:</span>
              <span class="value">{{ data.BranchName }}</span>
            </div>
            <div class="info-item">
              <span class="label">Order Type:</span>
              <span class="value">{{ data.OrderType }}</span>
            </div>
            <div class="info-item">
              <span class="label">Status:</span>
              <span class="status-badge" [class]="data.Orderstatus.toLowerCase()">
                {{ data.Orderstatus }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Payment Method:</span>
              <span class="value">{{ data.paymentMethod }}</span>
            </div>
            <div class="info-item">
              <span class="label">Total Items:</span>
              <span class="value">{{ data.totalItems }}</span>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="items-section">
          <h3>Order Items</h3>
          <div class="items-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                @for (item of data.items; track item.productName) {
                  <tr>
                    <td class="product-name">{{ item.productName }}</td>
                    <td class="quantity">{{ item.quantity }}</td>
                    <td class="price">EGP {{ item.price.toFixed(2) }}</td>
                    <td class="total">EGP {{ item.total.toFixed(2) }}</td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr class="grand-total-row">
                  <td colspan="3"><strong>Grand Total</strong></td>
                  <td class="grand-total"><strong>EGP {{ data.price.toFixed(2) }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button mat-stroked-button (click)="dialogRef.close()">Close</button>
        <button mat-flat-button class="print-btn" (click)="printOrder()">
          <mat-icon>print</mat-icon> Print Order
        </button>
      </div>
    </div>
  `,
  styles: [`
    .order-dialog-container {
      max-width: 800px;
      width: 100%;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: linear-gradient(135deg, #1a1a4e 0%, #3b3488 100%);
      color: white;
      border-radius: 8px 8px 0 0;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .close-btn {
      color: white;
    }

    .dialog-content {
      padding: 24px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .info-section {
      margin-bottom: 24px;
    }

    .info-section h3, .items-section h3 {
      color: #1a1a4e;
      margin-bottom: 16px;
      font-size: 1.2rem;
      border-left: 4px solid #6c63ac;
      padding-left: 12px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f8f9ff;
      border-radius: 8px;
      transition: transform 0.2s;
    }

    .info-item:hover {
      transform: translateX(4px);
    }

    .info-item .label {
      font-weight: 600;
      color: #666;
    }

    .info-item .value {
      color: #1a1a4e;
      font-weight: 500;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .status-badge.delivered {
      background: #e8f5e9;
      color: #4caf50;
    }

    .status-badge.pending {
      background: #fff3e0;
      color: #ff9800;
    }

    .status-badge.shipped {
      background: #e3f2fd;
      color: #2196f3;
    }

    .items-table {
      overflow-x: auto;
    }

    .items-table table {
      width: 100%;
      border-collapse: collapse;
    }

    .items-table th,
    .items-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    .items-table th {
      background: #f0f2ff;
      color: #1a1a4e;
      font-weight: 600;
    }

    .items-table td.product-name {
      font-weight: 500;
      color: #2d2b6b;
    }

    .items-table td.quantity,
    .items-table td.price,
    .items-table td.total {
      color: #3b3488;
    }

    .grand-total-row {
      background: linear-gradient(135deg, #f0f2ff, #f8f9ff);
    }

    .grand-total {
      font-size: 1.1rem;
      color: #6c63ac;
    }

    .dialog-footer {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .print-btn {
      background: linear-gradient(135deg, #3b3488, #6c63ac);
      color: white;
    }

    .print-btn:hover {
      transform: translateY(-2px);
    }

    @media (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .dialog-content {
        padding: 16px;
      }

      .items-table th,
      .items-table td {
        padding: 8px;
        font-size: 0.85rem;
      }

      .dialog-header h2 {
        font-size: 1.2rem;
      }
    }
  `]
})
export class OrderDetailsDialog {
  constructor(
    public dialogRef: MatDialogRef<OrderDetailsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Orders
  ) {}

  printOrder() {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Order ${this.data.orderId}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .info { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
              .total { font-weight: bold; margin-top: 20px; text-align: right; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Order Details</h1>
              <p>Order ID: ${this.data.orderId}</p>
            </div>
            <div class="info">
              <p><strong>Client:</strong> ${this.data.ClientName}</p>
              <p><strong>Date:</strong> ${new Date(this.data.date).toLocaleString()}</p>
              <p><strong>Branch:</strong> ${this.data.BranchName}</p>
              <p><strong>Status:</strong> ${this.data.Orderstatus}</p>
            </div>
            <table>
              <thead>
                <tr><th>Product</th><th>Quantity</th><th>Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${this.data.items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>EGP ${item.price.toFixed(2)}</td>
                    <td>EGP ${item.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">
              <h3>Grand Total: EGP ${this.data.price.toFixed(2)}</h3>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }
}

// Main Orders Component
@Component({
  selector: 'app-orders-component',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './orders-component.html',
  styleUrls: ['./orders-component.css']
})
export class OrdersComponent implements AfterViewInit {
  displayedColumns: string[] = ['position', 'ClientName', 'price', 'Orderstatus', 'BranchName', 'OrderType', 'date'];
  dataSource = new MatTableDataSource<Orders>([]);

  // Filter properties
  searchClientName = '';
  selectedOrderType = '';
  selectedOrderStatus = '';
  selectedBranchName = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Filter options
  OrderType: string[] = [];
  OrderStatus: string[] = [];
  BranchName: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog) {
    this.loadOrdersData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadOrdersData() {
    const ordersData: Orders[] = [
      {
        position: 1,
        ClientName: 'John Smith',
        price: 156.50,
        BranchName: 'Cairo Branch',
        OrderType: 'Online',
        Orderstatus: 'Delivered',
        date: new Date(2024, 0, 15),
        orderId: 'ORD-001',
        totalItems: 3,
        paymentMethod: 'Credit Card',
        items: [
          { productName: 'Paracetamol 500mg', quantity: 2, price: 12.50, total: 25.00 },
          { productName: 'Vitamin C 1000mg', quantity: 1, price: 22.00, total: 22.00 },
          { productName: 'Bandage Roll', quantity: 3, price: 8.00, total: 24.00 }
        ]
      },
      {
        position: 2,
        ClientName: 'Sarah Johnson',
        price: 89.75,
        BranchName: 'Alex Branch',
        OrderType: 'Walk-in',
        Orderstatus: 'Pending',
        date: new Date(2024, 0, 16),
        orderId: 'ORD-002',
        totalItems: 2,
        paymentMethod: 'Cash',
        items: [
          { productName: 'Ibuprofen 400mg', quantity: 1, price: 18.00, total: 18.00 },
          { productName: 'Antiseptic Cream', quantity: 2, price: 13.00, total: 26.00 }
        ]
      },
      {
        position: 3,
        ClientName: 'Michael Brown',
        price: 405.00,
        BranchName: 'Giza Branch',
        OrderType: 'Online',
        Orderstatus: 'Shipped',
        date: new Date(2024, 0, 17),
        orderId: 'ORD-003',
        totalItems: 2,
        paymentMethod: 'PayPal',
        items: [
          { productName: 'Blood Pressure Monitor', quantity: 1, price: 320.00, total: 320.00 },
          { productName: 'Digital Thermometer', quantity: 1, price: 85.00, total: 85.00 }
        ]
      },
      {
        position: 4,
        ClientName: 'Emily Davis',
        price: 45.00,
        BranchName: 'Cairo Branch',
        OrderType: 'Walk-in',
        Orderstatus: 'Delivered',
        date: new Date(2024, 0, 18),
        orderId: 'ORD-004',
        totalItems: 1,
        paymentMethod: 'Credit Card',
        items: [
          { productName: 'Omega-3 Fish Oil', quantity: 1, price: 45.00, total: 45.00 }
        ]
      },
      {
        position: 5,
        ClientName: 'David Wilson',
        price: 91.00,
        BranchName: 'Alex Branch',
        OrderType: 'Online',
        Orderstatus: 'Pending',
        date: new Date(2024, 0, 19),
        orderId: 'ORD-005',
        totalItems: 3,
        paymentMethod: 'Bank Transfer',
        items: [
          { productName: 'Amoxicillin 250mg', quantity: 2, price: 35.75, total: 71.50 },
          { productName: 'Cough Syrup', quantity: 1, price: 19.50, total: 19.50 }
        ]
      },
      {
        position: 6,
        ClientName: 'Lisa Anderson',
        price: 59.50,
        BranchName: 'Giza Branch',
        OrderType: 'Online',
        Orderstatus: 'Shipped',
        date: new Date(2024, 0, 20),
        orderId: 'ORD-006',
        totalItems: 3,
        paymentMethod: 'Credit Card',
        items: [
          { productName: 'Nasal Spray', quantity: 1, price: 24.00, total: 24.00 },
          { productName: 'Eye Drops', quantity: 2, price: 17.75, total: 35.50 }
        ]
      },
      {
        position: 7,
        ClientName: 'Robert Taylor',
        price: 90.00,
        BranchName: 'Cairo Branch',
        OrderType: 'Walk-in',
        Orderstatus: 'Delivered',
        date: new Date(2024, 0, 21),
        orderId: 'ORD-007',
        totalItems: 2,
        paymentMethod: 'Cash',
        items: [
          { productName: 'Zinc Supplement', quantity: 1, price: 30.00, total: 30.00 },
          { productName: 'Probiotic Capsules', quantity: 1, price: 60.00, total: 60.00 }
        ]
      },
      {
        position: 8,
        ClientName: 'Maria Garcia',
        price: 171.00,
        BranchName: 'Alex Branch',
        OrderType: 'Online',
        Orderstatus: 'Pending',
        date: new Date(2024, 0, 22),
        orderId: 'ORD-008',
        totalItems: 12,
        paymentMethod: 'PayPal',
        items: [
          { productName: 'Melatonin 5mg', quantity: 2, price: 38.00, total: 76.00 },
          { productName: 'Insulin Syringe', quantity: 10, price: 9.50, total: 95.00 }
        ]
      },
      {
        position: 9,
        ClientName: 'James Martinez',
        price: 55.00,
        BranchName: 'Giza Branch',
        OrderType: 'Walk-in',
        Orderstatus: 'Delivered',
        date: new Date(2024, 0, 23),
        orderId: 'ORD-009',
        totalItems: 1,
        paymentMethod: 'Credit Card',
        items: [
          { productName: 'Glucose Test Strips', quantity: 1, price: 55.00, total: 55.00 }
        ]
      },
      {
        position: 10,
        ClientName: 'Patricia Brown',
        price: 98.00,
        BranchName: 'Cairo Branch',
        OrderType: 'Online',
        Orderstatus: 'Shipped',
        date: new Date(2024, 0, 24),
        orderId: 'ORD-010',
        totalItems: 3,
        paymentMethod: 'Bank Transfer',
        items: [
          { productName: 'Surgical Mask x50', quantity: 2, price: 28.00, total: 56.00 },
          { productName: 'Nitrile Gloves', quantity: 1, price: 42.00, total: 42.00 }
        ]
      },
      {
        position: 11,
        ClientName: 'Jennifer Lee',
        price: 120.00,
        BranchName: 'Cairo Branch',
        OrderType: 'Online',
        Orderstatus: 'Delivered',
        date: new Date(2024, 0, 25),
        orderId: 'ORD-011',
        totalItems: 4,
        paymentMethod: 'Credit Card',
        items: [
          { productName: 'Vitamin B12 Supplement', quantity: 2, price: 35.00, total: 70.00 },
          { productName: 'Calcium Tablets', quantity: 1, price: 50.00, total: 50.00 }
        ]
      },
      {
        position: 12,
        ClientName: 'Thomas White',
        price: 200.00,
        BranchName: 'Alex Branch',
        OrderType: 'Walk-in',
        Orderstatus: 'Pending',
        date: new Date(2024, 0, 26),
        orderId: 'ORD-012',
        totalItems: 5,
        paymentMethod: 'Cash',
        items: [
          { productName: 'First Aid Kit', quantity: 1, price: 200.00, total: 200.00 }
        ]
      }
    ];

    this.dataSource.data = ordersData;

    // Extract filter options
    this.OrderType = [...new Set(ordersData.map(p => p.OrderType))];
    this.OrderStatus = [...new Set(ordersData.map(p => p.Orderstatus))];
    this.BranchName = [...new Set(ordersData.map(p => p.BranchName))];
  }

  applyFilters() {
    const filtered = this.dataSource.data.filter(p => {
      const matchSearch = !this.searchClientName ||
        p.ClientName.toLowerCase().includes(this.searchClientName.toLowerCase());
      const matchOrderType = !this.selectedOrderType || p.OrderType === this.selectedOrderType;
      const matchOrderStatus = !this.selectedOrderStatus || p.Orderstatus === this.selectedOrderStatus;
      const matchBranchName = !this.selectedBranchName || p.BranchName === this.selectedBranchName;

      // Date range filter
      let matchDate = true;
      if (this.startDate && p.date) {
        matchDate = matchDate && p.date >= this.startDate;
      }
      if (this.endDate && p.date) {
        const endOfDay = new Date(this.endDate);
        endOfDay.setHours(23, 59, 59);
        matchDate = matchDate && p.date <= endOfDay;
      }

      return matchSearch && matchOrderType && matchOrderStatus && matchBranchName && matchDate;
    });

    this.dataSource.data = filtered.map((p, i) => ({ ...p, position: i + 1 }));
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  resetFilters() {
    this.searchClientName = '';
    this.selectedBranchName = '';
    this.selectedOrderStatus = '';
    this.selectedOrderType = '';
    this.startDate = null;
    this.endDate = null;
    this.loadOrdersData();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  viewOrderDetails(order: Orders) {
    this.dialog.open(OrderDetailsDialog, {
      data: order,
      width: '90%',
      maxWidth: '800px',
      panelClass: 'order-dialog-panel'
    });
  }
}
