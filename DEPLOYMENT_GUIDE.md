# 🚀 Blocmark Deployment Guide

## Overview
This guide will walk you through deploying Blocmark to GitHub and then to AWS App Runner.

## 📋 Prerequisites

### 1. GitHub Account
- [ ] GitHub account created
- [ ] Git installed locally
- [ ] SSH key configured (optional but recommended)

### 2. AWS Account
- [ ] AWS account with admin access
- [ ] AWS CLI installed and configured
- [ ] IAM user with App Runner permissions

## 🔧 Step 1: Prepare Your Local Repository

### 1.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Create .gitignore (if not exists)
```bash
# Environment files
.env
.env.local
.env.production

# Dependencies
node_modules/
dist/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db
```

## 🐙 Step 2: Push to GitHub

### 2.1 Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name: `blocmark`
4. Description: "Full-stack location sharing platform"
5. Make it **Private** (recommended for production apps)
6. Click "Create repository"

### 2.2 Push Your Code
```bash
git remote add origin https://github.com/YOUR_USERNAME/blocmark.git
git branch -M main
git push -u origin main
```

## ☁️ Step 3: AWS Setup

### 3.1 Install and Configure AWS CLI
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Configure AWS CLI
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter your output format (json)
```

### 3.2 Create IAM User for GitHub Actions
1. Go to AWS IAM Console
2. Create a new user: `github-actions-user`
3. Attach policy: `AWSAppRunnerFullAccess`
4. Create access keys and save them

### 3.3 Database (Neon - Already Configured!)
✅ **Your Neon database is already set up and ready!**
- **Endpoint**: `ep-calm-butterfly-ad2x6ugs-pooler.c-2.us-east-1.aws.neon.tech`
- **Database**: `neondb`
- **Username**: `neondb_owner`
- **SSL**: Required (already configured in connection string)

**Note**: Neon is serverless and automatically scales. No additional AWS RDS setup needed!

### 3.4 Set Up Secrets Manager
1. Go to AWS Secrets Manager
2. Create secrets for:
   - `blocmark/openai-api-key`
   - `blocmark/stripe-secret-key`
   - `blocmark/stripe-publishable-key`
   - `blocmark/google-maps-api-key`
   - `blocmark/postmark-api-key`

**Note**: Database URL is already configured in App Runner environment variables (Neon connection)

## 🔑 Step 4: Configure GitHub Secrets

### 4.1 Add Repository Secrets
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add these secrets:
   - `AWS_ACCESS_KEY_ID`: Your IAM user access key
   - `AWS_SECRET_ACCESS_KEY`: Your IAM user secret key
   - `APP_RUNNER_SERVICE_ARN`: Will be created after first deployment

## 🚀 Step 5: Deploy to AWS App Runner

### 5.1 First Deployment
1. Push to main branch
2. GitHub Actions will automatically deploy
3. Check Actions tab for deployment status

### 5.2 Get Service ARN
After first deployment:
```bash
aws apprunner list-services --region us-east-1
```
Copy the Service ARN and add it to GitHub secrets as `APP_RUNNER_SERVICE_ARN`

### 5.3 Configure Environment Variables
1. Go to AWS App Runner Console
2. Select your service
3. Configuration → Environment variables
4. Add all production environment variables

## 🔍 Step 6: Verify Deployment

### 6.1 Check Service Status
```bash
aws apprunner describe-service --service-arn YOUR_SERVICE_ARN
```

### 6.2 Test Your Application
1. Get your App Runner URL
2. Test all major features
3. Check logs for any errors

## 📊 Step 7: Monitoring and Maintenance

### 7.1 Set Up CloudWatch
- Monitor logs
- Set up alarms
- Track performance metrics

### 7.2 Update Environment Variables
- Use AWS Console or CLI
- Update secrets in Secrets Manager
- Redeploy when needed

## 🚨 Troubleshooting

### Common Issues:
1. **Build Failures**: Check GitHub Actions logs
2. **Environment Variables**: Verify in App Runner console
3. **Database Connection**: Check RDS security groups
4. **API Keys**: Verify secrets are properly configured

### Useful Commands:
```bash
# Check App Runner service status
aws apprunner describe-service --service-arn YOUR_ARN

# View service logs
aws logs describe-log-groups --log-group-name-prefix /aws/apprunner

# Update service
aws apprunner update-service --service-arn YOUR_ARN --source-configuration file://apprunner.yaml
```

## 🔄 Continuous Deployment

Your app will automatically deploy on every push to main branch. To deploy manually:

```bash
# Trigger deployment
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

## 📞 Support

- **GitHub Issues**: For code-related problems
- **AWS Support**: For infrastructure issues
- **App Runner Documentation**: [AWS App Runner Docs](https://docs.aws.amazon.com/apprunner/)

---

**🎯 Next Steps:**
1. Create GitHub repository
2. Push your code
3. Set up AWS infrastructure
4. Configure secrets
5. Deploy!

Good luck with your deployment! 🚀
