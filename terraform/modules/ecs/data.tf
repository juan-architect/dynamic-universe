# Get current AWS account ID
data "aws_caller_identity" "current" {}

# Get current AWS region
data "aws_region" "current" {
  provider = aws
}

# Get AWS partition (aws, aws-cn, aws-us-gov)
data "aws_partition" "current" {}