import {Book} from "../../books/entities/book.entity";

export class ResponsePublisherDto {
    id: number
    name: string
    image: string
    books: Book[]
    createdAt: Date
    updatedAt: Date
    isActive: boolean
}