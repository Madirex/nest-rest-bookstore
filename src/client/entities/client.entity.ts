import { Address } from '../../common/address.entity'
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('clients')
export class Client {
  static readonly IMAGE_DEFAULT = 'https://via.placeholder.com/150'

  @PrimaryColumn({ type: 'uuid' })
  id: string

  @Column('varchar', { length: 255, nullable: false })
  name: string

  @Column('varchar', { length: 255, nullable: false })
  surname: string

  @Column('varchar', { length: 255, nullable: false })
  email: string

  @Column('varchar', { length: 255, nullable: false })
  phone: string

  @Column(() => Address)
  address: Address

  @Column('varchar', {
    length: 255,
    nullable: false,
    default: Client.IMAGE_DEFAULT,
  })
  image: string

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column('timestamp', {
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date
}
