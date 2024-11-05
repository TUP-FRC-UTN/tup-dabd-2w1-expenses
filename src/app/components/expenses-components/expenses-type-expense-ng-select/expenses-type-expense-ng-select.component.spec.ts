import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesTypeExpenseNgSelectComponent } from './expenses-type-expense-ng-select.component';

describe('ExpensesTypeExpenseNgSelectComponent', () => {
  let component: ExpensesTypeExpenseNgSelectComponent;
  let fixture: ComponentFixture<ExpensesTypeExpenseNgSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesTypeExpenseNgSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesTypeExpenseNgSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
