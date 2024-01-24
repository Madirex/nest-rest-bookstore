import {
  Column,
  CreateDateColumn,
  Entity,
  // OneToMany, // Comentado ya que las relaciones están comentadas
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
//import { Book } from '../../books/entities/book.entity';
//import { Client } from '../../client/entities/client.entity';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string

  @Column({ name: 'address', type: 'varchar', length: 255 })
  address: string

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

  /*
  @OneToMany(() => Book, (book) => book.shop)
  books: Book[];

  @OneToMany(() => Client, (client) => client.shop)
  clients: Client[];
  */
}
