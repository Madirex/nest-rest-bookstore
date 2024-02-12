import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Book } from '../../books/entities/book.entity'

/**
 * @description Enumeración de los tipos de categorías
 */
export enum CategoryType {
  SERIES = 'SERIES',
  DISNEY = 'DISNEY',
  SUPERHEROS = 'SUPERHEROS',
  MOVIE = 'MOVIE',
  OTHER = 'OTHER',
}

/**
 * @description Entidad de la categoría
 */
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    name: 'category_type',
    type: 'enum',
    enum: CategoryType,
    default: CategoryType.OTHER,
  })
  categoryType: CategoryType

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string

  @OneToMany(() => Book, (book: Book) => book.category)
  books: Book[]

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
