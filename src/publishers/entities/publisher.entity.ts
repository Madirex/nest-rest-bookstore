import { Book } from '../../books/entities/book.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/**
 * @description Entidad de la editorial
 */
@Entity('publishers')
export class Publisher {
    static IMAGE_DEFAULT = 'default.png'

  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string

  @OneToMany(() => Book, (book: Book) => book.publisher)
  books: Set<Book>

  @Column({type: 'varchar', length: 255, default: Publisher.IMAGE_DEFAULT})
  image: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  active: boolean

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
}
