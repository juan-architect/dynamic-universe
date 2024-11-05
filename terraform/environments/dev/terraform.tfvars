# General
project_name = "dynamic-universe"
environment  = "development"
aws_region   = "us-east-1"

# Networking
vpc_cidr           = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]

# Database
database_name           = "dynamicuniverse"
database_username       = "admin"
database_password       = "your-secure-password" # Should be in AWS Secrets Manager
db_instance_class      = "db.t3.medium"
db_allocated_storage   = 50
db_backup_retention_days = 7

# Redis
redis_node_type = "cache.t3.micro" # Use larger instance for production

# ECS
container_image  = "your-account.dkr.ecr.us-east-1.amazonaws.com/dynamic-universe:latest"
container_port   = 3000
container_cpu    = 512
container_memory = 1024
ecs_desired_count = 2
ecs_min_capacity = 1
ecs_max_capacity = 4
health_check_path = "/health"

# SSL Certificate
certificate_arn = "arn:aws:acm:us-east-1:your-account:certificate/your-cert-id"

# Tags
common_tags = {
  Environment = "production"
  Project     = "dynamic-universe"
  Terraform   = "true"
  Owner       = "your-team"
}

# Redis Configuration
redis_node_type = "cache.t3.micro"  # Use larger instance for production