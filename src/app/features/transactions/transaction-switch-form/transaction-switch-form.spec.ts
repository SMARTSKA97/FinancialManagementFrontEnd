import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionSwitchForm } from './transaction-switch-form';

describe('TransactionSwitchForm', () => {
  let component: TransactionSwitchForm;
  let fixture: ComponentFixture<TransactionSwitchForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionSwitchForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionSwitchForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
