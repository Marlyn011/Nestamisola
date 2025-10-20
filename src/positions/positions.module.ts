// It imports DatabaseModule for DB access, provides PositionsService, and registers PositionsController.

import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PositionsController],
  providers: [PositionsService],
  exports: [PositionsService], // export for use in other modules if needed
})
export class PositionsModule {}