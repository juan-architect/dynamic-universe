output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = module.ecs.alb_dns_name
}

output "database_endpoint" {
  description = "RDS database endpoint"
  value       = module.database.endpoint
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.redis.endpoint
}

output "account_id" {
  description = "Current AWS account ID"
  value       = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  description = "Current AWS region"
  value       = data.aws_region.current.name
}

# Optional: Don't output sensitive values in production
output "ssm_parameter_version" {
  description = "Version of the database URL parameter"
  value       = data.aws_ssm_parameter.database_url.version
}