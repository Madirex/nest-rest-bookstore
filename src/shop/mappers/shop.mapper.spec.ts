import { Test, TestingModule } from '@nestjs/testing';
import { ShopMapper } from './shop.mapper';
import { CreateShopDto } from '../dto/create-shop.dto';
import { UpdateShopDto } from '../dto/update-shop.dto';
import { ResponseShopDto } from '../dto/response-shop.dto';
import { Shop } from '../entities/shop.entity';
import { Book } from '../../books/entities/book.entity';
import { Client } from '../../client/entities/client.entity';

describe('ShopMapper', () => {
    let mapper: ShopMapper;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ShopMapper],
        }).compile();

        mapper = module.get<ShopMapper>(ShopMapper);
    });

    it('should be defined', () => {
        expect(mapper).toBeDefined();
    });

    describe('toEntity', () => {
        it('should map CreateShopDto to Shop entity', () => {
            const createShopDto: CreateShopDto = {
                name: 'Shop Name',
                address: {
                    street: 'Street',
                    number: '123',
                    city: 'City',
                    province: 'Province',
                    country: 'Country',
                    postalCode: '12345',
                }
            };
            const books: Book[] = [];
            const clients: Client[] = [];

            const result = mapper.toEntity(createShopDto, books, clients);

            expect(result).toBeInstanceOf(Shop);
            expect(result.name).toBe(createShopDto.name.trim());
            expect(result.address).toBe(createShopDto.address);
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.updatedAt).toBeInstanceOf(Date);
            expect(result.books).toBe(books);
            expect(result.clients).toBe(clients);
        });
    });

    describe('mapUpdateToEntity', () => {
        it('should map UpdateShopDto to Shop entity', () => {
            const updateShopDto: UpdateShopDto = {
                name: 'Updated Shop Name',
                address: {
                    street: 'Street',
                    number: '123',
                    city: 'City',
                    province: 'Province',
                    country: 'Country',
                    postalCode: '12345',
                }
            };
            const entity: Shop = new Shop();
            entity.id = '123';
            entity.createdAt = new Date();
            entity.updatedAt = new Date();
            entity.name = 'Old Shop Name';
            entity.address = {
                street: 'Street',
                number: '123',
                city: 'City',
                province: 'Province',
                country: 'Country',
                postalCode: '12345',
            } ;
            const books: Book[] = [];
            const clients: Client[] = [];

            const result = mapper.mapUpdateToEntity(updateShopDto, entity, books, clients);

            expect(result).toBeInstanceOf(Shop);
            expect(result.id).toBe(entity.id);
            expect(result.createdAt).toBe(entity.createdAt);
            expect(result.updatedAt).toBeInstanceOf(Date);
            expect(result.name).toBe(updateShopDto.name.trim());
            expect(result.address).toBe(updateShopDto.address);
            expect(result.books).toBe(books);
            expect(result.clients).toBe(clients);
        });
    });

    describe('mapEntityToResponseDto', () => {
        it('should map Shop entity to ResponseShopDto', () => {
            const entity: Shop = new Shop();
            entity.id = '123';
            entity.createdAt = new Date();
            entity.updatedAt = new Date();
            entity.name = 'Shop Name';
            entity.address = {
                street: 'Street',
                number: '123',
                city: 'City',
                province: 'Province',
                country: 'Country',
                postalCode: '12345',
            } ;
            const books: Book[] = [new Book(), new Book()];
            const clients: Client[] = [new Client(), new Client()];
            entity.books = books;
            entity.clients = clients;

            const result = mapper.mapEntityToResponseDto(entity);

            expect(result).toBeInstanceOf(ResponseShopDto);
            expect(result.id).toBe(entity.id);
            expect(result.name).toBe(entity.name);
            expect(result.address).toBe(entity.address);
            expect(result.booksId).toEqual(books.map(book => book.id));
            expect(result.clientsId).toEqual(clients.map(client => client.id));
        });
    });
});
