import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesRegisterCategoryExpenseComponent } from './expenses-register-category-expense.component';

describe('ExpensesRegisterCategoryExpenseComponent', () => {
  let component: ExpensesRegisterCategoryExpenseComponent;
  let fixture: ComponentFixture<ExpensesRegisterCategoryExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesRegisterCategoryExpenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesRegisterCategoryExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
