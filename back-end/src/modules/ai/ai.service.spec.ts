import { Test, TestingModule } from '@nestjs/testing';
import { IaService } from './ai.service.js';

describe('AiService', () => {
  let service: IaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IaService],
    }).compile();

    service = module.get<IaService>(IaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
