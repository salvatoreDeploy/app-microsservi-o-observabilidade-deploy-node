import { channels } from "../channels/index.ts";
import type {OrderCreateMessage} from '../../../../contracts/messages/order-create-message.ts'

export function sendOrderCreated(data: OrderCreateMessage) {
  channels.orders.sendToQueue('orders', Buffer.from(JSON.stringify({ data })))
}