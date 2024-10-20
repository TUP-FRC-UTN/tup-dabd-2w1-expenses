import { TestBed } from '@angular/core/testing';

import { CategoryExpenseService } from './category-expense.service';

describe('CategoryExpenseService', () => {
  let service: CategoryExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
