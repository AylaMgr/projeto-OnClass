import { Module } from '@nestjs/common';
import { AdminTiController } from './admin-ti.controller.js';
import { AdminTiService } from './admin-ti.service.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [AdminTiController],
  providers: [AdminTiService],
  exports: [AdminTiService],
})
export class AdminTiModule {}