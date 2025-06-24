import * as pulumi from '@pulumi/pulumi'
import { ordersService } from './src/services/orders'
import { invoicesService } from './src/services/invoices'
import { appLoadBalancer } from './src/load-balancer'
import { rabbitMQService } from './src/services/rabbitmq'
import { kongService } from './src/services/kong'

export const ordersId = ordersService.service.id
export const invoicesId = invoicesService.service.id
export const rabbitMQId = rabbitMQService.service.id
export const rabbitMQAdminURL = pulumi.interpolate`http://${appLoadBalancer.listeners[0].endpoint.hostname}:15672`
export const kongId = kongService.service.id