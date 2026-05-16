import { AfterViewInit, Component, ViewChild, TemplateRef } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface Branch {
  branchName: string;
  location: string;
  availableStock: number;
  address?: string;
  phone?: string;
  inventoryId?: string;
  storeId?: string;
}

export interface Product {
  position: number;
  productName: string;
  price: number;
  categoryName: string;
  companyName: string;
  branches: Branch[];
  productId?: string;
  mainImageUrl?: string;
  description?: string;
  discountPercentage?: number;
  isAvailable?: boolean;
  loadingBranches?: boolean;
  nameAr?: string;
  tags?: string;
  activeIngredients?: string;
  sideEffects?: string;
  contraindications?: string;
  medicalDescription?: string;
  dosageForm?: string;
}

export interface UpdateForm {
  productId: string;
  nameEn: string;
  nameAr: string;
  description: string;
  medicalDescription: string;
  price: number;
  discountPercentage: number;
  isAvailable: boolean;
  tags: string;
  activeIngredients: string;
  sideEffects: string;
  contraindications: string;
  dosageForm: string;
  newMainImage: File | null;
}

export interface CreateForm {
  nameEn: string;
  nameAr: string;
  categoryId: string;
  companyId: string;
  description: string;
  medicalDescription: string;
  tags: string;
  discountPercentage: number;
  activeIngredients: string;
  sideEffects: string;
  contraindications: string;
  price: number;
  isAvailable: boolean;
  dosageForm: string;
  mainImage: File | null;
  images: File[];
}

interface CategoryApiResponse {
  statusCode: number;
  succeeded: boolean;
  message: string;
  errorsBag: any;
  data: {
    id: string;
    name: string;
    productsCount?: number;
    logoUrl?: string;
  }[];
}

interface CompanyApiResponse {
  statusCode: number;
  succeeded: boolean;
  data: { companyId: string; name: string }[];
}

interface ProductsApiResponse {
  statusCode: number;
  succeeded: boolean;
  message: string;
  errorsBag: any;
  data: {
    items: ProductApiItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

interface ProductApiItem {
  productId: string;
  mainImageUrl: string;
  images: string[];
  nameEn: string;
  nameAr?: string;
  companyName: string;
  description: string;
  averageRating: number;
  totalRatings: number;
  price: number;
  isAvailable: boolean;
  activeIngredients: string;
  tags: string;
  discountPercentage: number;
  sideEffects?: string;
  contraindications?: string;
  dosageForm?: string;
}

interface InventoryApiResponse {
  statusCode: number;
  succeeded: boolean;
  message: string;
  errorsBag: any;
  data: InventoryItem[];
}

interface InventoryItem {
  inventoryId: string;
  productId: string;
  storeId: string;
  availableQuantity: number;
  productName: string;
  storeName: string;
  address: string;
  phone: string;
}

@Component({
  selector: 'app-products-component',
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatExpansionModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatIconModule, MatButtonModule, MatChipsModule,
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatSlideToggleModule, MatTooltipModule
  ],
  templateUrl: './products-component.html',
  styleUrl: './products-component.css',
})
export class ProductsComponent implements AfterViewInit {
  private baseUrl = 'https://smartcarepharmacy.tryasp.net';
  private destroy$ = new Subject<void>();

  public Math = Math;

  displayedColumns: string[] = ['position', 'productName', 'price', 'categoryName', 'companyName', 'actions'];
  dataSource = new MatTableDataSource<Product>([]);
  allProducts: Product[] = [];

  searchText = '';
  selectedCompany = '';
  selectedCategory = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  expandedProduct: Product | null = null;
  companies: string[] = [];
  categories: string[] = [];

  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  errorMessage = '';

  // ── Update dialog state ───────────────────────────────────
  updateForm: UpdateForm = this.emptyUpdateForm();
  isUpdating = false;
  mainImagePreview: string | null = null;
  productToDelete: Product | null = null;
  isDeleting = false;

  // ── Create dialog state ───────────────────────────────────
  createForm: CreateForm = this.emptyCreateForm();
  isCreating = false;
  createMainImagePreview: string | null = null;
  createExtraImagePreviews: string[] = [];
  categoryList: { categoryId: string; nameEn: string }[] = [];
  companyList:  { companyId: string; name: string }[] = [];
  loadingLookups = false;

  private branchCache = new Map<string, Branch[]>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('updateDialog') updateDialog!: TemplateRef<any>;
  @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;
  @ViewChild('createDialog') createDialog!: TemplateRef<any>;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
  this.loadLookups();   // Preload categories and companies
  this.loadProducts();  // Load products table
}

  ngAfterViewInit() {
    this.loadProducts();
    if (this.paginator) {
      this.paginator.page.pipe(takeUntil(this.destroy$)).subscribe((event: PageEvent) => {
        this.pageNumber = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadProducts();
      });
    }
  }

  private emptyUpdateForm(): UpdateForm {
    return {
      productId: '', nameEn: '', nameAr: '', description: '',
      medicalDescription: '', price: 0, discountPercentage: 0,
      isAvailable: true, tags: '', activeIngredients: '',
      sideEffects: '', contraindications: '', dosageForm: '', newMainImage: null
    };
  }

  private emptyCreateForm(): CreateForm {
    return {
      nameEn: '', nameAr: '', categoryId: '', companyId: '',
      description: '', medicalDescription: '', tags: '',
      discountPercentage: 0, activeIngredients: '', sideEffects: '',
      contraindications: '', price: 0, isAvailable: true,
      dosageForm: '', mainImage: null, images: []
    };
  }

  // ── Load products ─────────────────────────────────────────
  loadProducts() {
    this.errorMessage = '';
    let url = `${this.baseUrl}/api/Products?pageNumber=${this.pageNumber}&pageSize=${this.pageSize}`;
    if (this.searchText)       url += `&search=${encodeURIComponent(this.searchText)}`;
    if (this.selectedCategory) url += `&category=${encodeURIComponent(this.selectedCategory)}`;
    if (this.selectedCompany)  url += `&company=${encodeURIComponent(this.selectedCompany)}`;
    if (this.minPrice != null && this.minPrice > 0) url += `&minPrice=${this.minPrice}`;
    if (this.maxPrice != null && this.maxPrice > 0) url += `&maxPrice=${this.maxPrice}`;

    this.http.get<ProductsApiResponse>(url).subscribe({
      next: (response) => {
        if (response.succeeded && response.data?.items) {
          this.allProducts = response.data.items.map((item, index) => ({
            position: (this.pageNumber - 1) * this.pageSize + index + 1,
            productId: item.productId,
            productName: item.nameEn,
            nameAr: item.nameAr || '',
            price: item.price,
            companyName: item.companyName,
            categoryName: this.extractCategoryFromTags(item.tags),
            branches: [],
            mainImageUrl: item.mainImageUrl,
            description: item.description,
            discountPercentage: item.discountPercentage || 0,
            isAvailable: item.isAvailable,
            tags: item.tags || '',
            activeIngredients: item.activeIngredients || '',
            sideEffects: item.sideEffects || '',
            contraindications: item.contraindications || '',
            dosageForm: item.dosageForm || ''
          }));
          this.totalCount = response.data.totalCount;
          this.dataSource.data = [...this.allProducts];
          this.extractFilterOptions();
        } else {
          this.errorMessage = response.message || 'Failed to load products';
        }
      },
      error: () => { this.errorMessage = 'Could not connect to server. Please try again later.'; }
    });
  }

  private extractCategoryFromTags(tags: string): string {
    if (!tags) return 'General';
    const firstTag = tags.split(',')[0].trim();
    return firstTag ? firstTag.charAt(0).toUpperCase() + firstTag.slice(1) : 'General';
  }

  extractFilterOptions() {
    this.categories = Array.from(new Set(this.allProducts.map(p => p.categoryName).filter(Boolean))).sort();
    this.companies  = Array.from(new Set(this.allProducts.map(p => p.companyName).filter(Boolean))).sort();
  }

  // ── CREATE ────────────────────────────────────────────────
  openCreateDialog() {
    this.createForm = this.emptyCreateForm();
    this.createMainImagePreview = null;
    this.createExtraImagePreviews = [];
    //this.loadLookups();
    this.dialog.open(this.createDialog, { width: '700px', maxHeight: '90vh', disableClose: true });
  }

  loadLookups() {
  this.loadingLookups = true;
  let categoriesLoaded = false;
  let companiesLoaded = false;

  // Fetch categories from the public endpoint
  this.http.get<CategoryApiResponse>(`${this.baseUrl}/api/categories`).subscribe({
    next: (res) => {
      if (res.succeeded && res.data) {
        // Map API response to the format expected by the dropdown
        this.categoryList = res.data.map(cat => ({
          categoryId: cat.id,
          nameEn: cat.name
        }));
      } else {
        console.error('Failed to load categories', res.message);
      }
      categoriesLoaded = true;
      if (companiesLoaded) this.loadingLookups = false;
    },
    error: (err) => {
      console.error('Error loading categories', err);
      categoriesLoaded = true;
      if (companiesLoaded) this.loadingLookups = false;
      this.snackBar.open('❌ Failed to load categories', 'Close', { duration: 3000 });
    }
  });

  // Fetch companies (remains unchanged)
  this.http.get<CompanyApiResponse>(`${this.baseUrl}/api/admin/Companies`).subscribe({
    next: (res) => {
      if (res.succeeded) {
        this.companyList = res.data;
      }
      companiesLoaded = true;
      if (categoriesLoaded) this.loadingLookups = false;
    },
    error: (err) => {
      console.error('Error loading companies', err);
      companiesLoaded = true;
      if (categoriesLoaded) this.loadingLookups = false;
      this.snackBar.open('❌ Failed to load companies', 'Close', { duration: 3000 });
    }
  });
}

  onCreateMainImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.createForm.mainImage = file;
    const reader = new FileReader();
    reader.onload = () => (this.createMainImagePreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  onCreateExtraImagesChange(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    this.createForm.images = [...this.createForm.images, ...files];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => this.createExtraImagePreviews.push(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  removeExtraImage(index: number) {
    this.createForm.images.splice(index, 1);
    this.createExtraImagePreviews.splice(index, 1);
  }

  submitCreate() {
    if (!this.createForm.nameEn || !this.createForm.price) {
      this.snackBar.open('⚠️ Name and Price are required', 'Close', { duration: 3000 });
      return;
    }
    this.isCreating = true;

    const fd = new FormData();
    fd.append('NameEn',             this.createForm.nameEn);
    fd.append('NameAr',             this.createForm.nameAr);
    fd.append('CategoryId',         this.createForm.categoryId);
    fd.append('CompanyId',          this.createForm.companyId);
    fd.append('Description',        this.createForm.description);
    fd.append('MedicalDescription', this.createForm.medicalDescription);
    fd.append('Tags',               this.createForm.tags);
    fd.append('DiscountPercentage', this.createForm.discountPercentage.toString());
    fd.append('ActiveIngredients',  this.createForm.activeIngredients);
    fd.append('SideEffects',        this.createForm.sideEffects);
    fd.append('Contraindications',  this.createForm.contraindications);
    fd.append('Price',              this.createForm.price.toString());
    fd.append('IsAvailable',        this.createForm.isAvailable.toString());
    fd.append('DosageForm',         this.createForm.dosageForm);
    if (this.createForm.mainImage) {
      fd.append('MainImage', this.createForm.mainImage);
    }
    this.createForm.images.forEach(img => fd.append('Images', img));

    this.http.post<any>(`${this.baseUrl}/api/admin/Products/create`, fd).subscribe({
      next: (res) => {
        this.isCreating = false;
        if (res.succeeded) {
          this.snackBar.open('✅ Product created successfully', 'Close', { duration: 3000 });
          this.dialog.closeAll();
          this.loadProducts();
        } else {
          this.snackBar.open('❌ ' + (res.message || 'Create failed'), 'Close', { duration: 4000 });
        }
      },
      error: () => {
        this.isCreating = false;
        this.snackBar.open('❌ Server error during create', 'Close', { duration: 4000 });
      }
    });
  }

  // ── UPDATE ────────────────────────────────────────────────
  openUpdateDialog(product: Product, event: MouseEvent) {
    event.stopPropagation();
    this.mainImagePreview = product.mainImageUrl || null;
    this.updateForm = {
      productId:          product.productId!,
      nameEn:             product.productName,
      nameAr:             product.nameAr || '',
      description:        product.description || '',
      medicalDescription: product.medicalDescription || '',
      price:              product.price,
      discountPercentage: product.discountPercentage || 0,
      isAvailable:        product.isAvailable ?? true,
      tags:               product.tags || '',
      activeIngredients:  product.activeIngredients || '',
      sideEffects:        product.sideEffects || '',
      contraindications:  product.contraindications || '',
      dosageForm:         product.dosageForm || '',
      newMainImage:       null
    };
    this.dialog.open(this.updateDialog, { width: '700px', maxHeight: '90vh', disableClose: true });
  }

  onMainImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.updateForm.newMainImage = file;
    const reader = new FileReader();
    reader.onload = () => (this.mainImagePreview = reader.result as string);
    reader.readAsDataURL(file);
  }

submitUpdate() {
  if (!this.updateForm.productId) return;
  this.isUpdating = true;

  const fd = new FormData();
  fd.append('ProductId', this.updateForm.productId);
  fd.append('NameEn', this.updateForm.nameEn);
  fd.append('NameAr', this.updateForm.nameAr);
  fd.append('Description', this.updateForm.description);
  fd.append('MedicalDescription', this.updateForm.medicalDescription);
  fd.append('Price', this.updateForm.price.toString());
  fd.append('DiscountPercentage', this.updateForm.discountPercentage.toString());
  fd.append('IsAvailable', this.updateForm.isAvailable.toString());
  fd.append('Tags', this.updateForm.tags);
  fd.append('ActiveIngredients', this.updateForm.activeIngredients);
  fd.append('SideEffects', this.updateForm.sideEffects);
  fd.append('Contraindications', this.updateForm.contraindications);
  fd.append('DosageForm', this.updateForm.dosageForm);
  if (this.updateForm.newMainImage) fd.append('NewMainImage', this.updateForm.newMainImage);

  this.http.put<any>(`${this.baseUrl}/api/admin/Products/update`, fd).subscribe({
    next: (res) => {
      this.isUpdating = false;
      if (res.succeeded) {
        this.snackBar.open('✅ Product updated successfully', 'Close', { duration: 3000 });
        this.dialog.closeAll();
        this.loadProducts();
      } else {
        // Business logic error (e.g., validation from server)
        this.snackBar.open('❌ ' + (res.message || 'Update failed'), 'Close', { duration: 4000 });
      }
    },
    error: (err) => {
      this.isUpdating = false;
      // Try to extract meaningful error message
      let errorMessage = '❌ Server error during update';
      if (err.error?.message) {
        errorMessage = err.error.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      this.snackBar.open(errorMessage, 'Close', { duration: 4000 });
      console.error('Update error:', err);
    }
  });
}

  // ── DELETE ────────────────────────────────────────────────
  openDeleteDialog(product: Product, event: MouseEvent) {
    event.stopPropagation();
    this.productToDelete = product;
    this.dialog.open(this.deleteDialog, { width: '420px', disableClose: true });
  }

  confirmDelete() {
    if (!this.productToDelete?.productId) return;
    this.isDeleting = true;
    this.http.delete<any>(`${this.baseUrl}/api/admin/Products/${this.productToDelete.productId}/delete`).subscribe({
      next: (res) => {
        this.isDeleting = false;
        if (res.succeeded) {
          this.snackBar.open('🗑️ Product deleted successfully', 'Close', { duration: 3000 });
          this.dialog.closeAll();
          this.loadProducts();
        } else {
          this.snackBar.open('❌ ' + (res.message || 'Delete failed'), 'Close', { duration: 4000 });
        }
      },
      error: () => {
        this.isDeleting = false;
        this.snackBar.open('❌ Server error during delete', 'Close', { duration: 4000 });
      }
    });
  }

  // ── Branches ──────────────────────────────────────────────
  loadBranchesForProduct(product: Product) {
    if (!product.productId) return;
    if (this.branchCache.has(product.productId)) {
      product.branches = this.branchCache.get(product.productId)!;
      this.dataSource.data = [...this.dataSource.data];
      return;
    }
    product.loadingBranches = true;
    this.dataSource.data = [...this.dataSource.data];

    this.http.get<InventoryApiResponse>(
      `${this.baseUrl}/api/Inventories/GetAvailableInventory?productId=${product.productId}`
    ).subscribe({
      next: (response) => {
        product.loadingBranches = false;
        let branches: Branch[] = [];
        if (response.succeeded && response.data) {
          branches = response.data.map(inv => ({
            branchName: inv.storeName, location: inv.address,
            availableStock: inv.availableQuantity, address: inv.address,
            phone: inv.phone, inventoryId: inv.inventoryId, storeId: inv.storeId
          }));
          this.branchCache.set(product.productId!, branches);
        }
        const idx = this.dataSource.data.findIndex(p => p.productId === product.productId);
        if (idx !== -1) {
          this.dataSource.data[idx].branches = branches;
          this.expandedProduct = null;
          this.dataSource.data = [...this.dataSource.data];
          setTimeout(() => {
            this.expandedProduct = this.dataSource.data[idx];
            this.dataSource.data = [...this.dataSource.data];
          }, 20);
        }
      },
      error: () => {
        product.loadingBranches = false;
        this.dataSource.data = [...this.dataSource.data];
      }
    });
  }

  // ── Filters ───────────────────────────────────────────────
  applyFilters() {
    const filtered = this.allProducts.filter(p => {
      const matchesSearch   = !this.searchText       || p.productName.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesCompany  = !this.selectedCompany  || p.companyName  === this.selectedCompany;
      const matchesCategory = !this.selectedCategory || p.categoryName === this.selectedCategory;
      const matchesMin      = this.minPrice == null  || p.price >= this.minPrice;
      const matchesMax      = this.maxPrice == null  || p.price <= this.maxPrice;
      return matchesSearch && matchesCompany && matchesCategory && matchesMin && matchesMax;
    });
    this.dataSource.data = filtered.map((p, i) => ({ ...p, position: i + 1 }));
    if (this.paginator) this.paginator.firstPage();
  }

  resetFilters() {
    this.searchText = ''; this.selectedCompany = ''; this.selectedCategory = '';
    this.minPrice = null; this.maxPrice = null; this.pageNumber = 1;
    if (this.paginator) this.paginator.firstPage();
    this.loadProducts();
  }

  isDetailRow = (_index: number, row: Product) => row === this.expandedProduct;

  toggleProduct(product: Product) {
    if (this.expandedProduct === product) {
      this.expandedProduct = null;
      this.dataSource.data = [...this.dataSource.data];
      return;
    }
    this.expandedProduct = product;
    this.dataSource.data = [...this.dataSource.data];
    if (product.branches.length === 0) this.loadBranchesForProduct(product);
  }

  getStockLevel(stock: number): string {
    if (stock >= 50) return 'high';
    if (stock >= 10) return 'medium';
    return 'low';
  }

  getTotalStock(product: Product): number {
    return product.branches.reduce((sum, b) => sum + b.availableStock, 0);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
