variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment (e.g., production, staging)"
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

variable "allowed_security_groups" {
  description = "List of security group IDs allowed to access Redis"
  type        = list(string)
  default     = []
}

variable "node_type" {
  description = "ElastiCache instance type"
  type        = string
  default     = "cache.t3.micro"
}

variable "engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "6.x"
}

variable "multi_az_enabled" {
  description = "Enable Multi-AZ deployment with automatic failover"
  type        = bool
  default     = false
}

variable "maintenance_window" {
  description = "Preferred maintenance window"
  type        = string
  default     = "sun:05:00-sun:06:00"
}

variable "snapshot_window" {
  description = "Time window when automated snapshots are created"
  type        = string
  default     = "03:00-04:00"
}

variable "snapshot_retention_limit" {
  description = "Number of days for which ElastiCache retains automatic snapshots"
  type        = number
  default     = 7
}

variable "encryption_at_rest" {
  description = "Enable encryption at rest"
  type        = bool
  default     = true
}

variable "encryption_in_transit" {
  description = "Enable encryption in transit"
  type        = bool
  default     = true
}

variable "common_tags" {
  description = "Common resource tags"
  type        = map(string)
  default     = {}
}