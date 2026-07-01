# Platform Engineering IDP on GKE

## Overview

This repository contains an **Internal Developer Platform (IDP)** built using **Backstage** and deployed on **Google Kubernetes Engine (GKE)**.

The objective of this project is to provide a centralized developer portal that enables engineering teams to discover services, deploy applications, monitor workloads, access documentation, and perform self-service software provisioning through a unified interface.

The platform follows modern Platform Engineering practices using GitOps, Infrastructure as Code, Kubernetes, and cloud-native tooling.

---

# Architecture

```text
Developers
      │
      ▼
+---------------------------+
|       Backstage IDP       |
+---------------------------+
        │
        ├───────────────► Software Catalog
        ├───────────────► TechDocs
        ├───────────────► Scaffolder
        ├───────────────► Kubernetes
        ├───────────────► Argo CD
        ├───────────────► GitHub
        ├───────────────► Prometheus
        └───────────────► Grafana

                    │
                    ▼

        Google Kubernetes Engine
                    │
                    ▼

             CloudCart Platform
```

---

# Technology Stack

## Platform

* Backstage
* Google Kubernetes Engine (GKE)
* Kubernetes
* Helm
* Argo CD
* GitOps

## Cloud

* Google Cloud Platform
* Artifact Registry
* Cloud Load Balancer
* Cloud IAM

## CI/CD

* GitHub Actions
* Docker
* Helm Charts

## Infrastructure as Code

* Terraform

## Observability

* Prometheus
* Grafana
* Alertmanager

## Security

* Kyverno
* KubeArmor

## Documentation

* TechDocs
* MkDocs

---

# Repository Structure

```text
platform-engineering-idp/

├── backstage/
│   ├── packages/
│   ├── plugins/
│   ├── app-config.yaml
│   ├── app-config.production.yaml
│   ├── catalog-info.yaml
│   └── package.json
│
├── docs/
│
├── gitops/
│
├── helm/
│
├── terraform/
│
├── templates/
│
├── scripts/
│
└── README.md
```

---

# Features

* Developer Self-Service Portal
* Software Catalog
* Kubernetes Dashboard
* GitHub Integration
* Argo CD Integration
* Prometheus Metrics
* Grafana Dashboards
* Technical Documentation
* Service Templates
* GitOps Deployments
* Role-Based Access Control
* Production-Ready Deployment

---

# Prerequisites

* Node.js 22 LTS
* Yarn
* Docker
* kubectl
* Helm
* Git
* Google Cloud SDK

---

# Local Development

Clone the repository.

```bash
git clone <repository-url>
```

Navigate to the Backstage application.

```bash
cd backstage
```

Install dependencies.

```bash
yarn install
```

Start Backstage.

```bash
yarn start
```

Frontend

```
http://localhost:3000
```

Backend

```
http://localhost:7007
```

---

# Deployment Roadmap

## Module 1

* [x] Backstage Local Setup

## Module 2

* [ ] GitHub Authentication

## Module 3

* [ ] PostgreSQL Integration

## Module 4

* [ ] Dockerize Backstage

## Module 5

* [ ] Push Image to Artifact Registry

## Module 6

* [ ] Deploy Backstage on GKE

## Module 7

* [ ] Configure Google Cloud Load Balancer

## Module 8

* [ ] Kubernetes Plugin

## Module 9

* [ ] Argo CD Plugin

## Module 10

* [ ] GitHub Plugin

## Module 11

* [ ] Software Catalog

## Module 12

* [ ] Scaffolder Templates

## Module 13

* [ ] TechDocs

## Module 14

* [ ] Prometheus & Grafana Integration

## Module 15

* [ ] Logging Integration

## Module 16

* [ ] Production Hardening

---

# Existing Platform Components

The following platform services are already operational:

* Google Kubernetes Engine (GKE)
* Argo CD
* Prometheus
* Grafana
* Alertmanager
* Kyverno
* KubeArmor
* CloudCart Microservices
* GitHub Actions CI/CD
* Google Artifact Registry

Backstage will act as the central developer portal that integrates and manages these platform components.

---

# Future Enhancements

* Multi-cluster Kubernetes Support
* Multi-environment Deployments
* Service Ownership
* Cost Visibility
* Platform Analytics
* Incident Management
* AI-powered Developer Assistant
* Internal Developer Marketplace
* Golden Path Templates
* Platform Scorecards

---

# Learning Objectives

This project demonstrates hands-on experience with:

* Platform Engineering
* Internal Developer Platforms
* Kubernetes
* Google Cloud Platform
* GitOps
* Infrastructure as Code
* Continuous Delivery
* Cloud-Native Architecture
* Developer Experience
* Enterprise DevOps

---

# License

This project is licensed under the MIT License.

