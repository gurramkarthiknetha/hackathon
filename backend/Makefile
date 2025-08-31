# FastAPI Backend Makefile

.PHONY: help install dev test clean docker-build docker-up docker-down seed-data

# Default target
help:
	@echo "Available commands:"
	@echo "  install      - Install dependencies"
	@echo "  dev          - Run development server"
	@echo "  test         - Run tests"
	@echo "  clean        - Clean cache and temporary files"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-up    - Start Docker containers"
	@echo "  docker-down  - Stop Docker containers"
	@echo "  seed-data    - Seed database with sample data"
	@echo "  test-email   - Test email functionality"

# Install dependencies
install:
	pip install -r requirements.txt

# Run development server
dev:
	uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload

# Run tests
test:
	pytest tests/ -v --cov=app --cov-report=html

# Clean cache and temporary files
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type f -name ".coverage" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name "htmlcov" -exec rm -rf {} +

# Docker commands
docker-build:
	docker build -t fastapi-backend .

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f backend

# Database seeding
seed-data:
	python -m app.scripts.seed_monitoring

# Test email functionality
test-email:
	python -m app.scripts.test_email

# Development with auto-reload and debug
dev-debug:
	uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload --log-level debug

# Production server
prod:
	uvicorn app.main:app --host 0.0.0.0 --port 5000 --workers 4

# Format code
format:
	black app/ tests/
	isort app/ tests/

# Lint code
lint:
	flake8 app/ tests/
	mypy app/

# Security check
security:
	bandit -r app/

# Generate requirements.txt from current environment
freeze:
	pip freeze > requirements.txt

# Create migration
migrate:
	python -m app.scripts.migrate

# Backup database
backup:
	mongodump --uri="mongodb://localhost:27017/auth_tutorial" --out=backups/$(shell date +%Y%m%d_%H%M%S)

# Restore database
restore:
	@echo "Usage: make restore BACKUP_DIR=backups/20231201_120000"
	@if [ -z "$(BACKUP_DIR)" ]; then echo "Please specify BACKUP_DIR"; exit 1; fi
	mongorestore --uri="mongodb://localhost:27017/auth_tutorial" $(BACKUP_DIR)/auth_tutorial
