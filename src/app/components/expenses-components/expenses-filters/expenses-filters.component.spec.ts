import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesFiltersComponent } from './expenses-filters.component';

describe('ExpensesFiltersComponent', () => {
  let component: ExpensesFiltersComponent;
  let fixture: ComponentFixture<ExpensesFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
