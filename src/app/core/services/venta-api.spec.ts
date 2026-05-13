import { TestBed } from '@angular/core/testing';

import { VentaApi } from './venta-api';

describe('VentaApi', () => {
  let service: VentaApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VentaApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
