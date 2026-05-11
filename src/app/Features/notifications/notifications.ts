import {
  Component, OnInit, ViewChild,
  AfterViewInit, ChangeDetectorRef, OnDestroy
} from '@angular/core';
import { CommonModule }                          from '@angular/common';
import { FormsModule }                           from '@angular/forms';
import { MatTableModule, MatTableDataSource }    from '@angular/material/table';
import { MatPaginatorModule, MatPaginator }      from '@angular/material/paginator';
import { MatExpansionModule }                    from '@angular/material/expansion';
import { MatFormFieldModule }                    from '@angular/material/form-field';
import { MatInputModule }                        from '@angular/material/input';
import { MatIconModule }                         from '@angular/material/icon';
import { MatButtonModule }                       from '@angular/material/button';
import { MatDialogModule }                       from '@angular/material/dialog';
import { MatProgressSpinnerModule }              from '@angular/material/progress-spinner';
import { MatTooltipModule }                      from '@angular/material/tooltip';
import { HttpClient }                            from '@angular/common/http';
import { Subject, throwError }                   from 'rxjs';
import { takeUntil, catchError, switchMap }      from 'rxjs/operators';

export interface Pharmacist {
  position:       number;
  id:             string;
  pharmacistName: string;
  email:          string;
  branchName:     string;
  licenceNumber:  string;
  confirmed:      boolean;
  confirming?:    boolean; // per-row loading state
}

@Component({
  selector:    'app-notifications',
  standalone:  true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatExpansionModule,
    MatFormFieldModule, MatInputModule,
    MatIconModule, MatButtonModule, MatDialogModule,
    MatProgressSpinnerModule, MatTooltipModule
  ],
  templateUrl: './notifications.html',
  styleUrl:    './notifications.css',
})
export class Notifications implements OnInit, AfterViewInit, OnDestroy {

  displayedColumns: string[] = [
    'position', 'pharmacistName', 'email',
    'branchName', 'licenceNumber', 'action'
  ];
  dataSource = new MatTableDataSource<Pharmacist>([]);

  searchName   = '';
  searchBranch = '';

  showDialog       = false;
  dialogPharmacist = '';

  isLoading    = false;
  errorMessage = '';

  private allPharmacists: Pharmacist[] = [];
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadNonConfirmedPharmacists();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  loadNonConfirmedPharmacists(): void {
    this.isLoading    = true;
    this.errorMessage = '';

    this.http
      .get<any>('/api/admin/dashboard/non-confirmed-pharmacists')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            const data: Pharmacist[] = response.data.map((item: any, index: number) => ({
              position:       index + 1,
              id:             item.id            ?? item.userId ?? '',
              pharmacistName: `${item.firstName} ${item.lastName}`,
              email:          item.email         ?? '',
              branchName:     item.storeName     ?? '',
              licenceNumber:  item.licenseNumber ?? '',
              confirmed:      false,
              confirming:     false,
            }));
            this.allPharmacists  = data;
            this.dataSource.data = data;
          } else {
            this.allPharmacists  = [];
            this.dataSource.data = [];
            this.errorMessage    = response.message ?? 'No pending pharmacists found.';
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load pharmacists:', err);
          this.allPharmacists  = [];
          this.dataSource.data = [];
          this.errorMessage    = 'Failed to load pharmacists. Please try again.';
          this.isLoading       = false;
          this.cdr.detectChanges();
        }
      });
  }

  // ── Confirm (tries PUT → GET fallback) ────────────────────────────────────

  confirm(pharmacist: Pharmacist): void {
    if (pharmacist.confirmed || pharmacist.confirming || !pharmacist.id) return;

    const url = `/api/admin/dashboard/confirm-pharmacist-email/${pharmacist.id}`;
    pharmacist.confirming = true;
    this.cdr.detectChanges();

    // Try PUT first; if server returns 405, fall back to GET
    this.http
      .put<any>(url, {}, { observe: 'response' })
      .pipe(
        takeUntil(this.destroy$),
        catchError((putErr) => {
          if (putErr.status === 405) {
            console.warn('PUT returned 405 — falling back to GET');
            return this.http.get<any>(url, { observe: 'response' });
          }
          return throwError(() => putErr);
        })
      )
      .subscribe({
        next: (response) => {
          pharmacist.confirming = false;
          if (response.body?.succeeded) {
            pharmacist.confirmed      = true;
            this.dialogPharmacist     = pharmacist.pharmacistName;
            this.showDialog           = true;
            // Refresh list after a short delay so the dialog shows first
            setTimeout(() => this.loadNonConfirmedPharmacists(), 800);
          } else {
            console.error('succeeded flag missing/false:', response.body);
            this.errorMessage = 'Server did not confirm the pharmacist. Please try again.';
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          pharmacist.confirming = false;
          console.error('Confirm request failed:', err);
          this.errorMessage = `Request failed (${err.status} ${err.statusText}). Check the console.`;
          this.cdr.detectChanges();
        }
      });
  }

  // ── Filters ───────────────────────────────────────────────────────────────

  applyFilters(): void {
    const name   = this.searchName.toLowerCase().trim();
    const branch = this.searchBranch.toLowerCase().trim();

    const filtered = this.allPharmacists.filter(p =>
      (!name   || p.pharmacistName.toLowerCase().includes(name))   &&
      (!branch || p.branchName.toLowerCase().includes(branch))
    );

    this.dataSource.data = filtered.map((p, i) => ({ ...p, position: i + 1 }));
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  resetFilters(): void {
    this.searchName      = '';
    this.searchBranch    = '';
    this.dataSource.data = this.allPharmacists.map((p, i) => ({ ...p, position: i + 1 }));
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  // ── Dialog ────────────────────────────────────────────────────────────────

  closeDialog(): void {
    this.showDialog = false;
  }
}
