resource "aws_security_group" "database" {
  name        = "${var.project_name}-db-sg"
  description = "Security group for RDS database"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL access from ECS tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    cidr_blocks     = []
    security_groups = var.allowed_security_groups
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-db-sg"
    }
  )
}

resource "aws_db_subnet_group" "database" {
  name        = "${var.project_name}-db-subnet-group"
  description = "Database subnet group for ${var.project_name}"
  subnet_ids  = var.private_subnets

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-db-subnet-group"
    }
  )
}

resource "aws_db_parameter_group" "database" {
  name        = "${var.project_name}-db-params"
  family      = "postgres14"
  description = "RDS parameter group for ${var.project_name}"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_duration"
    value = "1"
  }

  tags = var.common_tags
}

resource "aws_kms_key" "database" {
  count                   = var.enable_encryption ? 1 : 0
  description             = "KMS key for RDS database encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-db-kms-key"
    }
  )
}

resource "aws_db_instance" "database" {
  identifier = "${var.project_name}-db"

  engine         = "postgres"
  engine_version = var.engine_version
  instance_class = var.instance_class

  db_name  = var.database_name
  username = var.database_username
  password = var.database_password
  port     = 5432

  allocated_storage     = var.allocated_storage
  storage_type         = var.storage_type
  storage_encrypted    = var.enable_encryption
  kms_key_id          = var.enable_encryption ? aws_kms_key.database[0].arn : null

  vpc_security_group_ids = [aws_security_group.database.id]
  db_subnet_group_name   = aws_db_subnet_group.database.name
  parameter_group_name   = aws_db_parameter_group.database.name

  multi_az               = var.multi_az
  publicly_accessible    = false
  skip_final_snapshot    = var.skip_final_snapshot
  deletion_protection    = var.environment == "production"

  backup_retention_period = var.backup_retention_period
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window

  auto_minor_version_upgrade = true
  allow_major_version_upgrade = false

  performance_insights_enabled = var.enable_performance_insights
  monitoring_interval         = var.monitoring_interval
  monitoring_role_arn         = var.monitoring_interval > 0 ? aws_iam_role.rds_enhanced_monitoring[0].arn : null

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-db"
    }
  )
}

# Create IAM role for enhanced monitoring if enabled
resource "aws_iam_role" "rds_enhanced_monitoring" {
  count = var.monitoring_interval > 0 ? 1 : 0
  name  = "${var.project_name}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  count      = var.monitoring_interval > 0 ? 1 : 0
  role       = aws_iam_role.rds_enhanced_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}