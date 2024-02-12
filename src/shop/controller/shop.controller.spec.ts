import { Test, TestingModule } from '@nestjs/testing'
import { ShopsController } from './shop.controller'
import { ShopsService } from '../services/shop.service'
import {Address} from "../../common/address.entity";
import {Book} from "../../books/entities/book.entity";
import {CategoryType} from "../../categories/entities/category.entity";
import {Client} from "../../client/entities/client.entity";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {ResponseShopDto} from "../dto/response-shop.dto";
import {Paginated} from "nestjs-paginate";
import {BadRequestException, NotFoundException} from "@nestjs/common";

describe('ShopController', () => {
  let controller: ShopsController
  let service: ShopsService

  const address: Address = {
    street: 'street',
    number: '2',
    city: 'city',
    province: 'province',
    country: 'country',
    postalCode: '28970',
  }

  const book = new Book();
  book.id = 1;
  book.name = 'El Quijote';
  book.author = 'Cervantes';
  book.publisher = {
    id: 1,
    name: 'Publisher',
    createdAt: new Date(),
    updatedAt: new Date(),
    books: null,
    image: 'publisher-image.jpg',
    active: true,
  }
  book.category = {
    id: 1,
    name: 'test',
    categoryType: CategoryType.OTHER,
    createdAt: new Date('2023-01-01T12:00:00Z'),
    updatedAt: new Date('2023-01-01T12:00:00Z'),
    isActive: true,
    books: [],
  }
  book.description = 'A book';
  book.price = 10;
  book.stock = 10;

  const client = new Client();
  client.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97'
  client.name = 'name'
  client.surname = 'surname'
  client.email = 'email@gmail.com'
  client.phone = '644441297'
  client.address = address

  const mockShopService = {
    findAllShops: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getByName: jest.fn(),
    getBooksByShopName: jest.fn(),
    getClientsByShopName: jest.fn(),
    addBookToShop: jest.fn(),
    addClientToShop: jest.fn(),
    removeBookFromShop: jest.fn(),
    removeClientFromShop: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopsController],
      providers: [
        {provide: ShopsService, useValue: mockShopService},
        {
          provide: CACHE_MANAGER,
          useValue: {},
        }
      ],
    }).compile()

    controller = module.get<ShopsController>(ShopsController)
    service = module.get<ShopsService>(ShopsService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    const shops = []
    const shopDto = new ResponseShopDto()

    beforeEach(() => {
      shopDto.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97';
      shopDto.name = 'Librería Pepito';
      shopDto.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
      };
      shopDto.booksId = [book.id];
      shopDto.clientsId = [client.id];

      shops.push(shopDto)
    })

    it('should return an array of shops', async () => {
      const resTest = new Paginated<ResponseShopDto>()
      resTest.data = shops

      const paginatedOptions = {
        page: 1,
        limit: 10,
        path: 'shop'
      }

      jest.spyOn(service, 'findAllShops').mockResolvedValue(resTest)

      const result: any = await controller.findAll(paginatedOptions)

      expect(result.data[0].id).toBe(shopDto.id)
      expect(result.data[0].name).toBe(shopDto.name)
      expect(result.data[0].address).toStrictEqual(shopDto.address)
      expect(result.data[0].booksId).toStrictEqual(shopDto.booksId)
      expect(result.data[0].clientsId).toStrictEqual(shopDto.clientsId)
    })
  })

  describe('findOne', () => {
    const shopDto = new ResponseShopDto()

    beforeEach(() => {
      shopDto.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97';
      shopDto.name = 'Librería Pepito';
      shopDto.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
      };
      shopDto.booksId = [book.id];
      shopDto.clientsId = [client.id];
    })

    it('should return a shop', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(shopDto)

      const result: any = await controller.findOne(shopDto.id)

      expect(result.id).toBe(shopDto.id)
      expect(result.name).toBe(shopDto.name)
      expect(result.address).toStrictEqual(shopDto.address)
      expect(result.booksId).toStrictEqual(shopDto.booksId)
      expect(result.clientsId).toStrictEqual(shopDto.clientsId)
    })

    it('should return not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null)

      const result: any =  controller.findOne(shopDto.id)

      await expect(result).rejects.toThrow(`Shop con ID: ${shopDto.id} no encontrada`)
    })

    it('should return id not valid', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new BadRequestException())
      const result: any =  controller.findOne('1')

      await expect(result).rejects.toThrow(BadRequestException)
    })
  })

    describe('create', () => {
        const shopDto = new ResponseShopDto()

        beforeEach(() => {
        shopDto.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97';
        shopDto.name = 'Librería Pepito';
        shopDto.address = {
            street: 'Calle de la piruleta',
            city: 'Candyland',
            postalCode: '12345',
            country: 'Spain',
            province: 'Candyland',
            number: '1',
        };
        shopDto.booksId = [book.id];
        shopDto.clientsId = [client.id];
        })

        it('should create a shop', async () => {
          jest.spyOn(service, 'create').mockResolvedValue(shopDto)

          const result: any = await controller.create(shopDto)

          expect(result.id).toBe(shopDto.id)
          expect(result.name).toBe(shopDto.name)
          expect(result.address).toStrictEqual(shopDto.address)
          expect(result.booksId).toStrictEqual(shopDto.booksId)
          expect(result.clientsId).toStrictEqual(shopDto.clientsId)
        })

        it('should return bad request name already exists', async () => {
          jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException())
          const result: any =  controller.create(shopDto)

          await expect(result).rejects.toThrow(BadRequestException)
        })
    })

  describe('update', () => {
    const shopDto = new ResponseShopDto()

    beforeEach(() => {
      shopDto.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97';
      shopDto.name = 'Librería Pepito';
      shopDto.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
      };
      shopDto.booksId = [book.id];
      shopDto.clientsId = [client.id];
    })

    it('should update a shop', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(shopDto)

      const result: any = await controller.update(shopDto.id, shopDto)

      expect(result.id).toBe(shopDto.id)
      expect(result.name).toBe(shopDto.name)
      expect(result.address).toStrictEqual(shopDto.address)
      expect(result.booksId).toStrictEqual(shopDto.booksId)
      expect(result.clientsId).toStrictEqual(shopDto.clientsId)
    })

    it('should return not found', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())

      const result: any =  controller.update(shopDto.id, shopDto)

      await expect(result).rejects.toThrow(NotFoundException)
    })

    it('should return id not valid', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new BadRequestException())
      const result: any =  controller.update('1', shopDto)

      await expect(result).rejects.toThrow(BadRequestException)
    })
  })

    describe('remove', () => {
        const shopDto = new ResponseShopDto()

        beforeEach(() => {
        shopDto.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97';
        shopDto.name = 'Librería Pepito';
        shopDto.address = {
            street: 'Calle de la piruleta',
            city: 'Candyland',
            postalCode: '12345',
            country: 'Spain',
            province: 'Candyland',
            number: '1',
        };
        shopDto.booksId = [book.id];
        shopDto.clientsId = [client.id];
        })

        it('should remove a shop', async () => {
        jest.spyOn(service, 'remove').mockResolvedValue(shopDto)

        const result: any = await controller.remove(shopDto.id)

        expect(result.id).toBe(shopDto.id)
        expect(result.name).toBe(shopDto.name)
        expect(result.address).toStrictEqual(shopDto.address)
        expect(result.booksId).toStrictEqual(shopDto.booksId)
        expect(result.clientsId).toStrictEqual(shopDto.clientsId)
        })

        it('should return not found', async () => {
        jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())

        const result: any =  controller.remove(shopDto.id)

        await expect(result).rejects.toThrow(NotFoundException)
        })

        it('should return id not valid', async () => {
        jest.spyOn(service, 'remove').mockRejectedValue(new BadRequestException())
        const result: any =  controller.remove('1')

        await expect(result).rejects.toThrow(BadRequestException)
        })
    })

    describe('getByName', () => {
        const shopDto = new ResponseShopDto()

        beforeEach(() => {
        shopDto.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97';
        shopDto.name = 'Librería Pepito';
        shopDto.address = {
            street: 'Calle de la piruleta',
            city: 'Candyland',
            postalCode: '12345',
            country: 'Spain',
            province: 'Candyland',
            number: '1',
        };
        shopDto.booksId = [book.id];
        shopDto.clientsId = [client.id];
        })

        it('should return a shop', async () => {
        jest.spyOn(service, 'getByName').mockResolvedValue(shopDto)

        const result: any = await controller.getByName(shopDto.name)

        expect(result.id).toBe(shopDto.id)
        expect(result.name).toBe(shopDto.name)
        expect(result.address).toStrictEqual(shopDto.address)
        expect(result.booksId).toStrictEqual(shopDto.booksId)
        expect(result.clientsId).toStrictEqual(shopDto.clientsId)
        })

        it('should return not found', async () => {
        jest.spyOn(service, 'getByName').mockRejectedValue(new NotFoundException())

        const result: any =  controller.getByName(shopDto.name)

        await expect(result).rejects.toThrow(NotFoundException)
        })

        it('should return id not valid', async () => {
        jest.spyOn(service, 'getByName').mockRejectedValue(new BadRequestException())
        const result: any =  controller.getByName('1')

        await expect(result).rejects.toThrow(BadRequestException)
        })
    })

    describe('getBooksByShopName', () => {

        it('should return an array of books', async () => {
            const books = [book]

            jest.spyOn(service, 'getBooksByShopName').mockResolvedValue(books)

            const result: any = await controller.getBooksByShopName('shop')

            expect(result[0].id).toBe(book.id)
            expect(result[0].name).toBe(book.name)
            expect(result[0].author).toBe(book.author)
            expect(result[0].publisher).toStrictEqual(book.publisher)
            expect(result[0].category).toStrictEqual(book.category)
            expect(result[0].description).toBe(book.description)
            expect(result[0].price).toBe(book.price)
            expect(result[0].stock).toBe(book.stock)
        })

        it('should return not found', async () => {
            jest.spyOn(service, 'getBooksByShopName').mockRejectedValue(new NotFoundException())

            const result: any =  controller.getBooksByShopName('shop')

            await expect(result).rejects.toThrow(NotFoundException)
        })

        it('should return id not valid', async () => {
            jest.spyOn(service, 'getBooksByShopName').mockRejectedValue(new BadRequestException())
            const result: any =  controller.getBooksByShopName('1')

            await expect(result).rejects.toThrow(BadRequestException)
        })
    })

    describe('getClientsByShopName', () => {

            it('should return an array of clients', async () => {
                const clients = [client]

                jest.spyOn(service, 'getClientsByShopName').mockResolvedValue(clients)

                const result: any = await controller.getClientsByShopName('shop')

                expect(result[0].id).toBe(client.id)
                expect(result[0].name).toBe(client.name)
                expect(result[0].surname).toBe(client.surname)
                expect(result[0].email).toBe(client.email)
                expect(result[0].phone).toBe(client.phone)
                expect(result[0].address).toStrictEqual(client.address)
            })

            it('should return not found', async () => {
                jest.spyOn(service, 'getClientsByShopName').mockRejectedValue(new NotFoundException())

                const result: any =  controller.getClientsByShopName('shop')

                await expect(result).rejects.toThrow(NotFoundException)
            })

            it('should return id not valid', async () => {
                jest.spyOn(service, 'getClientsByShopName').mockRejectedValue(new BadRequestException())
                const result: any =  controller.getClientsByShopName('1')

                await expect(result).rejects.toThrow(BadRequestException)
            })
    })

    describe('addBookToShop', () => {
      const shopDto = new ResponseShopDto()

      beforeEach(() => {
        shopDto.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97';
        shopDto.name = 'Librería Pepito';
        shopDto.address = {
          street: 'Calle de la piruleta',
          city: 'Candyland',
          postalCode: '12345',
          country: 'Spain',
          province: 'Candyland',
          number: '1',
        };
        shopDto.booksId = [book.id];
        shopDto.clientsId = [client.id];
      })

      it('should add a book to a shop', async () => {
          jest.spyOn(service, 'addBookToShop').mockResolvedValue(shopDto)

          const result: any = await controller.addBookToShop('shop', book.id)

          expect(result.id).toBe(shopDto.id)
          expect(result.name).toBe(shopDto.name)
          expect(result.address).toStrictEqual(shopDto.address)
          expect(result.booksId).toStrictEqual(shopDto.booksId)
          expect(result.clientsId).toStrictEqual(shopDto.clientsId)

      })

      it('should return not found', async () => {
          jest.spyOn(service, 'addBookToShop').mockRejectedValue(new NotFoundException())

          const result: any =  controller.addBookToShop('shop', book.id)

          await expect(result).rejects.toThrow(NotFoundException)
      })

      it('should return id not valid', async () => {
          jest.spyOn(service, 'addBookToShop').mockRejectedValue(new BadRequestException())
          const result: any =  controller.addBookToShop('1', book.id)

          await expect(result).rejects.toThrow(BadRequestException)
      })
    })

    describe('removeBookFromShop', () => {
        const shopDto = new ResponseShopDto()

        beforeEach(() => {
            shopDto.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97';
            shopDto.name = 'Librería Pepito';
            shopDto.address = {
            street: 'Calle de la piruleta',
            city: 'Candyland',
            postalCode: '12345',
            country: 'Spain',
            province: 'Candyland',
            number: '1',
            };
            shopDto.booksId = [book.id];
            shopDto.clientsId = [client.id];
        })

        it('should remove a book from a shop', async () => {
            jest.spyOn(service, 'removeBookFromShop').mockResolvedValue(shopDto)

            const result: any = await controller.removeBookFromShop('shop', book.id)

            expect(result.id).toBe(shopDto.id)
            expect(result.name).toBe(shopDto.name)
            expect(result.address).toStrictEqual(shopDto.address)
            expect(result.booksId).toStrictEqual(shopDto.booksId)
            expect(result.clientsId).toStrictEqual(shopDto.clientsId)

        })

        it('should return not found', async () => {
            jest.spyOn(service, 'removeBookFromShop').mockRejectedValue(new NotFoundException())

            const result: any =  controller.removeBookFromShop('shop', book.id)

            await expect(result).rejects.toThrow(NotFoundException)
        })

        it('should return id not valid', async () => {
            jest.spyOn(service, 'removeBookFromShop').mockRejectedValue(new BadRequestException())
            const result: any =  controller.removeBookFromShop('1', book.id)

            await expect(result).rejects.toThrow(BadRequestException)
        })
    })


    describe('addClientToShop', () => {
        const shopDto = new ResponseShopDto()

        beforeEach(() => {
            shopDto.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97';
            shopDto.name = 'Librería Pepito';
            shopDto.address = {
            street: 'Calle de la piruleta',
            city: 'Candyland',
            postalCode: '12345',
            country: 'Spain',
            province: 'Candyland',
            number: '1',
            };
            shopDto.booksId = [book.id];
            shopDto.clientsId = [client.id];
        })

        it('should add a client to a shop', async () => {
            jest.spyOn(service, 'addClientToShop').mockResolvedValue(shopDto)

            const result: any = await controller.addClientToShop('shop', client.id)

            expect(result.id).toBe(shopDto.id)
            expect(result.name).toBe(shopDto.name)
            expect(result.address).toStrictEqual(shopDto.address)
            expect(result.booksId).toStrictEqual(shopDto.booksId)
            expect(result.clientsId).toStrictEqual(shopDto.clientsId)

        })

        it('should return not found', async () => {
            jest.spyOn(service, 'addClientToShop').mockRejectedValue(new NotFoundException())

            const result: any =  controller.addClientToShop('shop', client.id)

            await expect(result).rejects.toThrow(NotFoundException)
        })

        it('should return id not valid', async () => {
            jest.spyOn(service, 'addClientToShop').mockRejectedValue(new BadRequestException())
            const result: any =  controller.addClientToShop('1', client.id)

            await expect(result).rejects.toThrow(BadRequestException)
        })
    })

    describe('removeClientFromShop', () => {
        const shopDto = new ResponseShopDto()

        beforeEach(() => {
            shopDto.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97';
            shopDto.name = 'Librería Pepito';
            shopDto.address = {
            street: 'Calle de la piruleta',
            city: 'Candyland',
            postalCode: '12345',
            country: 'Spain',
            province: 'Candyland',
            number: '1',
            };
            shopDto.booksId = [book.id];
            shopDto.clientsId = [client.id];
        })

        it('should remove a client from a shop', async () => {
            jest.spyOn(service, 'removeClientFromShop').mockResolvedValue(shopDto)

            const result: any = await controller.removeClientFromShop('shop', client.id)

            expect(result.id).toBe(shopDto.id)
            expect(result.name).toBe(shopDto.name)
            expect(result.address).toStrictEqual(shopDto.address)
            expect(result.booksId).toStrictEqual(shopDto.booksId)
            expect(result.clientsId).toStrictEqual(shopDto.clientsId)

        })

        it('should return not found', async () => {
            jest.spyOn(service, 'removeClientFromShop').mockRejectedValue(new NotFoundException())

            const result: any =  controller.removeClientFromShop('shop', client.id)

            await expect(result).rejects.toThrow(NotFoundException)
        })

        it('should return id not valid', async () => {
            jest.spyOn(service, 'removeClientFromShop').mockRejectedValue(new BadRequestException())
            const result: any =  controller.removeClientFromShop('1', client.id)

            await expect(result).rejects.toThrow(BadRequestException)
        })
    })
})
