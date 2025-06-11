import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker-build"

// Creating ECR - Elastic Container Registre

const ordersECRRepository = new awsx.ecr.Repository('microservice-orders-ecr', {
  forceDelete: true
})

const ordersECRToken = aws.ecr.getAuthorizationTokenOutput({
  registryId: ordersECRRepository.repository.registryId
})

// Biuld da Imagem - Privado

export const ordersDockerImage = new docker.Image('microservice-orders-image', {
  tags: [
    pulumi.interpolate`${ordersECRRepository.repository.repositoryUrl}:latest`
  ],
  context: {
    location: '../app-orders'
  },
  push: true,
  platforms: [
    'linux/amd64'
  ],
  registries: [
    {
      address: ordersECRRepository.repository.repositoryUrl,
      username: ordersECRToken.userName,
      password: ordersECRToken.password
    }
  ]
})

// ECS + Fargate

const cluster = new awsx.classic.ecs.Cluster('microservice-app-cluster')

const ordersService = new awsx.classic.ecs.FargateService('microservice-fargate-orders', {
  cluster,
  desiredCount: 1,
  waitForSteadyState: false,
  taskDefinitionArgs: {
    container: {
      image: ordersDockerImage.ref,
      cpu: 256,
      memory: 512
    }
  }
})
