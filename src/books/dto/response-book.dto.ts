import { Exclude } from 'class-transformer'

/**
 * Clase DTO (Data Transfer Object) para recibir datos del libro
 */
export class ResponseBookDto {
  id: number

  name: string

  author: string

  publisherId: number

  @Exclude({ toPlainOnly: true, toClassOnly: true })
  category: string

  image: string

  description: string

  price: number

  stock: number

  createdAt: Date

  updatedAt: Date

  isActive: boolean
}
