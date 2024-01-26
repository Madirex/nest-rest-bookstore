import { Test, TestingModule } from '@nestjs/testing';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';

describe('ShopController', () => {
  let controller: ShopController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopController],
      providers: [ShopService],
    }).compile();

    controller = module.get<ShopController>(ShopController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
