import { broker } from "../client.ts";

export const orders = await broker.createChannel()

await orders.assertQueue('orders')