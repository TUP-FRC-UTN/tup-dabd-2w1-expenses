import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseProvidersNgSelectComponent } from './expense-providers-ng-select.component';

describe('ExpenseProvidersNgSelectComponent', () => {
  let component: ExpenseProvidersNgSelectComponent;
  let fixture: ComponentFixture<ExpenseProvidersNgSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseProvidersNgSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseProvidersNgSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
