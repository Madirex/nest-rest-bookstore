import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Address } from '../../common/address.entity'
import { Book } from '../../books/entities/book.entity'
import { Client } from '../../client/entities/client.entity'

/**
 * Entidad de Shop
 */
@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string

  @Column({ name: 'address', type: 'varchar', length: 255 })
  address: Address

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date

  @OneToMany(() => Book, (book) => book.shop)
  books: Book[]

  @OneToMany(() => Client, (client) => client.shop)
  clients: Client[]
}
