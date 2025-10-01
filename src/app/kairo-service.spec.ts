import { TestBed } from '@angular/core/testing';

import { KairoService } from './kairo-service';

describe('KairoService', () => {
  let service: KairoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KairoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
