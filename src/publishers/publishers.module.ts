import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Book} from "../books/entities/book.entity";
import {StorageModule} from "../storage/storage.module";
import {NotificationsModule} from "../websockets/notifications/notifications.module";
import {CacheModule} from "@nestjs/cache-manager";
import {Publisher} from "./entities/publisher.entity";
import {PublishersController} from "./controller/publishers.controller";
import {PublishersService} from "./service/publishers.service";
import {PublisherMapper} from "./mappers/publisher.mapper";

@Module({
    imports: [
        TypeOrmModule.forFeature([Publisher]),
        TypeOrmModule.forFeature([Book]),
        StorageModule,
        NotificationsModule,
        CacheModule.register(),
    ],
    controllers: [PublishersController],
    providers: [PublishersService, PublisherMapper],
})
export class PublishersModule {}