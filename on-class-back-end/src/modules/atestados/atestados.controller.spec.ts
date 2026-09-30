import { Test, TestingModule } from '@nestjs/testing';
import { AtestadosController } from './atestados.controller.js';

describe('AtestadosController', () => {
  let controller: AtestadosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AtestadosController],
    }).compile();

    controller = module.get<AtestadosController>(AtestadosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
