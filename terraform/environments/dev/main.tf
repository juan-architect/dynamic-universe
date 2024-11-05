terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket = "dynamic-universe-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

module "networking" {
  source = "../../modules/networking"

  project_name         = var.project_name
  vpc_cidr            = var.vpc_cidr
  aws_region          = var.aws_region
  availability_zones  = var.availability_zones
  enable_nat_gateway  = true
  enable_vpc_flow_logs = true
  common_tags         = var.common_tags
}

module "database" {
  source = "../../modules/database"

  project_name    = var.project_name
  environment     = var.environment
  vpc_id         = module.networking.vpc_id
  private_subnets = module.networking.private_subnets

  allowed_security_groups = [module.ecs.ecs_security_group_id]

  database_name     = var.database_name
  database_username = var.database_username
  database_password = var.database_password

  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  multi_az         = var.environment == "production"

  enable_encryption = true
  enable_performance_insights = true
  monitoring_interval = 60

  backup_retention_period = var.db_backup_retention_days
  skip_final_snapshot    = var.environment != "production"

  common_tags = var.common_tags
}

module "cache" {
  source = "../../modules/cache"

  project_name    = var.project_name
  environment     = var.environment
  vpc_id         = module.networking.vpc_id
  private_subnets = module.networking.private_subnets

  allowed_security_groups = [module.ecs.ecs_security_group_id]

  node_type         = var.redis_node_type
  multi_az_enabled  = var.environment == "production"

  encryption_at_rest    = true
  encryption_in_transit = true

  snapshot_retention_limit = var.environment == "production" ? 7 : 1

  common_tags = var.common_tags
}

module "ecs" {
  source = "../../modules/ecs"

  project_name     = var.project_name
  environment      = var.environment
  aws_region       = var.aws_region
  vpc_id          = module.networking.vpc_id
  private_subnets = module.networking.private_subnets
  public_subnets  = module.networking.public_subnets

  container_image  = var.container_image
  container_port   = var.container_port
  container_cpu    = var.container_cpu
  container_memory = var.container_memory
  desired_count    = var.ecs_desired_count

  certificate_arn = var.certificate_arn

  database_url = "postgresql://${var.database_username}:${var.database_password}@${module.database.endpoint}/${var.database_name}"
  redis_url    = "redis://${module.cache.endpoint}:${module.cache.port}"

  enable_autoscaling = true
  min_capacity      = var.ecs_min_capacity
  max_capacity      = var.ecs_max_capacity

  health_check_path = var.health_check_path

  container_secrets = [
    {
      name      = "DATABASE_URL"
      valueFrom = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/${var.project_name}/${var.environment}/database-url"
    },
    {
      name      = "REDIS_URL"
      valueFrom = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/${var.project_name}/${var.environment}/redis-url"
    }
  ]

  common_tags = var.common_tags
}