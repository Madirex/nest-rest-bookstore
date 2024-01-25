import { Address } from 'src/common/address.entity'
export class ResponseShopDto {
  id: string
  name: string
  address: Address
  booksId: number[]
  clientsId: string[]
  createdAt: Date
  updatedAt: Date
}
