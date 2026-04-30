import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryDistributionChart } from './category-distribution-chart';

describe('CategoryDistributionChart', () => {
  let component: CategoryDistributionChart;
  let fixture: ComponentFixture<CategoryDistributionChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryDistributionChart],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryDistributionChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
