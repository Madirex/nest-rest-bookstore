import { Address } from 'src/common/address.entity'

/**
 * ResponseClientDto
 */
export class ResponseClientDto {
  id: string
  name: string
  surname: string
  email: string
  phone: string
  address: Address
  image: string
  createdAt: Date
  updatedAt: Date
}
