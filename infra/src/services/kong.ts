import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi"
import { cluster } from "../cluster";
import { appLoadBalancer, networkLoadBalancer } from "../load-balancer";
import { kongDockerImage } from "../images/kong";
import { ordersHttpListener } from './orders'
import { invoicesHttpListener } from './invoices'

export const kongService = new awsx.classic.ecs.FargateService('microservice-fargate-kong', {
  cluster,
  desiredCount: 1,
  waitForSteadyState: false,
  taskDefinitionArgs: {
    container: {
      image: kongDockerImage.ref,
      cpu: 256,
      memory: 512,
      portMappings: [

      ],
      environment: [
        { name: 'KONG_DATABASE', value: 'off' },
        { name: 'KONG_ADMIN_LISTEN', value: '0.0.0.0:8001' },
        { name: 'ORDERS_SERVICE_URL', value: pulumi.interpolate`http://${ordersHttpListener.endpoint.hostname}:${ordersHttpListener.endpoint.port}` },
        { name: 'INVOICES_SERVICE_URL', value: pulumi.interpolate`http://${invoicesHttpListener.endpoint.hostname}:${invoicesHttpListener.endpoint.port}` }
      ]
    }
  }
})