variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment (e.g., production, staging)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "private_subnets" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "public_subnets" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "container_image" {
  description = "Docker image to run in the ECS cluster"
  type        = string
}

variable "container_port" {
  description = "Port exposed by the container"
  type        = number
  default     = 3000
}

variable "container_cpu" {
  description = "The number of cpu units to reserve for the container"
  type        = number
  default     = 256
}

variable "container_memory" {
  description = "The amount (in MiB) of memory to reserve for the container"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Desired number of containers"
  type        = number
  default     = 2
}

variable "health_check_path" {
  description = "Path for health checks"
  type        = string
  default     = "/health"
}

variable "certificate_arn" {
  description = "ARN of SSL certificate"
  type        = string
}

variable "database_url" {
  description = "Database connection URL"
  type        = string
  sensitive   = true
}

variable "redis_url" {
  description = "Redis connection URL"
  type        = string
  sensitive   = true
}

variable "container_secrets" {
  description = "List of secrets to pass to the container"
  type        = list(map(string))
  default     = []
}

variable "enable_autoscaling" {
  description = "Enable autoscaling"
  type        = bool
  default     = true
}

variable "min_capacity" {
  description = "Minimum number of tasks"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of tasks"
  type        = number
  default     = 4
}

variable "cpu_target_value" {
  description = "Target CPU utilization %"
  type        = number
  default     = 60
}

variable "memory_target_value" {
  description = "Target Memory utilization %"
  type        = number
  default     = 60
}

variable "log_retention_days" {
  description = "Number of days to retain logs"
  type        = number
  default     = 30
}

variable "common_tags" {
  description = "Common resource tags"
  type        = map(string)
  default     = {}
}