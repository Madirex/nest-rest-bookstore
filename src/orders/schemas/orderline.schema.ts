import { Prop } from '@nestjs/mongoose'

export class OrderLine {
  @Prop({
    type: Number,
    required: true,
  })
  productId: number

  @Prop({
    type: Number,
    required: true,
  })
  price: number

  @Prop({
    type: Number,
    required: true,
  })
  quantity: number

  @Prop({
    type: Number,
    required: true,
  })
  total: number
}
