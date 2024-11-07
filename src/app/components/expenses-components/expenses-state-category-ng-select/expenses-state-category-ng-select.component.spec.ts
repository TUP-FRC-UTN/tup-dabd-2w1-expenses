import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesStateCategoryNgSelectComponent } from './expenses-state-category-ng-select.component';

describe('ExpensesStateCategoryNgSelectComponent', () => {
  let component: ExpensesStateCategoryNgSelectComponent;
  let fixture: ComponentFixture<ExpensesStateCategoryNgSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesStateCategoryNgSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesStateCategoryNgSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
