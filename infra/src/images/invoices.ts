import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker-build"

// Creating ECR - Elastic Container Registre

const invoicesECRRepository = new awsx.ecr.Repository('microservice-invoices-ecr', {
  forceDelete: true
})

const invoicesECRToken = aws.ecr.getAuthorizationTokenOutput({
  registryId: invoicesECRRepository.repository.registryId
})

// Biuld da Imagem - Privado

export const invoicesDockerImage = new docker.Image('microservice-invoices-image', {
  tags: [
    pulumi.interpolate`${invoicesECRRepository.repository.repositoryUrl}:latest`
  ],
  context: {
    location: '../app-invoices'
  },
  push: true,
  platforms: [
    'linux/amd64'
  ],
  registries: [
    {
      address: invoicesECRRepository.repository.repositoryUrl,
      username: invoicesECRToken.userName,
      password: invoicesECRToken.password
    }
  ]
})
