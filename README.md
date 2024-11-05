# Dynamic Universe - Starship Management System 🚀

A sophisticated GraphQL API built with NestJS and TypeORM that simulates a dynamic universe where starships, characters, and planets interact in a rich space-themed environment. The system provides comprehensive fleet management, character tracking, and planetary operations.

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0.0-red.svg)](https://nestjs.com/)
[![GraphQL](https://img.shields.io/badge/GraphQL-16.8.1-pink.svg)](https://graphql.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-0.3.17-orange.svg)](https://typeorm.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.0-blue.svg)](https://www.postgresql.org/)

## Table of Contents
- [Overview](#overview)
- [Core Features](#core-features)
- [Domain Model](#domain-model)
- [System Architecture](#system-architecture)
- [API Documentation](#api-documentation)
- [Installation & Setup](#installation--setup)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Overview

Dynamic Universe is an enterprise-grade starship management system that simulates a rich space environment where starships traverse between planets, characters embark on journeys, and complex space operations are managed through a robust GraphQL API.

### Core Features 🌟

#### Starship Management 🚀
- Fleet creation and management
- Passenger boarding and disembarking
- Travel between planets with distance calculations
- Enemy starship tracking and detection
- Cargo capacity management
- Current location tracking

#### Character System 👤
- Character creation and management
- Species and Force sensitivity tracking
- Home world and current location management
- Starship assignments
- Travel history

#### Planetary System 🌍
- Planet registration and management
- Climate and terrain tracking
- Population management
- Coordinates system for distance calculation
- Resident and native tracking

## Domain Model

### Entities and Relationships

#### Starship Entity
```typescript
class Starship {
  id: string;                    // Unique identifier
  name: string;                  // Starship name
  model?: string;                // Starship model
  cargoCapacity?: number;        // Cargo capacity in tons
  currentLocation?: Coordinates; // Current spatial coordinates
  currentStation?: Planet;       // Current stationed planet
  passengers?: Character[];      // Characters aboard
  enemies?: Starship[];         // Enemy starships
}
```

Key Features:
- Location tracking with coordinates
- Passenger management
- Enemy tracking
- Station management

#### Character Entity
```typescript
class Character {
  id: string;                // Unique identifier
  name: string;              // Character name
  species?: string;          // Species type
  isForceSensitive: boolean; // Force sensitivity indicator
  currentLocation?: Planet;  // Current planet location
  homeWorld?: Planet;        // Home planet
  starships?: Starship[];    // Associated starships
}
```

Key Features:
- Force sensitivity tracking
- Home world association
- Current location tracking
- Starship associations

#### Planet Entity
```typescript
class Planet {
  id: string;                    // Unique identifier
  name: string;                  // Planet name
  climate?: string;              // Climate description
  terrain?: string;              // Terrain description
  population?: number;           // Population count
  currentLocation?: Coordinates; // Spatial coordinates
  residents?: Character[];       // Current residents
  natives?: Character[];         // Native characters
  stationedStarships?: Starship[]; // Stationed starships
}
```

Key Features:
- Environmental characteristics
- Population tracking
- Resident management
- Starship docking

## System Architecture

### Technical Stack
```
┌─────────────────────────────────────────┐
│              GraphQL API                │
│  ┌─────────────┐      ┌─────────────┐  │
│  │   Queries   │      │  Mutations  │  │
│  └─────────────┘      └─────────────┘  │
├─────────────────────────────────────────┤
│           Business Logic Layer          │
│  ┌─────────────┐      ┌─────────────┐  │
│  │  Services   │      │  Resolvers  │  │
│  └─────────────┘      └─────────────┘  │
├─────────────────────────────────────────┤
│            Data Access Layer           │
│  ┌─────────────┐      ┌─────────────┐  │
│  │  TypeORM    │      │ PostgreSQL  │  │
│  └─────────────┘      └─────────────┘  │
└─────────────────────────────────────────┘
```

## Installation & Setup

1. Clone repository:
```bash
git clone https://github.com/juan-architect/dynamic-universe.git
cd dynamic-universe
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. Run migrations:
```bash
npm run typeorm migration:run
```

5. Start development server:
```bash
npm run start:dev
```

## Deployment

### AWS Infrastructure (Terraform)

```hcl
# VPC Configuration
module "vpc" {
  source = "./modules/vpc"
  name   = "dynamic-universe-vpc"
  cidr   = "10.0.0.0/16"
}

# ECS Fargate Configuration
module "ecs" {
  source = "./modules/ecs"
  name   = "dynamic-universe-cluster"
  vpc_id = module.vpc.vpc_id
}

# RDS Instance
module "rds" {
  source = "./modules/rds"
  name   = "dynamic-universe-db"
  engine_version = "14.0"
}
```

### Deploy Steps

1. Initialize Terraform:
```bash
cd terraform && terraform init
```

2. Apply infrastructure:
```bash
terraform apply
```

3. Deploy application:
```bash
docker build -t dynamic-universe .
docker push ${ECR_REPO}/dynamic-universe:latest
```

## Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Coverage report
npm run test:cov
```

## Project Structure
```
dynamic-universe/
├── src/
│   ├── characters/        # Character module
│   ├── common/           # Shared utilities
│   ├── entities/         # Domain entities
│   ├── interceptors/     # Request interceptors
│   ├── planets/         # Planet module
│   ├── starships/       # Starship module
│   └── main.ts          # Application entry
├── terraform/           # Infrastructure code
└── test/               # E2E tests
```

## Contact

**Principal Architect**: Juan Arias  
**Email**: juanariasmail@gmail.com  
**GitHub**: [@juan-architect](https://github.com/juan-architect)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---