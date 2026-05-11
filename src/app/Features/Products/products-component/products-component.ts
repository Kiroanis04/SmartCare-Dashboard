import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
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
}

// API Response Interfaces
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
  companyName: string;
  description: string;
  averageRating: number;
  totalRatings: number;
  price: number;
  isAvailable: boolean;
  activeIngredients: string;
  tags: string;
  discountPercentage: number;
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
    MatIconModule, MatButtonModule, MatChipsModule
  ],
  templateUrl: './products-component.html',
  styleUrl: './products-component.css',
})
export class ProductsComponent implements AfterViewInit {
  private baseUrl = 'https://smartcarepharmacy.tryasp.net';
  private destroy$ = new Subject<void>();

  public Math = Math;

  displayedColumns: string[] = ['position', 'productName', 'price', 'categoryName', 'companyName'];
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

  private branchCache = new Map<string, Branch[]>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.loadProducts();

    if (this.paginator) {
      this.paginator.page
        .pipe(takeUntil(this.destroy$))
        .subscribe((event: PageEvent) => {
          this.pageNumber = event.pageIndex + 1;
          this.pageSize = event.pageSize;
          this.loadProducts();
        });
    }
  }

  loadProducts() {
    this.errorMessage = '';

    let url = `${this.baseUrl}/api/Products?pageNumber=${this.pageNumber}&pageSize=${this.pageSize}`;

    if (this.searchText) {
      url += `&search=${encodeURIComponent(this.searchText)}`;
    }
    if (this.selectedCategory) {
      url += `&category=${encodeURIComponent(this.selectedCategory)}`;
    }
    if (this.selectedCompany) {
      url += `&company=${encodeURIComponent(this.selectedCompany)}`;
    }
    if (this.minPrice !== null && this.minPrice > 0) {
      url += `&minPrice=${this.minPrice}`;
    }
    if (this.maxPrice !== null && this.maxPrice > 0) {
      url += `&maxPrice=${this.maxPrice}`;
    }

    this.http.get<ProductsApiResponse>(url).subscribe({
      next: (response) => {
        if (response.succeeded && response.data?.items) {
          this.allProducts = response.data.items.map((item: ProductApiItem, index: number) => ({
            position: (this.pageNumber - 1) * this.pageSize + index + 1,
            productId: item.productId,
            productName: item.nameEn,
            price: item.price,
            companyName: item.companyName,
            categoryName: this.extractCategoryFromTags(item.tags),
            branches: [],
            mainImageUrl: item.mainImageUrl,
            description: item.description,
            discountPercentage: item.discountPercentage || 0,
            isAvailable: item.isAvailable
          }));

          this.totalCount = response.data.totalCount;
          this.dataSource.data = [...this.allProducts];
          this.extractFilterOptions();
        } else {
          this.errorMessage = response.message || 'Failed to load products';
        }
      },
      error: (err) => {
        console.error('API error', err);
        this.errorMessage = 'Could not connect to server. Please try again later.';
      }
    });
  }

  private extractCategoryFromTags(tags: string): string {
    if (!tags) return 'General';
    const firstTag = tags.split(',')[0].trim();
    return firstTag ? firstTag.charAt(0).toUpperCase() + firstTag.slice(1) : 'General';
  }

  extractFilterOptions() {
    const uniqueCategories = new Set(this.allProducts.map(p => p.categoryName).filter(c => c));
    this.categories = Array.from(uniqueCategories).sort();

    const uniqueCompanies = new Set(this.allProducts.map(p => p.companyName).filter(c => c));
    this.companies = Array.from(uniqueCompanies).sort();
  }

  loadBranchesForProduct(product: Product) {
    if (!product.productId) return;

    if (this.branchCache.has(product.productId)) {
      product.branches = this.branchCache.get(product.productId)!;
      this.dataSource.data = [...this.dataSource.data];
      return;
    }

    this.http.get<InventoryApiResponse>(
      `${this.baseUrl}/api/Inventories/GetAvailableInventory?productId=${product.productId}`
    ).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          product.branches = response.data.map((inv: InventoryItem) => ({
            branchName: inv.storeName,
            location: inv.address,
            availableStock: inv.availableQuantity,
            address: inv.address,
            phone: inv.phone,
            inventoryId: inv.inventoryId,
            storeId: inv.storeId
          }));

          this.branchCache.set(product.productId!, product.branches);
        } else {
          product.branches = [];
        }
        this.dataSource.data = [...this.dataSource.data];
      },
      error: (err) => {
        console.error('Failed to load branches', err);
        product.branches = [];
        this.dataSource.data = [...this.dataSource.data];
      }
    });
  }

  applyFilters() {
    let filtered = [...this.allProducts];
    filtered = filtered.filter(p => {
      const matchesSearch = !this.searchText || p.productName.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesCompany = !this.selectedCompany || p.companyName === this.selectedCompany;
      const matchesCategory = !this.selectedCategory || p.categoryName === this.selectedCategory;
      const matchesMin = this.minPrice == null || p.price >= this.minPrice;
      const matchesMax = this.maxPrice == null || p.price <= this.maxPrice;
      return matchesSearch && matchesCompany && matchesCategory && matchesMin && matchesMax;
    });
    this.dataSource.data = filtered.map((p, i) => ({ ...p, position: i + 1 }));
    if (this.paginator) this.paginator.firstPage();
  }

  resetFilters() {
    this.searchText = '';
    this.selectedCompany = '';
    this.selectedCategory = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.pageNumber = 1;
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

    if (product.branches.length === 0) {
      this.loadBranchesForProduct(product);
    }
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
