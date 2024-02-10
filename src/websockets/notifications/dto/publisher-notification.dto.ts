import {Book} from "../../../books/entities/book.entity";

export class PublisherNotificationDto {
    constructor(
        public id: string,
        public name: string,
        public image: string,
        public books: Book[],
        public createdAt: string,
        public updatedAt: string,
        public isActive: boolean,
    ) {
    }
}