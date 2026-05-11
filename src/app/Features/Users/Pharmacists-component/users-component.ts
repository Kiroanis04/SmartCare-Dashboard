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
import { HttpClient } from '@angular/common/http';

export interface Pharmacist {
  position:       number;
  id:             string;
  storeId:        string;
  pharmacistName: string;
  branchName:     string;
  licenseNumber:  string;
  email:          string;
  phone:          string;
  status:         'Active' | 'Inactive' | 'On Leave';
  currentBranch:  string;
}

// ── Change Branch Dialog ──────────────────────────────────────────────────────
@Component({
  selector: 'change-branch-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatFormFieldModule, MatSelectModule, MatInputModule
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
            <span><strong>Pharmacist:</strong> {{ data.pharmacist.pharmacistName }}</span>
          </div>
          <div class="info-row">
            <mat-icon>badge</mat-icon>
            <span><strong>License:</strong> {{ data.pharmacist.licenseNumber }}</span>
          </div>
          <div class="info-row">
            <mat-icon>store</mat-icon>
            <span><strong>Current Branch:</strong> {{ data.pharmacist.currentBranch }}</span>
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
          <textarea matInput rows="3" [(ngModel)]="changeReason"
            placeholder="Enter reason for branch change..."></textarea>
        </mat-form-field>
      </div>

      <div class="dialog-footer">
        <button mat-stroked-button (click)="dialogRef.close()">Cancel</button>
        <button mat-flat-button class="change-btn"
          (click)="confirmChange()" [disabled]="!selectedNewBranch">
          <mat-icon>swap_horiz</mat-icon> Confirm Change
        </button>
      </div>
    </div>
  `,
  styles: [`
    .change-branch-dialog { width: 100%; max-width: 500px; animation: slideIn 0.3s ease; }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .dialog-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px;
      background: linear-gradient(135deg, #1a1a4e 0%, #3b3488 100%);
      color: white; border-radius: 8px 8px 0 0;
    }
    .dialog-header h2 { margin: 0; font-size: 1.5rem; }
    .close-btn { color: white; }
    .dialog-content { padding: 24px; }
    .pharmacist-info {
      background: #f8f9ff; border-radius: 12px;
      padding: 16px; margin-bottom: 24px;
    }
    .info-row {
      display: flex; align-items: center; gap: 12px;
      padding: 8px 0; border-bottom: 1px solid rgba(108,99,172,0.1);
    }
    .info-row:last-child { border-bottom: none; }
    .info-row mat-icon { color: #6c63ac; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .dialog-footer {
      padding: 16px 24px; border-top: 1px solid #e0e0e0;
      display: flex; justify-content: flex-end; gap: 12px;
    }
    .change-btn {
      background: linear-gradient(135deg, #3b3488, #6c63ac);
      color: white !important;
    }
    @media (max-width: 600px) {
      .dialog-header h2 { font-size: 1.2rem; }
      .dialog-content { padding: 16px; }
      .info-row { font-size: 0.9rem; }
    }
  `]
})
export class ChangeBranchDialog {
  selectedNewBranch = '';
  changeReason      = '';
  availableBranches: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<ChangeBranchDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { pharmacist: Pharmacist; branches: string[] }
  ) {
    this.availableBranches = data.branches.filter(b => b !== data.pharmacist.currentBranch);
  }

  confirmChange() {
    if (this.selectedNewBranch) {
      this.dialogRef.close({
        newBranch: this.selectedNewBranch,
        reason:    this.changeReason
      });
    }
  }
}

// ── Main Pharmacist Component ─────────────────────────────────────────────────
@Component({
  selector: 'app-pharmacist-component',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatExpansionModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatIconModule, MatButtonModule,
    MatChipsModule, MatDialogModule
  ],
  templateUrl: './users-component.html',
  styleUrls: ['./users-component.css']
})
export class PharmacistComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'position', 'pharmacistName', 'branchName',
    'licenseNumber', 'email', 'phone', 'status', 'action'
  ];
  dataSource = new MatTableDataSource<Pharmacist>([]);

  // Filter properties
  searchPharmacistName = '';
  selectedBranchName   = '';
  selectedStatus       = '';

  // Filter options
  BranchName:    string[] = [];
  StatusOptions: string[] = ['Active', 'Inactive', 'On Leave'];

  // Stores from API
  stores: { id: string; name: string }[] = [];

  // Original data for filtering
  private allPharmacists: Pharmacist[] = [];

  isLoading         = false;
  isChangingBranch  = false;
  errorMessage      = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog, private http: HttpClient) {
    this.loadPharmacistsData();
    this.loadStores();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // ── Load Stores ───────────────────────────────────────────────────────────
  loadStores() {
    this.http.get<any>('/api/stores').subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.stores     = response.data.map((s: any) => ({ id: s.id, name: s.name }));
          this.BranchName = this.stores.map(s => s.name);
        }
      },
      error: (err) => console.error('Failed to load stores:', err)
    });
  }

  // ── Load Pharmacists ──────────────────────────────────────────────────────
  loadPharmacistsData() {
    this.isLoading    = true;
    this.errorMessage = '';

    this.http.get<any>('/api/admin/dashboard/pharmacists').subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          const pharmacistsData: Pharmacist[] = response.data.map((item: any, index: number) => ({
            position:       index + 1,
            id:             item.id            ?? item.userId ?? '',
            storeId:        item.storeId       ?? '',
            pharmacistName: `${item.firstName} ${item.lastName}`,
            branchName:     item.storeName     ?? '',
            licenseNumber:  item.licenseNumber ?? '',
            email:          item.email         ?? '',
            phone:          item.phoneNumber   ?? '',
            status:         (item.isActive ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
            currentBranch:  item.storeName     ?? ''
          }));

          this.dataSource.data = pharmacistsData;
          this.allPharmacists  = pharmacistsData;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load pharmacists:', err);
        this.errorMessage = 'Failed to load pharmacists. Please try again.';
        this.isLoading    = false;
      }
    });
  }

  // ── Filters ───────────────────────────────────────────────────────────────
  applyFilters() {
    const filtered = this.allPharmacists.filter(p => {
      const matchSearch = !this.searchPharmacistName ||
        p.pharmacistName.toLowerCase().includes(this.searchPharmacistName.toLowerCase());
      const matchBranch = !this.selectedBranchName || p.branchName === this.selectedBranchName;
      const matchStatus = !this.selectedStatus      || p.status    === this.selectedStatus;
      return matchSearch && matchBranch && matchStatus;
    });

    this.dataSource.data = filtered.map((p, i) => ({ ...p, position: i + 1 }));
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  resetFilters() {
    this.searchPharmacistName = '';
    this.selectedBranchName   = '';
    this.selectedStatus       = '';
    this.dataSource.data      = [...this.allPharmacists];
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  // ── Change Branch ─────────────────────────────────────────────────────────
  changeBranch(pharmacist: Pharmacist) {
    const dialogRef = this.dialog.open(ChangeBranchDialog, {
      data: { pharmacist, branches: this.stores.map(s => s.name) },
      width: '90%',
      maxWidth: '500px',
      panelClass: 'change-branch-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const selectedStore = this.stores.find(s => s.name === result.newBranch);
      if (!selectedStore) return;

      const url = `/api/admin/stores/pharmacists/${pharmacist.id}/change-branch/${selectedStore.id}`;

      this.isChangingBranch = true;

      this.http.put<any>(url, {}).subscribe({
        next: (response) => {
          if (response.succeeded) {
            // Update locally
            pharmacist.branchName    = result.newBranch;
            pharmacist.currentBranch = result.newBranch;
            pharmacist.storeId       = selectedStore.id;

            // Update in allPharmacists too so filters stay consistent
            const original = this.allPharmacists.find(p => p.id === pharmacist.id);
            if (original) {
              original.branchName    = result.newBranch;
              original.currentBranch = result.newBranch;
              original.storeId       = selectedStore.id;
            }

            this.dataSource.data = [...this.dataSource.data];
            console.log(`Branch changed successfully for ${pharmacist.pharmacistName} to ${result.newBranch}`);
          }
          this.isChangingBranch = false;
        },
        error: (err) => {
          console.error('Failed to change branch:', err);
          alert('Failed to change branch. Please try again.');
          this.isChangingBranch = false;
        }
      });
    });
  }

  // ── Status Class ──────────────────────────────────────────────────────────
  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':   return 'status-active';
      case 'Inactive': return 'status-inactive';
      case 'On Leave': return 'status-leave';
      default:         return '';
    }
  }
}
