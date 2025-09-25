import { TestBed } from '@angular/core/testing';

import { GenericCrud } from './generic-crud';

describe('GenericCrud', () => {
  let service: GenericCrud;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenericCrud);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
