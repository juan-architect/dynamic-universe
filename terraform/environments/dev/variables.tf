variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
}

variable "database_name" {
  description = "Name of the database"
  type        = string
}

variable "database_username" {
  description = "Database username"
  type        = string
  sensitive   = true
}

variable "database_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "Database instance class"
  type        = string
}

variable "db_allocated_storage" {
  description = "Allocated storage for database in GB"
  type        = number
}

variable "db_backup_retention_days" {
  description = "Number of days to retain database backups"
  type        = number
}

variable "container_image" {
  description = "Docker image to deploy"
  type        = string
}

variable "container_port" {
  description = "Port exposed by the container"
  type        = number
}

variable "container_cpu" {
  description = "CPU units for the container"
  type        = number
}

variable "container_memory" {
  description = "Memory for the container in MB"
  type        = number
}

variable "ecs_desired_count" {
  description = "Desired number of containers"
  type        = number
}

variable "ecs_min_capacity" {
  description = "Minimum number of containers"
  type        = number
}

variable "ecs_max_capacity" {
  description = "Maximum number of containers"
  type        = number
}

variable "health_check_path" {
  description = "Path for health checks"
  type        = string
}

variable "certificate_arn" {
  description = "ARN of SSL certificate"
  type        = string
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

# Optional: Add more Redis-specific variables if needed
variable "redis_multi_az" {
  description = "Enable Multi-AZ for Redis"
  type        = bool
  default     = true
}

variable "redis_snapshot_retention" {
  description = "Number of days to retain Redis snapshots"
  type        = number
  default     = 7
}
