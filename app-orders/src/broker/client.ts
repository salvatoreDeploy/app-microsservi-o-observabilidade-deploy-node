import amqp from 'amqplib'

if (!process.env.MESSAGING_BROKER_URL) {
  throw new Error('ESSAGING_BROKER_URL must be configured error!')
}

export const broker = await amqp.connect(process.env.MESSAGING_BROKER_URL)