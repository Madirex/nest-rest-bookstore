import { Prop } from '@nestjs/mongoose'

/**
 * @description Schema for the orderline entity
 */
export class OrderlineSchema {
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
