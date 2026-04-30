import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyPerformanceChart } from './company-performance-chart';

describe('CompanyPerformanceChart', () => {
  let component: CompanyPerformanceChart;
  let fixture: ComponentFixture<CompanyPerformanceChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyPerformanceChart],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyPerformanceChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
