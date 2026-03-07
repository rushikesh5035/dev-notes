# Setting up Infrastructure on AWS using Terraform

![Setting up Infrastructure on AWS using Terraform](./terraform-aws-architecture.png)

Terraform is an open-source Infrastructure as Code (IaC) tool by HashiCorp that lets you define, provision, and manage cloud infrastructure using declarative configuration files.

---

## What We Are Going to Build

In this project, we will use Terraform to **fully automate** the provisioning of a production-style web infrastructure on AWS — no clicking in the console, everything defined as code.

Here is what we will build step by step:

1. **VPC** — A custom Virtual Private Cloud (`10.0.0.0/16`) to isolate all our resources in a private network on AWS.
2. **Two Public Subnets** — One in `us-east-1a` and one in `us-east-1b`, spread across two Availability Zones for high availability.
3. **Internet Gateway** — Attach it to the VPC so our resources can communicate with the internet.
4. **Route Table** — Create a route that sends all outbound traffic (`0.0.0.0/0`) through the Internet Gateway, and associate it with both subnets.
5. **Security Group** — A firewall that allows inbound HTTP (port 80) and SSH (port 22) traffic, and allows all outbound traffic.
6. **Two EC2 Instances** — Launch two Ubuntu web servers (one per subnet), each running Apache, configured automatically via user data scripts at boot time.
7. **S3 Bucket** — Create an S3 bucket for object/static file storage.
8. **Application Load Balancer (ALB)** — A public-facing load balancer that distributes incoming HTTP traffic evenly between the two EC2 instances.
9. **Target Group + Listener** — Register both EC2 instances as targets and configure the ALB listener to forward port 80 traffic to them.

At the end, Terraform outputs the **ALB DNS name** — open it in a browser and you'll see your web servers responding. Refresh the page and it alternates between `Server 1` and `Server 2`, proving the load balancer is working.

> **Goal:** Replace manual AWS console clicks with a single `terraform apply` command that builds the entire infrastructure in minutes and tears it all down with `terraform destroy`.

---

## Architecture Overview

```
Internet
   │
   ▼
Internet Gateway
   │
   ▼
VPC (10.0.0.0/16)
   ├── Public Subnet 1 (10.0.1.0/24) — us-east-1a → EC2 (webserver1)
   └── Public Subnet 2 (10.0.2.0/24) — us-east-1b → EC2 (webserver2)
         │
         ▼
  Application Load Balancer ──→ Amazon S3 Bucket
```

**Resources created:**

- 1 VPC
- 2 Public Subnets (across 2 AZs)
- 1 Internet Gateway
- 1 Route Table + 2 Route Table Associations
- 1 Security Group
- 2 EC2 Instances (Apache web servers)
- 1 S3 Bucket
- 1 Application Load Balancer
- 1 Target Group + 2 Target Group Attachments
- 1 ALB Listener

---

## Prerequisites

### 1. Install Terraform on Windows

```bash
winget install HashiCorp.Terraform
```

Verify the installation:

```bash
terraform -version
```

### 2. Create an IAM User & Attach Permissions

1. Go to **IAM → Users → click your user**
2. Click **Add permissions → Attach policies directly**
3. Search and attach: `AdministratorAccess`
4. Click **Next → Add permissions**

> **Note:** For this project we attach `AdministratorAccess` because we use many AWS components (VPC, EC2, S3, ALB, etc.). Configuring individual policies for each service would be complex. Alternatively, you can use your root account.

### 3. Configure AWS CLI Credentials

```bash
aws configure
```

Enter your:

- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

---

## Project Setup

### Step 1 — Create project folder and open in VS Code

```bash
mkdir terraform-project
cd terraform-project
code .
```

### Step 2 — Create `provider.tf`

This file tells Terraform which cloud provider to use. Find the provider docs at [registry.terraform.io](https://registry.terraform.io/providers/hashicorp/aws/latest).

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.35.1"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
```

<details>
<summary>Explanation</summary>

- `terraform {}` block declares which providers are required. Terraform will download the correct plugin when you run `terraform init`.
- `required_providers` → tells Terraform to use the official `hashicorp/aws` provider at version `6.35.1`.
- `provider "aws"` → configures that provider. Here we set `region = "us-east-1"` so every resource we create lands in the US East (N. Virginia) region by default.
- Without this file Terraform has no idea which cloud to talk to — this is always the starting point of any Terraform project.

</details>

### Step 3 — Initialize Terraform

```bash
terraform init
```

This is similar to `git init` — it downloads the provider plugin and sets up the working directory. You'll see:

```
Terraform has been successfully initialized!
```

---

## Infrastructure Code (`main.tf`)

### Create VPC

**`variables.tf`**

```hcl
variable "cidr" {
  default = "10.0.0.0/16"
}
```

**`main.tf`**

```hcl
resource "aws_vpc" "myvpc" {
  cidr_block = var.cidr   # 10.0.0.0/16
}
```

<details>
<summary>Explanation</summary>

- In `variables.tf` we define a variable called `cidr` with a default value of `10.0.0.0/16`. This keeps the CIDR block configurable — if you want a different range in the future you just change it in one place.
- `10.0.0.0/16` is a private IP range that gives us **65,536** total IP addresses across the entire VPC — plenty of room for all subnets and resources.
- In `main.tf`, `var.cidr` references that variable. This creates a VPC named **myvpc** using the CIDR block from `variables.tf`.
- Think of a VPC as your own private data center inside AWS — completely isolated from other AWS customers.

</details>

---

### Two Public Subnets

Now that we have a VPC, we need to divide it into subnets. We create **two public subnets** — one in each Availability Zone — so our infrastructure is highly available.

```hcl
resource "aws_subnet" "mysubnet1" {
  vpc_id                  = aws_vpc.myvpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "mysubnet2" {
  vpc_id                  = aws_vpc.myvpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true
}
```

<details>
<summary>Explanation</summary>

- `vpc_id = aws_vpc.myvpc.id` → attaches each subnet to our VPC. Terraform automatically resolves the VPC's ID at apply time.
- `cidr_block` → each subnet gets a smaller slice of the VPC range:
  - `mysubnet1` → `10.0.1.0/24` (256 addresses) in **us-east-1a**
  - `mysubnet2` → `10.0.2.0/24` (256 addresses) in **us-east-1b**
- `availability_zone` → placing subnets in different AZs means if one AZ goes down, the other is still serving traffic.
- `map_public_ip_on_launch = true` → any EC2 instance launched in these subnets automatically gets a **public IP address**, making them reachable from the internet.

</details>

---

### Internet Gateway

With the VPC and subnets ready, we need a door to the internet. That's what an Internet Gateway does.

```hcl
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.myvpc.id
}
```

<details>
<summary>Explanation</summary>

- An **Internet Gateway (IGW)** is a horizontally scaled, redundant AWS component that allows communication between the VPC and the internet.
- `vpc_id = aws_vpc.myvpc.id` → attaches the IGW to our VPC.
- Without this, resources in the VPC have no route to the internet even if they have a public IP.

</details>

---

### Route Table & Associations

Having the IGW isn't enough — we need to tell the subnets to actually use it. That's done with a Route Table.

```hcl
resource "aws_route_table" "rt" {
  vpc_id = aws_vpc.myvpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "rta1" {
  subnet_id      = aws_subnet.mysubnet1.id
  route_table_id = aws_route_table.rt.id
}

resource "aws_route_table_association" "rta2" {
  subnet_id      = aws_subnet.mysubnet2.id
  route_table_id = aws_route_table.rt.id
}
```

<details>
<summary>Explanation</summary>

- `aws_route_table` → creates a routing table inside our VPC.
- The `route` block with `cidr_block = "0.0.0.0/0"` means: _"for ANY destination IP, send traffic through the Internet Gateway"_. This is what makes the subnets truly public.
- `gateway_id = aws_internet_gateway.igw.id` → points that route to the IGW we just created.
- `aws_route_table_association` → links the route table to each subnet. Without this association, the subnets would still use the default (local-only) route table and wouldn't reach the internet.
- We create two associations — one for `mysubnet1` and one for `mysubnet2`.

</details>

---

### Security Group

Before launching EC2 instances, we need a firewall. Security Groups act as virtual firewalls controlling what traffic can reach our instances.

```hcl
resource "aws_security_group" "mysg" {
  name        = "web-sg"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.myvpc.id

  ingress {
    description = "HTTP from VPC"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"   # all protocols
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "web-sg" }
}
```

<details>
<summary>Explanation</summary>

- `ingress` = **inbound rules** (incoming traffic to our instances):
  - **Port 80 (HTTP)** → allows web traffic from anywhere (`0.0.0.0/0`) so users can access the website.
  - **Port 22 (SSH)** → allows SSH access from anywhere for management/debugging.
- `egress` = **outbound rules** (traffic going out from our instances):
  - `protocol = "-1"` means ALL protocols. `cidr_blocks = ["0.0.0.0/0"]` means any destination. This lets instances freely download packages, call APIs, etc.
- This security group will be attached to both EC2 instances and the Load Balancer.

</details>

---

### EC2 Instances

Now we launch two web servers — one in each subnet — each running Apache.

```hcl
resource "aws_instance" "webserver1" {
  ami                    = "ami-0b6c6ebed2801a5cb"
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.mysg.id]
  subnet_id              = aws_subnet.mysubnet1.id
  user_data_base64       = base64encode(file("userdata.sh"))
}

resource "aws_instance" "webserver2" {
  ami                    = "ami-0b6c6ebed2801a5cb"
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.mysg.id]
  subnet_id              = aws_subnet.mysubnet2.id
  user_data_base64       = base64encode(file("userdata1.sh"))
}
```

<details>
<summary>Explanation</summary>

- `ami` → Amazon Machine Image — the OS template for the instance (Ubuntu in this case).
- `instance_type = "t2.micro"` → a small, free-tier eligible instance size.
- `vpc_security_group_ids` → attaches our `web-sg` security group so the firewall rules apply.
- `subnet_id` → `webserver1` goes into `mysubnet1` (us-east-1a) and `webserver2` goes into `mysubnet2` (us-east-1b) — spreading them across AZs for high availability.
- `user_data_base64` → a startup script that runs automatically when the instance first boots. We use `base64encode(file(...))` to read the shell script and encode it in the format AWS expects.

**What the userdata scripts do (`userdata.sh` / `userdata1.sh`):**

1. Run `apt update` and install Apache (`apache2`)
2. Fetch the instance's own **Instance ID** from the AWS metadata endpoint (`169.254.169.254`)
3. Write a custom `index.html` showing the server name and Instance ID
4. Start Apache and enable it to auto-start on reboot

</details>

---

### S3 Bucket

```hcl
resource "aws_s3_bucket" "mybucket" {
  bucket = "terraform-project-bucket-50350079767"
}
```

<details>
<summary>Explanation</summary>

- Creates an **S3 bucket** for object storage. S3 bucket names are globally unique across all AWS accounts, which is why a unique number is appended.
- In this project the bucket is provisioned alongside the compute resources. It can be used to store assets, logs, or any static files the web servers need to serve.

</details>

---

### Application Load Balancer

With two web servers running, we need something to distribute traffic between them. That's the **Application Load Balancer (ALB)**.

```hcl
resource "aws_lb" "myalb" {
  name               = "myalb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.mysg.id]
  subnets            = [aws_subnet.mysubnet1.id, aws_subnet.mysubnet2.id]

  tags = { Name = "web" }
}
```

<details>
<summary>Explanation</summary>

- `internal = false` → makes the ALB **internet-facing** so external users can reach it.
- `load_balancer_type = "application"` → operates at Layer 7 (HTTP/HTTPS), enabling path-based and host-based routing.
- `security_groups` → attaches our `web-sg` so port 80 is open on the ALB.
- `subnets` → the ALB spans both public subnets (and therefore both AZs), making it highly available. Traffic coming in gets distributed between the two EC2 instances.

</details>

---

### Target Group & Attachments

A Target Group is where we register the EC2 instances that the ALB will forward traffic to.

```hcl
resource "aws_lb_target_group" "tg" {
  name     = "my-lb-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.myvpc.id

  health_check {
    path = "/"
    port = "traffic-port"
  }
}

resource "aws_lb_target_group_attachment" "attach1" {
  target_group_arn = aws_lb_target_group.tg.arn
  target_id        = aws_instance.webserver1.id
  port             = 80
}

resource "aws_lb_target_group_attachment" "attach2" {
  target_group_arn = aws_lb_target_group.tg.arn
  target_id        = aws_instance.webserver2.id
  port             = 80
}
```

<details>
<summary>Explanation</summary>

- `aws_lb_target_group` → defines a group of targets (our EC2 instances) and the port/protocol the ALB uses to talk to them.
- `health_check` → the ALB periodically sends an HTTP GET to `/` on each instance. If an instance is unhealthy (not responding), the ALB stops sending traffic to it automatically.
- `aws_lb_target_group_attachment` → registers each EC2 instance (`webserver1`, `webserver2`) into the target group on port 80.

</details>

---

### ALB Listener

The Listener tells the ALB what to do when it receives incoming traffic on a specific port.

```hcl
resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_lb.myalb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}
```

<details>
<summary>Explanation</summary>

- `load_balancer_arn` → attaches this listener to our ALB.
- `port = "80"` and `protocol = "HTTP"` → the listener watches for incoming HTTP traffic on port 80.
- `default_action { type = "forward" }` → forwards all incoming requests to our target group, which then distributes them round-robin between `webserver1` and `webserver2`.

</details>

---

### Output — Load Balancer DNS

```hcl
output "loadbalancerdns" {
  value = aws_lb.myalb.dns_name
}
```

<details>
<summary>Explanation</summary>

- After `terraform apply` completes, Terraform prints the **DNS name** of the ALB in the terminal output.
- Copy that DNS name and paste it in your browser — you'll see the Apache page from one of the two web servers (it alternates between them on each refresh, showing the Load Balancer working).
- The DNS looks something like: `myalb-1234567890.us-east-1.elb.amazonaws.com`

</details>

---

## Terraform Workflow

| Command              | Description                                                       |
| -------------------- | ----------------------------------------------------------------- |
| `terraform init`     | Downloads provider plugins, initializes working directory         |
| `terraform validate` | Checks configuration syntax and variable definitions              |
| `terraform plan`     | Dry-run — shows what resources will be created/modified/destroyed |
| `terraform apply`    | Creates the infrastructure on AWS                                 |
| `terraform destroy`  | Tears down all resources created by Terraform                     |

### Deploy

```bash
terraform validate
terraform plan
terraform apply
```

Type `yes` when prompted. After completion you'll see the ALB DNS name in the output.

### Tear Down

```bash
terraform destroy
```

Prompts for confirmation and then deletes all resources: VPC, subnets, IGW, route table, security group, EC2 instances, S3 bucket, and ALB.

---

## Project File Structure

```
terraform-project/
├── provider.tf      # AWS provider configuration & region
├── variables.tf     # Input variables (VPC CIDR block)
├── main.tf          # All resource definitions
├── userdata.sh      # Bootstrap script for webserver1
└── userdata1.sh     # Bootstrap script for webserver2
```
