import '@opentelemetry/auto-instrumentations-node/register'

import '../src/broker/subscriber.ts'

import { fastify } from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import fastifyCors from '@fastify/cors';

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: '*' })

app.get('/health', () => {
  return 'OK'
})

app.listen({ host: '0.0.0.0', port: 3334 }).then(() => {
  console.log('[Invoices] HTTP Server running!')
})
