# 🚀 AWS CodePipeline -- Automating Our Build

Use AWS CodePipeline to automate the build
and deployment of our Dockerized Python application.

---

## 📌 What is AWS CodePipeline?

AWS CodePipeline is a fully managed CI/CD orchestration service.

It helps us to:

- Detect code changes automatically
- Trigger build process
- Pass artifact between stages
- Deploy applications
- Automate the entire pipeline

👉 In simple words: **CodePipeline = Automation engine of CI/CD**

It connects all services like GitHub, CodeBuild, and CodeDeploy.

---

## 🎯 Why Do We Use CodePipeline?

If we only use CodeBuild:

- ❌ We must manually click "Start Build"
- ❌ No automatic trigger
- ❌ Not real CI

With CodePipeline:

- ✅ Auto trigger on GitHub push
- ✅ Automatic build
- ✅ Automatic deployment
- ✅ Full CI/CD workflow
- ✅ Production ready

So CodePipeline converts manual build into Continuous Integration.

---

## 🧱 Step-by-Step Setup

### Step 1: Open CodePipeline

1. Go to AWS Console
2. Search → **CodePipeline**
3. Click → **Create pipeline**

---

### Step 2: Pipeline Name

Example: `demo-app`

---

### Step 3: Service Role

Select: `Allow AWS to create a service role`

Example role created: `AWSCodePipelineServiceRole-us-east-1-demo-app`

---

#### Why Do We Need Pipeline Service Role?

CodePipeline needs permission to:

- Access GitHub
- Trigger CodeBuild
- Store artifacts in S3
- Trigger CodeDeploy
- Access CodeConnections

Without IAM role → Pipeline cannot interact with other AWS services.

So: **Pipeline Service Role = Permission manager for entire CI/CD flow.**

---

## 🔹 Stage 1: Source (GitHub)

This stage pulls source code.

**Configuration**

- Source Provider → GitHub (via GitHub App)
- Create new connection
- Authorize GitHub
- Select repository
- Select branch (e.g., main)

**What Happens Here?**

Whenever we push code:

```
git push origin main
```

GitHub sends webhook to AWS.

CodePipeline automatically starts.

This is Continuous Integration trigger.

**Required Permission:**

```
codestar-connections:UseConnection
```

Without this → GitHub trigger will fail.

---

## 🔹 Stage 2: Build (CodeBuild)

In this stage, CodePipeline triggers CodeBuild.

**Configuration**

- Build Provider → AWS CodeBuild
- Select project → sample-python-app-demo
- Input artifact → SourceArtifact
- Output artifact → BuildArtifact

**What Happens Here?**

Pipeline:

1. Takes code from Source stage
2. Sends it to CodeBuild
3. CodeBuild builds Docker image
4. Image pushed to Docker Hub
5. Build logs stored in CloudWatch

**Artifact Concept**

CodePipeline stores artifacts in S3 automatically.

Flow:

```
GitHub → S3 (SourceArtifact)
CodeBuild → S3 (BuildArtifact)
```

These artifacts are passed between stages.

---

## 🔐 Required IAM Permissions

Attach to Pipeline Role:

```
codestar-connections:UseConnection
AWSCodePipeline_FullAccess
```

These permissions allow pipeline to access GitHub and CodeBuild.

---

## 🔄 Automatic Pipeline Trigger

After completing the pipeline configuration:

Whenever you push new changes to GitHub:

- git commit -m "update"
- git push origin main

CodePipeline will automatically:

1. Detect the commit
2. Fetch source code
3. Trigger CodeBuild
4. Run the build process

No manual action is required.

---
