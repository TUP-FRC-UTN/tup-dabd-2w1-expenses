import { TestBed } from '@angular/core/testing';

import { KpiServiceService } from './kpi-service.service';

describe('KpiServiceService', () => {
  let service: KpiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KpiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
