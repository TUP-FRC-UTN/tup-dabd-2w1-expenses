import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesKpiComponent } from './expenses-kpi.component';

describe('ExpensesKpiComponent', () => {
  let component: ExpensesKpiComponent;
  let fixture: ComponentFixture<ExpensesKpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesKpiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
