output "endpoint" {
  description = "Redis primary endpoint"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "reader_endpoint" {
  description = "Redis reader endpoint"
  value       = aws_elasticache_replication_group.redis.reader_endpoint_address
}

output "port" {
  description = "Redis port"
  value       = aws_elasticache_replication_group.redis.port
}

output "security_group_id" {
  description = "ID of the Redis security group"
  value       = aws_security_group.redis.id
}

output "parameter_group_id" {
  description = "ID of the Redis parameter group"
  value       = aws_elasticache_parameter_group.redis.id
}

output "subnet_group_name" {
  description = "Name of the Redis subnet group"
  value       = aws_elasticache_subnet_group.redis.name
}

output "replication_group_id" {
  description = "ID of the Redis replication group"
  value       = aws_elasticache_replication_group.redis.id
}

output "replication_group_arn" {
  description = "ARN of the Redis replication group"
  value       = aws_elasticache_replication_group.redis.arn
}