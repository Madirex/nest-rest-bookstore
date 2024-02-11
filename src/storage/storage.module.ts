import { Module } from '@nestjs/common'
import { StorageService } from './storage.service'
import { StorageController } from './storage.controller'

/**
 * Módulo de almacenamiento
 */
@Module({
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
