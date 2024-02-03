import { Prop } from '@nestjs/mongoose'

export class Direction {
  @Prop({
    type: String,
    required: true,
    length: 100,
    default: '',
  })
  street: string

  @Prop({
    type: String,
    required: true,
    length: 50,
    default: '',
  })
  number: string

  @Prop({
    type: String,
    required: true,
    length: 100,
    default: '',
  })
  city: string

  @Prop({
    type: String,
    required: true,
    length: 100,
    default: '',
  })
  province: string

  @Prop({
    type: String,
    required: true,
    length: 100,
    default: '',
  })
  country: string

  @Prop({
    type: String,
    required: true,
    length: 100,
    default: '',
  })
  postalCode: string
}
