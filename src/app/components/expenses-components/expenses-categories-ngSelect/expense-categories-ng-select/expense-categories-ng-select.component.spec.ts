import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCategoriesNgSelectComponent } from './expense-categories-ng-select.component';

describe('ExpenseCategoriesNgSelectComponent', () => {
  let component: ExpenseCategoriesNgSelectComponent;
  let fixture: ComponentFixture<ExpenseCategoriesNgSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseCategoriesNgSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseCategoriesNgSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
