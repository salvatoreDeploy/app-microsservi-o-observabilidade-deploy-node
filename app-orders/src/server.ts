import '@opentelemetry/auto-instrumentations-node/register'
import {trace} from '@opentelemetry/api'

import { fastify } from "fastify";
import { z } from 'zod'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { database } from "./db/client.ts";
import { schema } from "./db/schema/index.ts";
import { randomUUID } from "node:crypto";
import { sendOrderCreated } from "./broker/messages/order-created.ts";
import {setTimeout} from 'timers/promises'
import { tracer } from './tracer/tracer.ts';
import fastifyCors from '@fastify/cors';

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

// Escalonamento Horinzontal
// Deploy: Blue-green deployment

app.register(fastifyCors, { origin: '*' })

app.get('/health', () => {
  return 'OK'
})

app.post('/orders', {
  schema: {
    body: z.object({
      amount: z.coerce.number()
    })
  }
}, async (request, reply) => {
  
  const { amount } = request.body
  
  console.log('Creatind an order with amount', amount)

  const orderId = randomUUID()
  
  try {
    await database.insert(schema.orders).values({
      id: randomUUID(),
      customerId: '68bae8a8-44b0-43d7-8a49-cd62dade8814',
      amount
    })
  } catch (error) {
    console.log(error)
  }

  const obs = tracer.startSpan('eu acho que aqui tem gargalo')

  /* 

  // Como verificar se exite um gargalo em algum bloco de execução
  
  obs.setAttribute('TESTE', 'Verifcando aqui')

    await setTimeout(2000)

  obs.end() 
  
  */

  trace.getActiveSpan()?.setAttribute('order_id', orderId)

  sendOrderCreated({
    orderId,
    amount,
    customer: {
      id: '68bae8a8-44b0-43d7-8a49-cd62dade8814'
    }
  })

  return reply.status(200).send()
})

app.listen({ host: '0.0.0.0', port: 3333 }).then(() => {
  console.log('[Orders] HTTP Server running!')
})
