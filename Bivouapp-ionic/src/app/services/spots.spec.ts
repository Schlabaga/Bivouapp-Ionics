import { TestBed } from '@angular/core/testing';

import { Spots } from './spots';

describe('Spots', () => {
  let service: Spots;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Spots);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
