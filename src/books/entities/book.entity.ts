import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

/**
 * Entity Book
 */
@Entity('books')
export class Book {
  private static IMAGE_DEFAULT: 'https://www.madirex.com/favicon.ico'

  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string

  @Column({ name: 'author', type: 'varchar', length: 255 })
  author: string

  @Column({ name: 'publisher', type: 'varchar', length: 255 })
  publisher: string //TODO: hacer relación

  @Column({ name: 'category', type: 'varchar', length: 255 })
  category: string //TODO: hacer relación

  @Column({ type: 'text', default: Book.IMAGE_DEFAULT })
  image: string

  @Column({ name: 'description', type: 'varchar', length: 255 })
  description: string

  @Column({ type: 'double precision', default: 0.0 })
  price: number

  @Column({ type: 'integer', default: 0 })
  stock: number

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

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean
}
