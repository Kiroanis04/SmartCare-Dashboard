import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchComparsion } from './branch-comparsion';

describe('BranchComparsion', () => {
  let component: BranchComparsion;
  let fixture: ComponentFixture<BranchComparsion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchComparsion],
    }).compileComponents();

    fixture = TestBed.createComponent(BranchComparsion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
