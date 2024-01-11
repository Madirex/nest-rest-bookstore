import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Category } from '../../categories/entities/category.entity'

/**
 * Entity Book
 */
@Entity('books')
export class Book {
  static IMAGE_DEFAULT = 'empty.png'

  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string

  @Column({ name: 'author', type: 'varchar', length: 255 })
  author: string

  @Column({ name: 'publisher', type: 'varchar', length: 255 })
  publisher: string //TODO: hacer relación

  @ManyToOne(() => Category, (category) => category.books)
  @JoinColumn({ name: 'category_id' })
  category: Category

  @Column({ type: 'text', default: Book.IMAGE_DEFAULT })
  image: string

  @Column({ name: 'description', type: 'varchar', length: 255, default: '' })
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
