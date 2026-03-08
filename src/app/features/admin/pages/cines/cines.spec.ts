import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cines } from './cines';

describe('Cines', () => {
  let component: Cines;
  let fixture: ComponentFixture<Cines>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Cines]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cines);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
