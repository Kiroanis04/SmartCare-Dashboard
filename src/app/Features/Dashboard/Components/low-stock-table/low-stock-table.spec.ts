import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LowStockTable } from './low-stock-table';

describe('LowStockTable', () => {
  let component: LowStockTable;
  let fixture: ComponentFixture<LowStockTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LowStockTable],
    }).compileComponents();

    fixture = TestBed.createComponent(LowStockTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
