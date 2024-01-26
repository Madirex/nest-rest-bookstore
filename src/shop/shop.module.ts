import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './controller/shop.controller';

@Module({
  controllers: [ShopController],
  providers: [ShopService],
})
export class ShopModule {}
