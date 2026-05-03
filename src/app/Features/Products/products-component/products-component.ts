import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
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
  displayedColumns: string[] = ['position', 'productName', 'price', 'categoryName', 'companyName'];
  dataSource = new MatTableDataSource<Product>(PRODUCTS_DATA);

  searchText       = '';
  selectedCompany  = '';
  selectedCategory = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  expandedProduct: Product | null = null;

  companies  = [...new Set(PRODUCTS_DATA.map(p => p.companyName))];
  categories = [...new Set(PRODUCTS_DATA.map(p => p.categoryName))];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  isDetailRow = (_index: number, row: Product) => row === this.expandedProduct;

  toggleProduct(product: Product) {
    this.expandedProduct = this.expandedProduct === product ? null : product;
    this.dataSource.data = [...this.dataSource.data];
  }

  applyFilters() {
    this.dataSource.data = PRODUCTS_DATA.filter(p => {
      const matchSearch   = !this.searchText     || p.productName.toLowerCase().includes(this.searchText.toLowerCase());
      const matchCompany  = !this.selectedCompany  || p.companyName  === this.selectedCompany;
      const matchCategory = !this.selectedCategory || p.categoryName === this.selectedCategory;
      const matchMin      = this.minPrice == null  || p.price >= this.minPrice;
      const matchMax      = this.maxPrice == null  || p.price <= this.maxPrice;
      return matchSearch && matchCompany && matchCategory && matchMin && matchMax;
    });
    this.dataSource.data.forEach((p, i) => p.position = i + 1);
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  resetFilters() {
    this.searchText      = '';
    this.selectedCompany  = '';
    this.selectedCategory = '';
    this.minPrice        = null;
    this.maxPrice        = null;
    this.dataSource.data = PRODUCTS_DATA.map((p, i) => ({ ...p, position: i + 1 }));
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  getTotalStock(product: Product): number {
    return product.branches.reduce((sum, b) => sum + b.availableStock, 0);
  }

  getStockLevel(stock: number): string {
    if (stock >= 300) return 'high';
    if (stock >= 100) return 'medium';
    return 'low';
  }
}

export interface Branch {
  branchName: string;
  location: string;
  availableStock: number;
}

export interface Product {
  position: number;
  productName: string;
  price: number;
  categoryName: string;
  companyName: string;
  branches: Branch[];
}

const PRODUCTS_DATA: Product[] = [
  {
    position: 1, productName: 'Paracetamol 500mg', price: 12.50,
    categoryName: 'Pain Relief', companyName: 'PharmaCo',
    branches: [
      { branchName: 'Cairo Branch',      location: 'Cairo',      availableStock: 320 },
      { branchName: 'Alexandria Branch', location: 'Alexandria', availableStock: 150 },
      { branchName: 'Giza Branch',       location: 'Giza',       availableStock: 210 },
    ]
  },
  {
    position: 2, productName: 'Ibuprofen 400mg', price: 18.00,
    categoryName: 'Pain Relief', companyName: 'MediPlus',
    branches: [
      { branchName: 'Cairo Branch',    location: 'Cairo',    availableStock: 180 },
      { branchName: 'Mansoura Branch', location: 'Mansoura', availableStock: 90  },
    ]
  },
  {
    position: 3, productName: 'Amoxicillin 250mg', price: 35.75,
    categoryName: 'Antibiotics', companyName: 'BioHealth',
    branches: [
      { branchName: 'Cairo Branch',      location: 'Cairo',      availableStock: 75 },
      { branchName: 'Alexandria Branch', location: 'Alexandria', availableStock: 40 },
      { branchName: 'Aswan Branch',      location: 'Aswan',      availableStock: 30 },
    ]
  },
  {
    position: 4, productName: 'Vitamin C 1000mg', price: 22.00,
    categoryName: 'Vitamins', companyName: 'NutriCare',
    branches: [
      { branchName: 'Giza Branch',  location: 'Giza',  availableStock: 500 },
      { branchName: 'Cairo Branch', location: 'Cairo', availableStock: 420 },
    ]
  },
  {
    position: 5, productName: 'Omega-3 Fish Oil', price: 45.00,
    categoryName: 'Supplements', companyName: 'NutriCare',
    branches: [
      { branchName: 'Alexandria Branch', location: 'Alexandria', availableStock: 200 },
      { branchName: 'Cairo Branch',      location: 'Cairo',      availableStock: 310 },
      { branchName: 'Luxor Branch',      location: 'Luxor',      availableStock: 60  },
    ]
  },
  {
    position: 6, productName: 'Blood Pressure Monitor', price: 320.00,
    categoryName: 'Medical Devices', companyName: 'SmartCare',
    branches: [
      { branchName: 'Cairo Branch', location: 'Cairo', availableStock: 45 },
      { branchName: 'Giza Branch',  location: 'Giza',  availableStock: 28 },
    ]
  },
  {
    position: 7, productName: 'Digital Thermometer', price: 85.00,
    categoryName: 'Medical Devices', companyName: 'SmartCare',
    branches: [
      { branchName: 'Cairo Branch',      location: 'Cairo',      availableStock: 130 },
      { branchName: 'Alexandria Branch', location: 'Alexandria', availableStock: 95  },
      { branchName: 'Mansoura Branch',   location: 'Mansoura',   availableStock: 50  },
    ]
  },
  {
    position: 8, productName: 'Insulin Syringe 1ml', price: 9.50,
    categoryName: 'Diabetes Care', companyName: 'MediPlus',
    branches: [
      { branchName: 'Giza Branch',  location: 'Giza',  availableStock: 600 },
      { branchName: 'Cairo Branch', location: 'Cairo', availableStock: 750 },
    ]
  },
  {
    position: 9, productName: 'Glucose Test Strips', price: 55.00,
    categoryName: 'Diabetes Care', companyName: 'GlucoTech',
    branches: [
      { branchName: 'Cairo Branch', location: 'Cairo', availableStock: 220 },
      { branchName: 'Aswan Branch', location: 'Aswan', availableStock: 80  },
    ]
  },
  {
    position: 10, productName: 'Surgical Face Mask x50', price: 28.00,
    categoryName: 'Protective Gear', companyName: 'SafeGuard',
    branches: [
      { branchName: 'Cairo Branch',      location: 'Cairo',      availableStock: 1000 },
      { branchName: 'Alexandria Branch', location: 'Alexandria', availableStock: 800  },
      { branchName: 'Giza Branch',       location: 'Giza',       availableStock: 650  },
    ]
  },
  {
    position: 11, productName: 'Nitrile Gloves x100', price: 42.00,
    categoryName: 'Protective Gear', companyName: 'SafeGuard',
    branches: [
      { branchName: 'Cairo Branch', location: 'Cairo', availableStock: 400 },
      { branchName: 'Luxor Branch', location: 'Luxor', availableStock: 120 },
    ]
  },
  {
    position: 12, productName: 'Antacid Tablets x20', price: 15.00,
    categoryName: 'Digestive Health', companyName: 'PharmaCo',
    branches: [
      { branchName: 'Mansoura Branch', location: 'Mansoura', availableStock: 300 },
      { branchName: 'Cairo Branch',    location: 'Cairo',    availableStock: 270 },
    ]
  },
  {
    position: 13, productName: 'Cough Syrup 100ml', price: 19.50,
    categoryName: 'Cold & Flu', companyName: 'BioHealth',
    branches: [
      { branchName: 'Alexandria Branch', location: 'Alexandria', availableStock: 190 },
      { branchName: 'Cairo Branch',      location: 'Cairo',      availableStock: 230 },
      { branchName: 'Giza Branch',       location: 'Giza',       availableStock: 110 },
    ]
  },
  {
    position: 14, productName: 'Nasal Spray 15ml', price: 24.00,
    categoryName: 'Cold & Flu', companyName: 'MediPlus',
    branches: [
      { branchName: 'Cairo Branch', location: 'Cairo', availableStock: 160 },
      { branchName: 'Aswan Branch', location: 'Aswan', availableStock: 55  },
    ]
  },
  {
    position: 15, productName: 'Eye Drops 10ml', price: 17.75,
    categoryName: 'Eye Care', companyName: 'VisionPlus',
    branches: [
      { branchName: 'Giza Branch',  location: 'Giza',  availableStock: 340 },
      { branchName: 'Cairo Branch', location: 'Cairo', availableStock: 290 },
    ]
  },
  {
    position: 16, productName: 'Zinc Supplement 50mg', price: 30.00,
    categoryName: 'Vitamins', companyName: 'NutriCare',
    branches: [
      { branchName: 'Cairo Branch', location: 'Cairo', availableStock: 410 },
      { branchName: 'Luxor Branch', location: 'Luxor', availableStock: 95  },
    ]
  },
  {
    position: 17, productName: 'Antiseptic Cream 30g', price: 13.00,
    categoryName: 'First Aid', companyName: 'SafeGuard',
    branches: [
      { branchName: 'Alexandria Branch', location: 'Alexandria', availableStock: 520 },
      { branchName: 'Cairo Branch',      location: 'Cairo',      availableStock: 480 },
      { branchName: 'Mansoura Branch',   location: 'Mansoura',   availableStock: 200 },
    ]
  },
  {
    position: 18, productName: 'Bandage Roll 5m', price: 8.00,
    categoryName: 'First Aid', companyName: 'SafeGuard',
    branches: [
      { branchName: 'Giza Branch',  location: 'Giza',  availableStock: 700 },
      { branchName: 'Cairo Branch', location: 'Cairo', availableStock: 850 },
    ]
  },
  {
    position: 19, productName: 'Melatonin 5mg', price: 38.00,
    categoryName: 'Sleep Aid', companyName: 'NutriCare',
    branches: [
      { branchName: 'Cairo Branch',      location: 'Cairo',      availableStock: 175 },
      { branchName: 'Alexandria Branch', location: 'Alexandria', availableStock: 130 },
    ]
  },
  {
    position: 20, productName: 'Probiotic Capsules x30', price: 60.00,
    categoryName: 'Digestive Health', companyName: 'GlucoTech',
    branches: [
      { branchName: 'Cairo Branch', location: 'Cairo', availableStock: 240 },
      { branchName: 'Giza Branch',  location: 'Giza',  availableStock: 180 },
      { branchName: 'Aswan Branch', location: 'Aswan', availableStock: 70  },
    ]
  },
];
