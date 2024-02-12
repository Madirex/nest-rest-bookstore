import {INestApplication} from "@nestjs/common";
import {Address} from "../../../src/common/address.entity";
import {Book} from "../../../src/books/entities/book.entity";
import {CategoryType} from "../../../src/categories/entities/category.entity";
import {Client} from "../../../src/client/entities/client.entity";
import {Shop} from "../../../src/shop/entities/shop.entity";
import {CreateShopDto} from "../../../src/shop/dto/create-shop.dto";
import {UpdateShopDto} from "../../../src/shop/dto/update-shop.dto";
import {CacheInterceptor, CacheModule} from "@nestjs/cache-manager";
import {Test, TestingModule} from "@nestjs/testing";
import {ShopsController} from "../../../src/shop/controller/shop.controller";
import {ShopsService} from "../../../src/shop/services/shop.service";
import {JwtAuthGuard} from "../../../src/auth/guards/jwt-auth.guard";
import {RolesAuthGuard} from "../../../src/auth/guards/roles-auth.guard";
import * as request from 'supertest'
import {ResponseShopDto} from "../../../src/shop/dto/response-shop.dto";


describe('ShopsController (e2e)', () => {
    let app: INestApplication
    let cacheManager: Cache
    const endpoint = '/shops'
    const simulatedDate = new Date('2021-01-01T00:00:00.000Z')

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

    const shop = new Shop()
    shop.id = '7f1e1546-79e5-49d5-9b58-dc353ae82f97';
    shop.name = 'Librería Pepito';
    shop.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
    };
    shop.books = [book];
    shop.clients = [client];

    const shopDto = new ResponseShopDto()
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

    const createShopDto: CreateShopDto = new CreateShopDto()
    createShopDto.name = 'Librería Pepito';
    createShopDto.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
    };

    const updateShopDto: UpdateShopDto = new UpdateShopDto()
    updateShopDto.name = 'Librería Pepito';
    updateShopDto.address = {
        street: 'Calle de la piruleta',
        city: 'Candyland',
        postalCode: '12345',
        country: 'Spain',
        province: 'Candyland',
        number: '1',
    };

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
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [CacheModule.register()],
            controllers: [ShopsController],
            providers: [
                {
                    provide: ShopsService,
                    useValue: mockShopService,
                }
            ],
        })

            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideInterceptor(CacheInterceptor)
            .useValue({}).compile()

        app = moduleFixture.createNestApplication()
        await app.init()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(app).toBeDefined()
    })

    afterAll(async () => {
        await app.close()
    })

    describe('GET /shops', () => {
        it('should return all shops', async () => {
            jest.spyOn(mockShopService, 'findAllShops').mockResolvedValue([shopDto])
            const response = await request(app.getHttpServer())
                .get(endpoint)
                .expect(200)

            expect(response.body).toEqual([shopDto])
        })
    })

    describe('GET /shops/:id', () => {
        it('should return a shop', async () => {
            jest.spyOn(mockShopService, 'findOne').mockResolvedValue(shopDto)
            const response = await request(app.getHttpServer())
                .get(`${endpoint}/${shop.id}`)
                .expect(200)

            expect(response.body).toEqual(shopDto)
        })
    })


    describe('POST /shops', () => {
        it('should create a shop', async () => {
            jest.spyOn(mockShopService, 'create').mockResolvedValue(shopDto)
            const response = await request(app.getHttpServer())
                .post(endpoint)
                .send(createShopDto)
                .expect(201)

            expect(response.body).toEqual(shopDto)
        })
    })

    describe('PUT /shops/:id', () => {
        it('should update a shop', async () => {
            jest.spyOn(mockShopService, 'update').mockResolvedValue(shopDto)
            const response = await request(app.getHttpServer())
                .put(`${endpoint}/${shop.id}`)
                .send(updateShopDto)
                .expect(200)

            expect(response.body).toEqual(shopDto)
        })
    })

    describe('DELETE /shops/:id', () => {
        it('should delete a shop', async () => {
            jest.spyOn(mockShopService, 'remove').mockResolvedValue(shopDto)
            const response = await request(app.getHttpServer())
                .delete(`${endpoint}/${shop.id}`)
                .expect(204)

            expect(mockShopService.remove).toHaveBeenCalledWith(shop.id)
        })
    })



    describe('GET /shops/:name', () => {
        it('should return a shop', async () => {
            jest.spyOn(mockShopService, 'getByName').mockResolvedValue(shopDto)
            const response = await request(app.getHttpServer())
                .get(`${endpoint}/${shop.name}`)
                .expect(200)

            expect(response.body).toEqual(shopDto)
        })
    })

    describe('GET /shops/:name/books', () => {
        it('should return all books from a shop', async () => {
            jest.spyOn(mockShopService, 'getBooksByShopName').mockResolvedValue([book])
            const response = await request(app.getHttpServer())
                .get(`${endpoint}/${shop.name}/books`)
                .expect(200)

            expect(response.body[0].id).toBe(book.id)
        })
    })

    describe('GET /shops/:name/clients', () => {
        it('should return all clients from a shop', async () => {
            jest.spyOn(mockShopService, 'getClientsByShopName').mockResolvedValue([client])
            const response = await request(app.getHttpServer())
                .get(`${endpoint}/${shop.name}/clients`)
                .expect(200)

            expect(response.body).toEqual([client])
        })
    })


    describe('PATCH /shops/:id/books/:id', () => {
        it('should add a book to a shop', async () => {
            jest.spyOn(mockShopService, 'addBookToShop').mockResolvedValue(shopDto)
            const response = await request(app.getHttpServer())
                .patch(`${endpoint}/${shop.id}/books/${book.id}`)
                .expect(200)

            expect(response.body).toEqual(shopDto)
        })
    })

    describe('PATCH /shops/:id/clients/:id', () => {
        it('should add a client to a shop', async () => {
            jest.spyOn(mockShopService, 'addClientToShop').mockResolvedValue(shopDto)
            const response = await request(app.getHttpServer())
                .patch(`${endpoint}/${shop.id}/clients/${client.id}`)
                .expect(200)

            expect(response.body).toEqual(shopDto)
        })
    })

    describe('DELETE /shops/:id/books/:id', () => {
        it('should remove a book from a shop', async () => {
            jest.spyOn(mockShopService, 'removeBookFromShop').mockResolvedValue(shopDto)
            const response = await request(app.getHttpServer())
                .delete(`${endpoint}/${shop.id}/books/${book.id}`)
                .expect(200)

            expect(mockShopService.removeBookFromShop).toHaveBeenCalledWith(shop.id, book.id)
        })
    })

    describe('DELETE /shops/:id/clients/:id', () => {
        it('should remove a client from a shop', async () => {
            jest.spyOn(mockShopService, 'removeClientFromShop').mockResolvedValue(shopDto)
            const response = await request(app.getHttpServer())
                .delete(`${endpoint}/${shop.id}/clients/${client.id}`)
                .expect(200)

            expect(mockShopService.removeClientFromShop).toHaveBeenCalledWith(shop.id, client.id)
        })
    })

})