import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnaliseSolicitacaoCard } from './analise-solicitacao-card';

describe('AnaliseSolicitacaoCard', () => {
  let component: AnaliseSolicitacaoCard;
  let fixture: ComponentFixture<AnaliseSolicitacaoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnaliseSolicitacaoCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AnaliseSolicitacaoCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
