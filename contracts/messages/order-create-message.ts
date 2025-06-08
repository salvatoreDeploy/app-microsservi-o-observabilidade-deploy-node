export interface OrderCreateMessage{
  orderId: string
  amount: number
  customer: {
    id: string
  }
}