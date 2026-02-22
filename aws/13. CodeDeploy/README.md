# 🚀 AWS CodeDeploy – Automating Application Deployment on EC2

use AWS CodeDeploy to automatically deploy a Dockerized Python application on an EC2 instance.

It is used as the deployment stage in our CI/CD pipeline after CodeBuild and CodePipeline.

---

## 📌 What is AWS CodeDeploy?

AWS CodeDeploy is a fully managed deployment service.

It helps us to:

- Automatically deploy applications
- Update running servers
- Manage deployment lifecycle
- Reduce downtime
- Roll back on failures

👉 In simple words: **CodeDeploy = Automated deployment manager**

It takes built artifacts and deploys them on servers.

---

## 🎯 Why Do We Use CodeDeploy?

Without CodeDeploy:

- ❌ Manual SSH deployment
- ❌ Manual container restart
- ❌ Human errors
- ❌ No rollback
- ❌ Not scalable

With CodeDeploy:

- ✅ Automatic deployment
- ✅ Controlled updates
- ✅ Zero/low downtime
- ✅ Integrated with CI/CD
- ✅ Production ready

That’s why CodeDeploy is used in real systems.

---

## 🧱 Step-by-Step Setup of AWS CodeDeploy

### Step 1: Create CodeDeploy Application

1. Go to AWS Console
2. Search → **CodeDeploy**
3. Click → **Create pipeline**

**Configuration**

```
Application Name: demo-app-deploy
Compute Platform: EC2/On-Premises
```

Click Create Application.

---

### Step 2: Launch and Prepare EC2 Instance

Launch an Ubuntu EC2 instance.

Make sure:

- ✅ Public IP enabled
- ✅ Security group allows SSH (22)
- ✅ Port 5000 allowed (for app)

---

### Step 3: Add Tag to EC2 Instance

Go to: `EC2 → Instances → Select Instance → Manage Tags`

Add:

```
Key: demo-app
Value: true
```

**Why Are Tags Important?**

CodeDeploy uses tags to:

- Identify target servers
- Select deployment instances
- Support scaling

Without tags → **CodeDeploy cannot find servers.**

---

### Step 4: Install CodeDeploy Agent on EC2

**Refer following Docs**

```
https://docs.aws.amazon.com/codedeploy/latest/userguide/codedeploy-agent-operations-install-ubuntu.html
```

SSH into instance:

```
ssh -i key.pem ubuntu@<public-ip>
```

Install Dependencies

```
sudo apt update
sudo apt install ruby-full
sudo apt install wget
```

```
cd /home/ubuntu
```

```
wget https://bucket-name.s3.region-identifier.amazonaws.com/latest/install
```

- bucket-name is the name of the Amazon S3 bucket that contains the CodeDeploy Resource Kit files for your region, and region-identifier is the identifier for your region.
- For example: `https://aws-codedeploy-us-east-2.s3.us-east-2.amazonaws.com/latest/install`
- For a list of bucket names and region identifiers, see Resource kit bucket names by Region. `https://docs.aws.amazon.com/codedeploy/latest/userguide/resource-kit.html#resource-kit-bucket-names`

```
chmod +x ./install
```

```
sudo ./install auto
```

check that the service is running

```
systemctl status codedeploy-agent
```

- If the CodeDeploy agent is installed and running, you should see a message like The `AWS CodeDeploy agent is running`
- If you see a message like `error: No AWS CodeDeploy agent running`, start the service and run the following two commands, one at a time:

```
systemctl start codedeploy-agent
```

```
systemctl status codedeploy-agent
```

**Why Agent Is Required?**

Agent is responsible for:

- Receiving deployment files
- Running scripts
- Reporting status to AWS

Without agent → **deployment will always fail.**

---

### Step 5: Create Required IAM Roles

CodeDeploy needs two IAM roles.

1️⃣ EC2 Instance Role

Create role:

```
Name: EC2-CodeDeploy-Role
```

Attach policies:

```
AmazonEC2RoleforAWSCodeDeploy
```

Why This Role?

Allows EC2 to:

- Download artifacts from S3
- Communicate with CodeDeploy
- Receive deployments

**Attach role to EC2 instance.**

2️⃣ CodeDeploy Service Role

Create role:

```
Name: CodeDeploy-Service-Role
```

Attach policy:

```
AWSCodeDeployRole
```

Why This Role?

Allows CodeDeploy service to:

- Manage deployments
- Access EC2
- Monitor status

---

### Step 6: Install Docker on EC2

Since application runs in container:

```
sudo apt install docker.io -y
sudo usermod -aG docker ubuntu
sudo systemctl restart docker
```

---

### Step 7: Create Deployment Group

Go to:

```
CodeDeploy → demo-app-deploy → Create Deployment Group
```

Configuration:

```
Deployment Group: demo-app
Service Role: CodeDeploy-Service-Role
Environment: EC2
Tag: demo-app = true
Load Balancer: Disabled
```

Click **Create**.

---

### Step 8: Add AppSpec File to Repository

Create file in repo root: `appspec.yml`

```yaml
version: 0.0
os: linux

hooks:
  ApplicationStop:
    - location: scripts/stop_container.sh
      timeout: 300
      runas: root

  AfterInstall:
    - location: scripts/start_container.sh
      timeout: 300
      timeout: 300
      runas: root
```

It tells CodeDeploy:

- Which scripts to run
- When to run them
- In which order

It controls deployment lifecycle.

---

### Step 9: Create Deployment Scripts

Inside repo:

```
scripts/
├── start_container.sh
└── stop_container.sh
```

**start_container.sh**

```bash
#!/bin/bash
set -e

docker pull rushikeshtele/simple-python-flask-app:latest

docker rm -f python-app || true

docker run -d \
  --name python-app \
  -p 5000:5000 \
  rushikeshtele/simple-python-flask-app:latest
```

**stop_container.sh**

```
#!/bin/bash
set -e

docker rm -f python-app || true
```

**Make Scripts Executable**

```
chmod +x scripts/\*.sh
git add .
git commit -m "Add CodeDeploy scripts"
git push origin main
```

---

### Step 10: Manual Deployment (Testing)

Go to: `CodeDeploy → Create Deployment`

Select:

```
Revision Type: GitHub
Repository: your-repo
Commit ID: latest
```

Click **Create Deployment**

This is for testing.

---

### Step 11: Integrate With CodePipeline

**Edit CodePipeline**

Add Stage:

```
Stage Name: Deploy
```

Add Action:

```
Provider: AWS CodeDeploy
Application: demo-app-deploy
Deployment Group: demo-app
Input Artifact: BuildArtifact
```

Save pipeline.

---

### 🔄 Automated Deployment Flow

After integration:

```bash
GitHub Push
    ↓
CodePipeline
    ↓
CodeBuild
    ↓
CodeDeploy
    ↓
   EC2
    ↓
Docker Container Updated
```

No manual deployment required.

---

### Common Errors and Fixes

| Problem           | Cause         | Solution         |
| ----------------- | ------------- | ---------------- |
| Agent not running | Not installed | Reinstall agent  |
| S3 access denied  | Missing IAM   | Add S3 policy    |
| Docker permission | No permission | Fix docker group |
| Image not found   | Wrong name    | Check Docker Hub |
| Script failed     | Permission    | chmod +x         |
