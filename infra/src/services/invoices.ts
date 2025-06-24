import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi"
import { cluster } from "../cluster";
import { rabbitMQamqpListener } from "./rabbitmq";
import { appLoadBalancer } from "../load-balancer";
import { invoicesDockerImage } from "../images/invoices";

/* 
const config = new pulumi.Config("orders");
const dbUrl = config.requireSecret("DATABASE_PROD_URL"); 
*/


const invoicesHttpTargetGroup = appLoadBalancer.createTargetGroup('invoices-target', {
  port: 3334,
  protocol: 'HTTP',
  healthCheck: {
    path: '/health',
    protocol: 'HTTP'
  }
})

export const invoicesHttpListener = appLoadBalancer.createListener('invoices-listener', {
  port: 3334,
  protocol: 'HTTP',
  targetGroup: invoicesHttpTargetGroup
})

export const invoicesService = new awsx.classic.ecs.FargateService('microservice-fargate-invoices', {
  cluster,
  desiredCount: 1,
  waitForSteadyState: false,
  taskDefinitionArgs: {
    container: {
      image: invoicesDockerImage.ref,
      cpu: 256,
      memory: 512,
      portMappings: [
        invoicesHttpListener
      ],
      environment: [
        {
          name: 'MESSAGING_BROKER_URL',
          value: pulumi.interpolate`amqp://admin:admin@${rabbitMQamqpListener.endpoint.hostname}:${rabbitMQamqpListener.endpoint.port}`
        },
        {
          name: 'DATABASE_PROD_URL',
          value: 'postgresql://docker:docker@localhost:5482/microservices-invoices'
        },
       /*  
        {
          name: 'DATABASE_PROD_URL',
          value: pulumi.interpolate`${dbUrl}` // Usa o segredo de forma segura
        } 
        */
        {
          name: 'OTEL_SERVICE_NAME',
          value: 'invoices'
        },
        {
          name: 'OTEL_NODE_ENABLED_INSTRUMENTATIONS',
          value: 'http,fastify,pg,amqplib'
        },
      ]
    }
  }
})

