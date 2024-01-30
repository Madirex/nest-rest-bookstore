import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { OrderLine } from './OrderLine'
import * as mongoosePaginate from 'mongoose-paginate-v2'

export type OrderDocument = Order & Document

@Schema({
  collection: 'pedidos',
  timestamps: false,
  versionKey: false,
  id: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v
      ret.id = ret._id
      delete ret._id
      delete ret._class
    },
  },
})
export class Order {
  @Prop({
    type: Number,
    required: true,
  })
  idUser: number

  @Prop({
    type: String,
    required: true,
  })
  idClient: string

  @Prop({
    required: true,
  })
  orderLines: OrderLine[]

  @Prop()
  totalItems: number

  @Prop()
  total: number

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date

  @Prop({ default: false })
  isDeleted: boolean
}

export const PedidoSchema = SchemaFactory.createForClass(Order)
PedidoSchema.plugin(mongoosePaginate)
