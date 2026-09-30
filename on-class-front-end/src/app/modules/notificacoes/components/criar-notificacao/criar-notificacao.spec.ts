import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriarNotificacao } from './criar-notificacao';

describe('CriarNotificacao', () => {
  let component: CriarNotificacao;
  let fixture: ComponentFixture<CriarNotificacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarNotificacao]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CriarNotificacao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
