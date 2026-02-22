## 🚀 AWS CodeBuild – Build & Package Our Application

This document explains how to use AWS CodeBuild to build a Python application, create a Docker image, and push it to Docker Hub.

### 📌 What is AWS CodeBuild?

AWS CodeBuild is a fully managed cloud build service.

It helps us to:

- Pull source code from GitHub
- Install dependencies
- Build our application
- Create Docker images
- Push images to Docker Hub / ECR
- Generate build logs and artifacts

So instead of building everything on our local system, AWS does it for us.

👉 In simple words:

- **CodeBuild = Cloud-based automated build system**

#### 🎯 Why Do We Use CodeBuild?

**Without CodeBuild:**

❌ Manual builds,
❌ Manual Docker login,
❌ No automation,
❌ Not scalable

**With CodeBuild:**

✅ Automatic builds
✅ Secure credentials
✅ Cloud environment
✅ Easy integration with CI/CD
✅ Industry standard

That’s why CodeBuild is used in real-world projects.

---

## 🧱 Step-by-Step Setup of AWS CodeBuild

### Step 1: Open CodeBuild Service

1.  Login to AWS Console
2.  Search → **CodeBuild**
3.  Open the service
4.  Click → **Create build project**

---

### Step 2: Project Configuration

**Project Name**

- Example:
  ```dash
  sample-python-app-demo
  ```

---

### Step 3: Source Configuration (GitHub)

- Select:
  ```dash
  Source Provider → GitHub
  ```
  Then:
  - Connect GitHub using access token
  - Select repository
  - Choose branch

---

**Why We Connect GitHub?**

So CodeBuild can:

- ✅ Pull latest code
- ✅ Read Dockerfile
- ✅ Access requirements.txt

Without GitHub connection, CodeBuild cannot build our project.

---

### Step 4: Build Environment Configuration

Set the following options:

| Setting          | Value                  |
| ---------------- | ---------------------- |
| Operating System | Ubuntu                 |
| Runtime          | Standard               |
| Image            | aws/codebuild/standard |
| Privileged Mode  | Enable                 |

---

**Why Enable Privileged Mode?**

We are using Docker inside CodeBuild.

Docker needs system-level permission.

So:

- **Without Privileged Mode → Docker commands will fail ❌**

That’s why we enable it.

---

### Step 5: Service Role (IAM Role)

While creating project, select:

```bash
Create new service role
```

Example:

```bash
codebuild-demo-app-service-role
```

---

**Why Do We Need a Service Role?**

CodeBuild runs inside AWS infrastructure.

It needs permission to:

- Read secrets
- Write logs
- Access Parameter Store
- Push Docker images
- Access S3 (if required)

IAM Role provides these permissions.

👉 Think of it as: **Identity card for CodeBuild.**

Without this role, CodeBuild cannot access AWS services.

---

### Step 6: Configure Build Specification (buildspec.yml)

The buildspec file tells CodeBuild what to do step by step.

We can write it inside console or keep it in repository.

Example **buildspec.yml**

```yaml
version: 0.2

env:
parameter-store:
DOCKER_REGISTRY_USERNAME: /myapp/docker-credentials/username
DOCKER_REGISTRY_PASSWORD: /myapp/docker-credentials/password
DOCKER_REGISTRY_URL: /myapp/docker-registry/url

phases:
install:
runtime-versions:
python: 3.11

pre_build:
commands: - pip install -r requirements.txt

build:
commands: - echo "$DOCKER_REGISTRY_PASSWORD" | docker login -u "$DOCKER_REGISTRY_USERNAME" --password-stdin "$DOCKER_REGISTRY_URL"
      - docker build -t "$DOCKER_REGISTRY_URL/$DOCKER_REGISTRY_USERNAME/simple-python-flask-app:latest" .
      - docker push "$DOCKER_REGISTRY_URL/$DOCKER_REGISTRY_USERNAME/simple-python-flask-app:latest"

post_build:
commands: - echo "Build Completed Successfully"
Explanation of buildspec.yml
```

<details><summary>Explanation of buildspec.yml</summary>

1️⃣ Version

```
version: 0.2
```

Defines the buildspec format.

2️⃣ Environment (Parameter Store)
env:
parameter-store:

Fetches credentials from AWS Parameter Store.

We do not hardcode secrets in code.

This improves security.

3️⃣ Install Phase
install:
runtime-versions:
python: 3.11

Sets Python version.

4️⃣ Pre-Build Phase
pip install -r requirements.txt

Installs project dependencies.

Same as local setup.

5️⃣ Build Phase

This is the main phase.

Here we:

✅ Login to Docker
✅ Build image
✅ Push image

So our application image is created in cloud.

6️⃣ Post-Build Phase

Used for logging and confirmation.

</details>

---

### Step 7: Store Secrets in Parameter Store

Go to:

```
AWS Console → Systems Manager → Parameter Store
```

Create these parameters:

| Name                               | Type         |
| ---------------------------------- | ------------ |
| /myapp/docker-credentials/username | SecureString |
| /myapp/docker-credentials/password | SecureString |
| /myapp/docker-registry/url         | SecureString |

---

**Why Parameter Store?**

Because:

- ❌ Hardcoding passwords = Unsafe
- ✅ Encrypted storage = Secure

This is industry best practice.

---

### Step 8: Add Permission to CodeBuild Role

Attach this policy to CodeBuild role:

```
AmazonSSMFullAccess
```

**Why?**

So CodeBuild can read secure parameters.

Without this permission, build will fail.

---

### Step 9: Run Build Manually

After setup, click:

```
Start Build
```

Now CodeBuild will:

- Pull code from GitHub
- Install dependencies
- Build Docker image
- Push image to Docker Hub
- Store logs in CloudWatch

---

### Step 10: Verify Output

After successful build:

- ✅ Build logs available
- ✅ Docker image pushed
- ✅ Ready for deployment

Check Docker Hub to confirm.

---

## ⚠️ Limitation of Using Only CodeBuild

If we use only CodeBuild:

- ❌ Manual trigger required
- ❌ No automatic deployment
- ❌ Not full CI/CD

So CodeBuild is mainly used for build stage.

For automation → we use CodePipeline.
