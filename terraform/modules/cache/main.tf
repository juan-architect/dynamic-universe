resource "aws_security_group" "redis" {
  name        = "${var.project_name}-redis-sg"
  description = "Security group for Redis cluster"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Redis access from ECS tasks"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
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
      Name = "${var.project_name}-redis-sg"
    }
  )
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.project_name}-redis-subnet-group"
  subnet_ids = var.private_subnets

  tags = var.common_tags
}

resource "aws_elasticache_parameter_group" "redis" {
  family = "redis6.x"
  name   = "${var.project_name}-redis-params"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  tags = var.common_tags
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "${var.project_name}-redis"
  description               = "Redis cluster for ${var.project_name}"
  node_type                 = var.node_type
  port                      = 6379
  parameter_group_name      = aws_elasticache_parameter_group.redis.name
  subnet_group_name         = aws_elasticache_subnet_group.redis.name
  security_group_ids        = [aws_security_group.redis.id]
  automatic_failover_enabled = var.multi_az_enabled
  num_cache_clusters        = var.multi_az_enabled ? 2 : 1

  engine                    = "redis"
  engine_version           = var.engine_version

  maintenance_window       = var.maintenance_window
  snapshot_window         = var.snapshot_window
  snapshot_retention_limit = var.snapshot_retention_limit

  at_rest_encryption_enabled = var.encryption_at_rest
  transit_encryption_enabled = var.encryption_in_transit

  auto_minor_version_upgrade = true
  apply_immediately         = var.environment != "production"

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-redis"
    }
  )
}