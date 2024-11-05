output "endpoint" {
  description = "The connection endpoint for the database"
  value       = aws_db_instance.database.endpoint
}

output "address" {
  description = "The hostname of the database instance"
  value       = aws_db_instance.database.address
}

output "port" {
  description = "The port the database is listening on"
  value       = aws_db_instance.database.port
}

output "database_name" {
  description = "The name of the database"
  value       = aws_db_instance.database.db_name
}

output "username" {
  description = "The master username for the database"
  value       = aws_db_instance.database.username
  sensitive   = true
}

output "security_group_id" {
  description = "The ID of the security group protecting the database"
  value       = aws_security_group.database.id
}

output "subnet_group_name" {
  description = "The name of the subnet group"
  value       = aws_db_subnet_group.database.name
}

output "parameter_group_name" {
  description = "The name of the parameter group"
  value       = aws_db_parameter_group.database.name
}

output "instance_id" {
  description = "The instance ID of the database"
  value       = aws_db_instance.database.id
}

output "arn" {
  description = "The ARN of the database instance"
  value       = aws_db_instance.database.arn
}

output "kms_key_arn" {
  description = "The ARN of the KMS key used for encryption"
  value       = var.enable_encryption ? aws_kms_key.database[0].arn : null
}

output "monitoring_role_arn" {
  description = "The ARN of the enhanced monitoring IAM role"
  value       = var.monitoring_interval > 0 ? aws_iam_role.rds_enhanced_monitoring[0].arn : null
}

output "backup_retention_period" {
  description = "The backup retention period"
  value       = aws_db_instance.database.backup_retention_period
}

output "multi_az" {
  description = "Whether the database is multi-AZ"
  value       = aws_db_instance.database.multi_az
}

output "performance_insights_enabled" {
  description = "Whether Performance Insights is enabled"
  value       = aws_db_instance.database.performance_insights_enabled
}