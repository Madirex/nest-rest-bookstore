import { Column } from 'typeorm'

/**
 * Address entity
 */
export class Address {
  @Column('varchar', { length: 255, nullable: false })
  street: string

  @Column('varchar', { length: 20, nullable: false })
  number: string

  @Column('varchar', { length: 255, nullable: false })
  city: string

  @Column('varchar', { length: 255, nullable: false })
  province: string

  @Column('varchar', { length: 255, nullable: false })
  country: string

  @Column('varchar', { length: 6, nullable: false })
  postalCode: string
}
