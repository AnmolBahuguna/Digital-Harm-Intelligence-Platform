# Create DHIP Platform Directory Structure
Write-Host "Creating DHIP Platform directory structure..."

# Frontend directories
New-Item -ItemType Directory -Force -Path "frontend/src/components/CyberHeatmap"
New-Item -ItemType Directory -Force -Path "frontend/src/components/SMSDashboard"
New-Item -ItemType Directory -Force -Path "frontend/src/components/ThreatChecker"
New-Item -ItemType Directory -Force -Path "frontend/src/components/VoiceAnalyzer"
New-Item -ItemType Directory -Force -Path "frontend/src/pages"
New-Item -ItemType Directory -Force -Path "frontend/src/hooks"
New-Item -ItemType Directory -Force -Path "frontend/src/utils"
New-Item -ItemType Directory -Force -Path "frontend/src/i18n"
New-Item -ItemType Directory -Force -Path "frontend/src/styles"
New-Item -ItemType Directory -Force -Path "frontend/public"

# Backend directories
New-Item -ItemType Directory -Force -Path "backend/app/api/routes"
New-Item -ItemType Directory -Force -Path "backend/app/api/middleware"
New-Item -ItemType Directory -Force -Path "backend/app/api/validators"
New-Item -ItemType Directory -Force -Path "backend/app/services/threat_analysis"
New-Item -ItemType Directory -Force -Path "backend/app/services/sms_gateway"
New-Item -ItemType Directory -Force -Path "backend/app/services/auth"
New-Item -ItemType Directory -Force -Path "backend/app/services/reporting"
New-Item -ItemType Directory -Force -Path "backend/app/ai_models/temporal_mutation_detector"
New-Item -ItemType Directory -Force -Path "backend/app/ai_models/voice_deepfake"
New-Item -ItemType Directory -Force -Path "backend/app/ai_models/visual_similarity"
New-Item -ItemType Directory -Force -Path "backend/app/database/models"
New-Item -ItemType Directory -Force -Path "backend/app/database/migrations"
New-Item -ItemType Directory -Force -Path "backend/app/database/schemas"
New-Item -ItemType Directory -Force -Path "backend/app/cache"
New-Item -ItemType Directory -Force -Path "backend/app/tasks"
New-Item -ItemType Directory -Force -Path "backend/tests/unit"
New-Item -ItemType Directory -Force -Path "backend/tests/integration"
New-Item -ItemType Directory -Force -Path "backend/tests/fixtures"

# Infrastructure directories
New-Item -ItemType Directory -Force -Path "infrastructure/nginx"
New-Item -ItemType Directory -Force -Path "infrastructure/redis/cluster-config"
New-Item -ItemType Directory -Force -Path "infrastructure/monitoring/prometheus"
New-Item -ItemType Directory -Force -Path "infrastructure/monitoring/grafana/dashboards"
New-Item -ItemType Directory -Force -Path "infrastructure/terraform/aws"
New-Item -ItemType Directory -Force -Path "infrastructure/terraform/gcp"
New-Item -ItemType Directory -Force -Path "infrastructure/terraform/azure"
New-Item -ItemType Directory -Force -Path "infrastructure/kubernetes/deployments"
New-Item -ItemType Directory -Force -Path "infrastructure/kubernetes/services"
New-Item -ItemType Directory -Force -Path "infrastructure/kubernetes/configmaps"

# Load testing directories
New-Item -ItemType Directory -Force -Path "load-tests/jmeter"
New-Item -ItemType Directory -Force -Path "load-tests/k6"
New-Item -ItemType Directory -Force -Path "load-tests/results"

# Documentation directories
New-Item -ItemType Directory -Force -Path "docs/architecture"
New-Item -ItemType Directory -Force -Path "docs/api"
New-Item -ItemType Directory -Force -Path "docs/deployment"
New-Item -ItemType Directory -Force -Path "docs/research"

# Scripts directories
New-Item -ItemType Directory -Force -Path "scripts/setup"
New-Item -ItemType Directory -Force -Path "scripts/deployment"
New-Item -ItemType Directory -Force -Path "scripts/monitoring"

# GitHub workflows
New-Item -ItemType Directory -Force -Path ".github/workflows"

Write-Host "Directory structure created successfully!"
