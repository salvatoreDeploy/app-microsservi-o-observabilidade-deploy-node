import { orders } from "./channels/order.ts";


orders.consume('orders', async message => {

  if (!message) {
    return null
  }

  console.log(message?.content.toString())

  orders.ack(message)
}, {
  // acknowledge => reconhcer
  noAck: false
})