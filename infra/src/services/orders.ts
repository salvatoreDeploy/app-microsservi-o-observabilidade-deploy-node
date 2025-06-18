import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi"
import { cluster } from "../cluster";
import { ordersDockerImage } from "../images/orders";
import { rabbitMQamqpListener } from "./rabbitmq";
import { appLoadBalancer } from "../load-balancer";

/* 
const config = new pulumi.Config("orders");
const dbUrl = config.requireSecret("DATABASE_PROD_URL"); 
*/


const ordersHttpTargetGroup = appLoadBalancer.createTargetGroup('orders-target', {
  port: 3333,
  protocol: 'HTTP',
  healthCheck: {
    path: '/health',
    protocol: 'HTTP'
  }
})

export const ordersHttpListener = appLoadBalancer.createListener('orders-listener', {
  port: 3333,
  protocol: 'HTTP',
  targetGroup: ordersHttpTargetGroup
})

export const ordersService = new awsx.classic.ecs.FargateService('microservice-fargate-orders', {
  cluster,
  desiredCount: 1,
  waitForSteadyState: false,
  taskDefinitionArgs: {
    container: {
      image: ordersDockerImage.ref,
      cpu: 256,
      memory: 512,
      portMappings: [
        ordersHttpListener
      ],
      environment: [
        {
          name: 'MESSAGING_BROKER_URL',
          value: pulumi.interpolate`amqp://admin:admin@${rabbitMQamqpListener.endpoint.hostname}:${rabbitMQamqpListener.endpoint.port}`
        },
        {
          name: 'DATABASE_PROD_URL',
          value: 'postgresql://docker:docker@localhost:5482/microservices-orders'
        },
       /*  
        {
          name: 'DATABASE_PROD_URL',
          value: pulumi.interpolate`${dbUrl}` // Usa o segredo de forma segura
        } 
        */
        {
          name: 'OTEL_SERVICE_NAME',
          value: 'orders'
        },
        {
          name: 'OTEL_NODE_ENABLED_INSTRUMENTATIONS',
          value: 'http,fastify,pg,amqplib'
        },
      ]
    }
  }
})

