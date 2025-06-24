import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi"
import { cluster } from "../cluster";
import { appLoadBalancer, networkLoadBalancer } from "../load-balancer";
import { kongDockerImage } from "../images/kong";
import { ordersHttpListener } from './orders'
import { invoicesHttpListener } from './invoices'

const kongProxyHttpTargetGroup = appLoadBalancer.createTargetGroup('kongProxy-target', {
  port: 8000,
  protocol: 'HTTP',
  healthCheck: {
    path: '/orders/health',
    protocol: 'HTTP'
  }
})

export const kongProxyHttpListener = appLoadBalancer.createListener('kongProxy-listener', {
  port: 80,
  protocol: 'HTTP',
  targetGroup: kongProxyHttpTargetGroup
})

const adminKongHttpTargetGroup = appLoadBalancer.createTargetGroup('adminKong-target', {
  port: 8002,
  protocol: 'HTTP',
  healthCheck: {
    path: '/',
    protocol: 'HTTP'
  }
})

export const adminKongHttpListener = appLoadBalancer.createListener('adminKong-listener', {
  port: 8002,
  protocol: 'HTTP',
  targetGroup: adminKongHttpTargetGroup
})

const adminKongAPIHttpTargetGroup = appLoadBalancer.createTargetGroup('adminKongAPI-target', {
  port: 8001,
  protocol: 'HTTP',
  healthCheck: {
    path: '/',
    protocol: 'HTTP'
  }
})

export const adminKongAPIHttpListener = appLoadBalancer.createListener('adminKongAPI-listener', {
  port: 8001,
  protocol: 'HTTP',
  targetGroup: adminKongAPIHttpTargetGroup
})

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
        kongProxyHttpListener,
        adminKongHttpListener,
        adminKongAPIHttpListener
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