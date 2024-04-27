import { TestBed } from '@angular/core/testing';

import { KabumServiceService } from './kabum-service.service';

describe('KabumServiceService', () => {
  let service: KabumServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KabumServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
