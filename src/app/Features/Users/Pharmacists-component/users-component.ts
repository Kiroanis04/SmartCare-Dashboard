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
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface Pharmacist {
  position: number;
  pharmacistName: string;
  branchName: string;
  licenseNumber: string;
  email: string;
  phone: string;
  joinDate: Date;
  status: 'Active' | 'Inactive' | 'On Leave';
  currentBranch: string;
}

// Change Branch Dialog Component
@Component({
  selector: 'change-branch-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  template: `
    <div class="change-branch-dialog">
      <div class="dialog-header">
        <h2>Change Branch</h2>
        <button mat-icon-button class="close-btn" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <div class="pharmacist-info">
          <div class="info-row">
            <mat-icon>person</mat-icon>
            <span><strong>Pharmacist:</strong> {{ data.pharmacistName }}</span>
          </div>
          <div class="info-row">
            <mat-icon>badge</mat-icon>
            <span><strong>License:</strong> {{ data.licenseNumber }}</span>
          </div>
          <div class="info-row">
            <mat-icon>store</mat-icon>
            <span><strong>Current Branch:</strong> {{ data.currentBranch }}</span>
          </div>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Select New Branch</mat-label>
          <mat-select [(ngModel)]="selectedNewBranch">
            @for (branch of availableBranches; track branch) {
              <mat-option [value]="branch">{{ branch }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Reason for Change (Optional)</mat-label>
          <textarea matInput rows="3" [(ngModel)]="changeReason" placeholder="Enter reason for branch change..."></textarea>
        </mat-form-field>
      </div>

      <div class="dialog-footer">
        <button mat-stroked-button (click)="dialogRef.close()">Cancel</button>
        <button mat-flat-button class="change-btn" (click)="confirmChange()" [disabled]="!selectedNewBranch">
          <mat-icon>swap_horiz</mat-icon> Confirm Change
        </button>
      </div>
    </div>
  `,
  styles: [`
    .change-branch-dialog {
      width: 100%;
      max-width: 500px;
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
    }

    .pharmacist-info {
      background: #f8f9ff;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(108, 99, 172, 0.1);
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-row mat-icon {
      color: #6c63ac;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .dialog-footer {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .change-btn {
      background: linear-gradient(135deg, #3b3488, #6c63ac);
      color: white;
    }

    .change-btn:hover {
      transform: translateY(-2px);
    }

    @media (max-width: 600px) {
      .dialog-header h2 {
        font-size: 1.2rem;
      }

      .dialog-content {
        padding: 16px;
      }

      .info-row {
        font-size: 0.9rem;
      }
    }
  `]
})
export class ChangeBranchDialog {
  selectedNewBranch: string = '';
  changeReason: string = '';
  availableBranches: string[] = [
    'Cairo Branch',
    'Alex Branch',
    'Giza Branch',
    'Port Said',
    'Ismailia',
    'Luxor Branch',
    'Mansoura Branch',
    'Aswan Branch'
  ];

  constructor(
    public dialogRef: MatDialogRef<ChangeBranchDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Pharmacist
  ) {}

  confirmChange() {
    if (this.selectedNewBranch) {
      this.dialogRef.close({
        newBranch: this.selectedNewBranch,
        reason: this.changeReason
      });
    }
  }
}

// Main Pharmacist Component
@Component({
  selector: 'app-pharmacist-component',
  standalone: true,
  imports: [
    CommonModule,
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
    MatDialogModule
  ],
  templateUrl: './users-component.html',
  styleUrls: ['./users-component.css']
})
export class PharmacistComponent implements AfterViewInit {
  displayedColumns: string[] = ['position', 'pharmacistName', 'branchName', 'licenseNumber', 'email', 'phone', 'status', 'action'];
  dataSource = new MatTableDataSource<Pharmacist>([]);

  // Filter properties
  searchPharmacistName = '';
  selectedBranchName = '';
  selectedStatus = '';

  // Filter options
  BranchName: string[] = [];
  StatusOptions: string[] = ['Active', 'Inactive', 'On Leave'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog) {
    this.loadPharmacistsData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadPharmacistsData() {
    const pharmacistsData: Pharmacist[] = [
      {
        position: 1,
        pharmacistName: 'Dr. Ahmed Hassan',
        branchName: 'Cairo Branch',
        licenseNumber: 'PH-2024-001',
        email: 'ahmed.hassan@smartcare.com',
        phone: '+201234567890',
        joinDate: new Date(2023, 5, 15),
        status: 'Active',
        currentBranch: 'Cairo Branch'
      },
      {
        position: 2,
        pharmacistName: 'Dr. Sara Mahmoud',
        branchName: 'Alex Branch',
        licenseNumber: 'PH-2024-002',
        email: 'sara.mahmoud@smartcare.com',
        phone: '+201234567891',
        joinDate: new Date(2023, 6, 20),
        status: 'Active',
        currentBranch: 'Alex Branch'
      },
      {
        position: 3,
        pharmacistName: 'Dr. Mohamed Ali',
        branchName: 'Giza Branch',
        licenseNumber: 'PH-2024-003',
        email: 'mohamed.ali@smartcare.com',
        phone: '+201234567892',
        joinDate: new Date(2023, 7, 10),
        status: 'Active',
        currentBranch: 'Giza Branch'
      },
      {
        position: 4,
        pharmacistName: 'Dr. Nour El-Din',
        branchName: 'Port Said',
        licenseNumber: 'PH-2024-004',
        email: 'nour.eldin@smartcare.com',
        phone: '+201234567893',
        joinDate: new Date(2023, 8, 5),
        status: 'On Leave',
        currentBranch: 'Port Said'
      },
      {
        position: 5,
        pharmacistName: 'Dr. Hana Youssef',
        branchName: 'Ismailia',
        licenseNumber: 'PH-2024-005',
        email: 'hana.youssef@smartcare.com',
        phone: '+201234567894',
        joinDate: new Date(2023, 9, 12),
        status: 'Active',
        currentBranch: 'Ismailia'
      },
      {
        position: 6,
        pharmacistName: 'Dr. Karim Samir',
        branchName: 'Luxor Branch',
        licenseNumber: 'PH-2024-006',
        email: 'karim.samir@smartcare.com',
        phone: '+201234567895',
        joinDate: new Date(2023, 10, 18),
        status: 'Inactive',
        currentBranch: 'Luxor Branch'
      },
      {
        position: 7,
        pharmacistName: 'Dr. Laila Ibrahim',
        branchName: 'Cairo Branch',
        licenseNumber: 'PH-2024-007',
        email: 'laila.ibrahim@smartcare.com',
        phone: '+201234567896',
        joinDate: new Date(2023, 11, 22),
        status: 'Active',
        currentBranch: 'Cairo Branch'
      },
      {
        position: 8,
        pharmacistName: 'Dr. Omar Farouk',
        branchName: 'Alex Branch',
        licenseNumber: 'PH-2024-008',
        email: 'omar.farouk@smartcare.com',
        phone: '+201234567897',
        joinDate: new Date(2024, 0, 8),
        status: 'Active',
        currentBranch: 'Alex Branch'
      },
      {
        position: 9,
        pharmacistName: 'Dr. Yasmine Adel',
        branchName: 'Mansoura Branch',
        licenseNumber: 'PH-2024-009',
        email: 'yasmine.adel@smartcare.com',
        phone: '+201234567898',
        joinDate: new Date(2024, 1, 14),
        status: 'Active',
        currentBranch: 'Mansoura Branch'
      },
      {
        position: 10,
        pharmacistName: 'Dr. Khaled Mostafa',
        branchName: 'Aswan Branch',
        licenseNumber: 'PH-2024-010',
        email: 'khaled.mostafa@smartcare.com',
        phone: '+201234567899',
        joinDate: new Date(2024, 2, 20),
        status: 'On Leave',
        currentBranch: 'Aswan Branch'
      },
      {
        position: 11,
        pharmacistName: 'Dr. Reem Abdelrahman',
        branchName: 'Cairo Branch',
        licenseNumber: 'PH-2024-011',
        email: 'reem.abdelrahman@smartcare.com',
        phone: '+201234567900',
        joinDate: new Date(2024, 3, 5),
        status: 'Active',
        currentBranch: 'Cairo Branch'
      },
      {
        position: 12,
        pharmacistName: 'Dr. Tamer Said',
        branchName: 'Giza Branch',
        licenseNumber: 'PH-2024-012',
        email: 'tamer.said@smartcare.com',
        phone: '+201234567901',
        joinDate: new Date(2024, 4, 10),
        status: 'Active',
        currentBranch: 'Giza Branch'
      }
    ];

    this.dataSource.data = pharmacistsData;

    // Extract filter options
    this.BranchName = [...new Set(pharmacistsData.map(p => p.branchName))];
  }

  applyFilters() {
    const filtered = this.dataSource.data.filter(p => {
      const matchSearch = !this.searchPharmacistName ||
        p.pharmacistName.toLowerCase().includes(this.searchPharmacistName.toLowerCase());
      const matchBranch = !this.selectedBranchName || p.branchName === this.selectedBranchName;
      const matchStatus = !this.selectedStatus || p.status === this.selectedStatus;

      return matchSearch && matchBranch && matchStatus;
    });

    this.dataSource.data = filtered.map((p, i) => ({ ...p, position: i + 1 }));
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  resetFilters() {
    this.searchPharmacistName = '';
    this.selectedBranchName = '';
    this.selectedStatus = '';
    this.loadPharmacistsData();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  changeBranch(pharmacist: Pharmacist) {
    const dialogRef = this.dialog.open(ChangeBranchDialog, {
      data: pharmacist,
      width: '90%',
      maxWidth: '500px',
      panelClass: 'change-branch-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the pharmacist's branch
        pharmacist.branchName = result.newBranch;
        pharmacist.currentBranch = result.newBranch;

        // You can also save the change reason to a backend if needed
        console.log(`Branch changed for ${pharmacist.pharmacistName} to ${result.newBranch}. Reason: ${result.reason}`);

        // Refresh the table
        this.dataSource.data = [...this.dataSource.data];

        // Show success message (you can implement a toast notification)
        alert(`Branch changed successfully for ${pharmacist.pharmacistName} to ${result.newBranch}`);
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
      case 'On Leave': return 'status-leave';
      default: return '';
    }
  }
}
