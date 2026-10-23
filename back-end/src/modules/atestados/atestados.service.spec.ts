import { Test, TestingModule } from '@nestjs/testing';
import { AtestadosService } from './atestados.service.js';

describe('AtestadosService', () => {
  let service: AtestadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AtestadosService],
    }).compile();

    service = module.get<AtestadosService>(AtestadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
