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
