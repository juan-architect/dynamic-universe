# Get current AWS account ID
data "aws_caller_identity" "current" {}

# Optional: Get current AWS region
data "aws_region" "current" {}

# Optional: Get AWS partition (e.g., aws, aws-cn, aws-us-gov)
data "aws_partition" "current" {}

# If you're using SSM parameters, you might want to verify they exist:
data "aws_ssm_parameter" "database_url" {
  name = "/${var.project_name}/${var.environment}/database-url"
}

data "aws_ssm_parameter" "redis_url" {
  name = "/${var.project_name}/${var.environment}/redis-url"
}