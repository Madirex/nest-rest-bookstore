import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Book } from '../../books/entities/book.entity'

@Entity('publishers')
export class Publisher {
    static IMAGE_DEFAULT = 'default.png'

    @PrimaryGeneratedColumn()
    id: number

    @Column({name: 'name', type: 'varchar', length: 255})
    name: string

    @Column({type: 'text', default: Publisher.IMAGE_DEFAULT})
    image: string

    @OneToMany(() => Book, (book) => book.publisher)
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