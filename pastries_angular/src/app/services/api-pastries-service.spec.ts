import { TestBed } from '@angular/core/testing';

import { ApiPastriesService } from './api-pastries.service';

describe('PastriesService', () => {
  let service: ApiPastriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiPastriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
