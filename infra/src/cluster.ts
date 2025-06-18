import * as awsx from "@pulumi/awsx";

// ECS + Fargate

export const cluster = new awsx.classic.ecs.Cluster('microservice-app-cluster')