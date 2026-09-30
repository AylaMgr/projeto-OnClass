import { TestBed } from '@angular/core/testing';
import { Notificacoes } from './notificacoes';

describe('Notificacoes', () => {
  let service: Notificacoes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Notificacoes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
