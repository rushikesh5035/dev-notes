# AWS Secret Management

## Introduction

Every application needs sensitive information to function — database passwords, API keys, OAuth tokens, TLS certificates. Hardcoding these values in source code or configuration files is a major security risk. AWS provides dedicated services to store, manage, rotate, and audit access to secrets securely: **AWS Secrets Manager** and **AWS Systems Manager (SSM) Parameter Store**.

## Table of Contents

1. Why Secret Management Matters
2. AWS Services for Secret Management
3. AWS Secrets Manager
   - How It Works
   - Key Features
   - Creating a Secret (Console)
   - Creating a Secret (AWS CLI)
   - Accessing a Secret from Code
   - Automatic Secret Rotation
4. AWS Systems Manager Parameter Store
   - How It Works
   - Standard vs Advanced Parameters
   - Creating a Parameter (Console)
   - Creating a Parameter (AWS CLI)
   - Accessing a Parameter from Code
5. Secrets Manager vs Parameter Store — Comparison
6. IAM Permissions for Secrets
7. Best Practices
8. Real-World Use Cases

---

## 1. Why Secret Management Matters

Consider a typical Node.js application that connects to a database. A developer might write:

```javascript
const db = mysql.createConnection({
  host: "prod-db.example.com",
  user: "admin",
  password: "SuperSecret123!", // ❌ NEVER do this
});
```

Problems with this approach:

- The password is visible to **anyone** with access to the repository.
- It gets stored in **Git history** forever, even after deletion.
- Rotating the password means **editing and redeploying** code.
- There is **no audit trail** of who accessed the secret.

AWS Secret Management services solve all of these problems.

---

## 2. AWS Services for Secret Management

AWS offers two primary services for managing secrets:

| Service                                 | Best For                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------ |
| **AWS Secrets Manager**                 | Sensitive secrets requiring automatic rotation (DB passwords, API keys)  |
| **AWS Systems Manager Parameter Store** | Configuration data, non-sensitive settings, and cost-sensitive workloads |

Both services integrate natively with IAM, CloudTrail, KMS, Lambda, ECS, EKS, and other AWS services.

---

## 3. AWS Secrets Manager

### How It Works

AWS Secrets Manager stores secrets as encrypted key-value pairs backed by **AWS KMS (Key Management Service)**. Applications retrieve secrets at runtime via an API call rather than reading them from environment variables or config files. Secrets Manager can also **automatically rotate** credentials on a schedule using a Lambda function.

```
Application  →  Secrets Manager API  →  KMS (decrypt)  →  Returns secret value
```

### Key Features

- **Automatic Rotation**: Rotate database credentials, API keys, and other secrets automatically on a configurable schedule without downtime.
- **KMS Encryption**: All secrets are encrypted at rest using AWS KMS. You can use the AWS-managed key or your own Customer Managed Key (CMK).
- **Fine-Grained IAM Access**: Control which IAM roles, users, or services can retrieve or manage specific secrets.
- **Versioning**: Secrets Manager keeps multiple versions of a secret (e.g., `AWSCURRENT`, `AWSPREVIOUS`), making zero-downtime rotation possible.

### Creating a Secret (Console)

1. Go to the **AWS Management Console** and navigate to **Secrets Manager**.
2. Click **Store a new secret**.
3. Choose the secret type:
   - **Credentials for RDS database** — for RDS/Aurora/Redshift.
   - **Other type of secret** — for API keys, custom credentials.
4. Enter your key-value pairs (e.g., `username` / `admin`, `password` / `MyP@ss!`).
5. Choose an encryption key (default AWS managed key or a CMK).
6. Click **Next** and give the secret a name, e.g., `prod/myapp/db-credentials`.
7. (Optional) Configure **automatic rotation** — set a rotation schedule (e.g., every 30 days) and choose or create a Lambda rotation function.
8. Review and click **Store**.

### Creating a Secret (AWS CLI)

```bash
# Store a new secret
aws secretsmanager create-secret \
  --name "prod/myapp/db-credentials" \
  --description "Production database credentials" \
  --secret-string '{"username":"admin","password":"MyP@ss!"}'

# Retrieve the secret value
aws secretsmanager get-secret-value \
  --secret-id "prod/myapp/db-credentials"

# Update an existing secret
aws secretsmanager put-secret-value \
  --secret-id "prod/myapp/db-credentials" \
  --secret-string '{"username":"admin","password":"NewP@ss!"}'

# Delete a secret (with a 7-day recovery window)
aws secretsmanager delete-secret \
  --secret-id "prod/myapp/db-credentials" \
  --recovery-window-in-days 7
```

### Accessing a Secret from Code

<details>
<summary>Python (boto3)</summary>

```python
import boto3
import json

def get_secret(secret_name, region="us-east-1"):
client = boto3.client("secretsmanager", region_name=region)
response = client.get_secret_value(SecretId=secret_name)
return json.loads(response["SecretString"])

credentials = get_secret("prod/myapp/db-credentials")
print(credentials["username"]) # admin

```

</details>

<details>
<summary>Node.js (AWS SDK v3)</summary>

```javascript
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

async function getSecret(secretName) {
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretName }),
  );
  return JSON.parse(response.SecretString);
}

const creds = await getSecret("prod/myapp/db-credentials");
console.log(creds.username); // admin
```

</details>

### Automatic Secret Rotation

Secrets Manager can automatically rotate credentials using an AWS Lambda function. For supported databases (RDS, Aurora, Redshift, DocumentDB), AWS provides **managed rotation functions** — no custom code needed.

**How rotation works (zero-downtime, 4-step Lambda lifecycle):**

1. **createSecret** — Lambda creates a new version of the secret with a new password (`AWSPENDING` label).
2. **setSecret** — Lambda updates the actual database with the new password.
3. **testSecret** — Lambda verifies the new credentials work.
4. **finishSecret** — Lambda marks the new version as `AWSCURRENT` and the old one as `AWSPREVIOUS`.

During rotation, your application keeps working because Secrets Manager serves `AWSCURRENT`. Once rotation completes, the new credentials become active.

**Enable rotation via CLI:**

```bash
aws secretsmanager rotate-secret \
  --secret-id "prod/myapp/db-credentials" \
  --rotation-lambda-arn arn:aws:lambda:us-east-1:123456789:function:SecretsManagerRotation \
  --rotation-rules AutomaticallyAfterDays=30
```

---

## 4. AWS Systems Manager Parameter Store

### How It Works

SSM Parameter Store is a hierarchical key-value store for configuration data and secrets. Parameters are organized in a folder-like hierarchy using `/` as a delimiter (e.g., `/prod/myapp/db-password`). Values can be stored as plaintext (**String**), a list of strings (**StringList**), or encrypted using KMS (**SecureString**).

### Standard vs Advanced Parameters

| Feature                          | Standard | Advanced                           |
| -------------------------------- | -------- | ---------------------------------- |
| Max parameter size               | 4 KB     | 8 KB                               |
| Parameter policies (TTL, expiry) | No       | Yes                                |
| Number of parameters             | 10,000   | Unlimited (charges apply)          |
| Cost                             | Free     | $0.05 per advanced parameter/month |
| Throughput                       | Shared   | Higher (up to 1,000 TPS)           |

- Use **Standard** for most configuration needs.
- Use **Advanced** when you need expiry policies or larger values.

### Creating a Parameter (Console)

1. Go to **AWS Systems Manager** → **Parameter Store** in the Console.
2. Click **Create parameter**.
3. Enter a name using a path structure: `/prod/myapp/db-password`.
4. Choose a **Tier**: Standard or Advanced.
5. Choose a **Type**:
   - `String` — plain text (e.g., region names, feature flags).
   - `StringList` — comma-separated values.
   - `SecureString` — encrypted with KMS (use this for passwords and secrets).
6. Enter the value.
7. Click **Create parameter**.

### Creating a Parameter (AWS CLI)

```bash
# Create a plain-text parameter
aws ssm put-parameter \
  --name "/prod/myapp/region" \
  --value "us-east-1" \
  --type String

# Create an encrypted SecureString parameter
aws ssm put-parameter \
  --name "/prod/myapp/db-password" \
  --value "MyP@ss!" \
  --type SecureString

# Retrieve a parameter (will return encrypted value for SecureString)
aws ssm get-parameter \
  --name "/prod/myapp/db-password"

# Retrieve with decryption
aws ssm get-parameter \
  --name "/prod/myapp/db-password" \
  --with-decryption

# Get all parameters under a path
aws ssm get-parameters-by-path \
  --path "/prod/myapp/" \
  --with-decryption \
  --recursive
```

### Accessing a Parameter from Code

**Python (boto3)**

```python
import boto3

def get_parameter(name, with_decryption=True):
    client = boto3.client("ssm", region_name="us-east-1")
    response = client.get_parameter(Name=name, WithDecryption=with_decryption)
    return response["Parameter"]["Value"]

db_password = get_parameter("/prod/myapp/db-password")
```

**Node.js (AWS SDK v3)**

```javascript
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const client = new SSMClient({ region: "us-east-1" });

async function getParameter(name) {
  const response = await client.send(
    new GetParameterCommand({ Name: name, WithDecryption: true }),
  );
  return response.Parameter.Value;
}

const dbPassword = await getParameter("/prod/myapp/db-password");
```

---

## 5. Secrets Manager vs Parameter Store — Comparison

| Feature                   | Secrets Manager                | Parameter Store                   |
| ------------------------- | ------------------------------ | --------------------------------- |
| **Primary Use Case**      | Secrets (passwords, API keys)  | Configuration + secrets           |
| **Automatic Rotation**    | Yes (built-in)                 | No (must build custom)            |
| **Encryption**            | Always encrypted (KMS)         | Optional (`SecureString`)         |
| **Versioning**            | Yes (labeled versions)         | Yes (by version number)           |
| **Cost**                  | $0.40/secret/month + API calls | Free (standard tier)              |
| **Max Value Size**        | 65,536 bytes                   | 4 KB (standard) / 8 KB (advanced) |
| **Native DB Rotation**    | Yes (RDS, Aurora, Redshift)    | No                                |
| **Cross-Account Sharing** | Yes                            | Limited                           |
| **Audit via CloudTrail**  | Yes                            | Yes                               |

**Rule of thumb:**

- Use **Secrets Manager** for anything that needs rotation or is a true secret (database credentials, third-party API keys).
- Use **Parameter Store** for non-secret configuration (feature flags, environment names, ARNs) and to save costs when rotation isn't needed.

---

## 6. IAM Permissions for Secrets

Access to secrets must be explicitly granted through IAM. Never give broad permissions — follow the **principle of least privilege**.

**IAM policy to allow an application to only read one specific secret:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:prod/myapp/db-credentials-*"
    }
  ]
}
```

**IAM policy to allow reading a specific Parameter Store path:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ssm:GetParameter", "ssm:GetParametersByPath"],
      "Resource": "arn:aws:ssm:us-east-1:123456789012:parameter/prod/myapp/*"
    },
    {
      "Effect": "Allow",
      "Action": "kms:Decrypt",
      "Resource": "arn:aws:kms:us-east-1:123456789012:key/<your-kms-key-id>"
    }
  ]
}
```

> **Note**: The `kms:Decrypt` permission is required in addition to the SSM permission when reading `SecureString` parameters or Secrets Manager secrets encrypted with a Customer Managed Key (CMK).

---

## 7. Best Practices

- **Never hardcode secrets** in source code, Dockerfiles, environment variables baked into images, or CI/CD pipeline definitions.
- **Use naming conventions** for your secrets and parameters to keep them organized:
  - `/<environment>/<application>/<secret-name>`
  - Example: `/prod/payment-service/stripe-api-key`
- **Enable automatic rotation** for all database credentials using Secrets Manager.
- **Use Customer Managed Keys (CMK)** in KMS for secrets that require stricter access control and audit.
- **Attach IAM roles to services** (EC2 instance profiles, ECS task roles, Lambda execution roles) — never use long-lived access keys inside running services.
- **Enable CloudTrail** to audit all access to secrets. Set up CloudWatch alarms for unusual access patterns.
- **Set expiry policies** on advanced Parameter Store parameters where secrets have a defined lifespan.
- **Cache secrets in memory** and refresh them periodically rather than calling the API on every request to reduce latency and cost.

---

## 8. Real-World Use Cases

### Use Case 1: RDS Database Credentials for a Web Application

An EC2-hosted web application needs to connect to an RDS MySQL database securely.

1. Store DB credentials in Secrets Manager: `/prod/webapp/rds-credentials`.
2. Attach an IAM role to the EC2 instance with `secretsmanager:GetSecretValue` permission on that secret.
3. Enable automatic rotation every 30 days — Secrets Manager updates RDS and the secret atomically.
4. The application retrieves credentials at startup using the SDK. No password is ever stored in code or on disk.

### Use Case 2: Third-Party API Keys for a Lambda Function

A Lambda function calls the Stripe payment API and needs an API key.

1. Store the Stripe key in Secrets Manager: `/prod/payment-lambda/stripe-api-key`.
2. Grant the Lambda execution role `secretsmanager:GetSecretValue` on that secret.
3. In the Lambda handler, fetch the key once during the init phase (outside the handler function) so it is cached across warm invocations.

### Use Case 3: Environment Configuration for Microservices on ECS

Multiple ECS services share common configuration (e.g., feature flags, third-party service URLs).

1. Store non-sensitive config in Parameter Store as `String` type: `/prod/shared/feature-flag-dark-mode`.
2. Store sensitive config as `SecureString`: `/prod/shared/internal-api-token`.
3. Reference the parameters directly in your **ECS Task Definition** using the `secrets` and `environment` sections — ECS resolves them at container startup automatically.

```json
"secrets": [
  {
    "name": "INTERNAL_API_TOKEN",
    "valueFrom": "arn:aws:ssm:us-east-1:123456789012:parameter/prod/shared/internal-api-token"
  }
]
```
