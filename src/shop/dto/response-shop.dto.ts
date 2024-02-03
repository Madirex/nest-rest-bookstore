import { Address } from 'src/common/address.entity'

/**
 * DTO de respuesta de Shop
 */
export class ResponseShopDto {
  id: string
  name: string
  address: Address
  booksId: number[]
  clientsId: string[]
  createdAt: Date
  updatedAt: Date
}
