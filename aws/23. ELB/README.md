# AWS ELB (Elastic Load Balancing)

## Introduction

Imagine you have an application running on multiple servers and users are sending requests continuously.
If all traffic goes to one server, that server gets overloaded.
If that server fails, application becomes unavailable.

This is where Elastic Load Balancing (ELB) comes in.

ELB is an AWS service that automatically distributes incoming traffic across multiple targets like:

- EC2 instances
- containers
- IP addresses
- Lambda functions

In simple words:

- ELB = smart traffic manager + high availability layer.

---

## Why We Need ELB

Without ELB:

- one server can get overloaded
- if one server fails, users face downtime
- traffic distribution becomes manual
- scaling becomes difficult
- high availability is hard to maintain

With ELB:

- traffic is spread across healthy targets
- unhealthy targets stop receiving traffic
- healthy targets continue serving users
- app scales more easily with Auto Scaling
- availability and reliability improve

---

## How ELB Works

Simple request flow:

1. User sends request to load balancer DNS.
2. ELB receives request on listener (port/protocol).
3. ELB checks target group health status.
4. ELB forwards request to one healthy target.
5. Target responds.
6. User gets response.

```text
Client --> Listener --> Target Group --> Healthy Target --> Response
```

---

## Types of ELB in AWS

AWS provides four load balancer types.

### 1. Classic Load Balancer (CLB)

Older generation load balancer.

- works at Layer 4 and Layer 7
- supports HTTP, HTTPS, TCP, SSL
- mostly used in legacy architectures

Limitations:

- fewer features compared to ALB/NLB
- not preferred for new workloads

### 2. Application Load Balancer (ALB)

Layer 7 load balancer for HTTP/HTTPS applications.

ALB understands:

- URL path
- hostname
- headers
- query strings

Common use cases:

- web applications
- REST APIs
- microservices
- ECS services
- EKS ingress routing

Main features:

- path-based routing
- host-based routing
- header and query routing
- WebSocket and HTTP/2 support
- SSL termination
- health checks and target groups

### 3. Network Load Balancer (NLB)

Layer 4 load balancer for TCP/UDP/TLS workloads.

Designed for:

- very high performance
- ultra-low latency
- sudden traffic spikes
- static IP requirements

Common use cases:

- gaming
- real-time systems
- financial systems
- non-HTTP traffic

### 4. Gateway Load Balancer (GWLB)

Used to deploy and scale network security appliances.

Examples:

- firewalls
- IDS/IPS
- packet inspection appliances

Common in enterprise security and traffic inspection architectures.

---

## Quick Comparison

| Feature       | CLB         | ALB                       | NLB                     | GWLB                |
| ------------- | ----------- | ------------------------- | ----------------------- | ------------------- |
| OSI Layer     | L4/L7       | L7                        | L4                      | L3/L4               |
| Best For      | Legacy apps | HTTP/HTTPS, microservices | TCP/UDP/TLS performance | Security appliances |
| Smart Routing | Basic       | Advanced                  | No                      | No                  |
| Static IP     | No          | No                        | Yes                     | Via endpoints       |

---

## Core ELB Components

### Listener

A listener checks incoming connections using a protocol and port.

Examples:

- HTTP on 80
- HTTPS on 443
- TCP on custom ports

### Listener Rules (mainly ALB)

Conditions can be based on:

- path
- host
- headers
- query string
- source IP

Actions can be:

- forward to target group
- redirect
- fixed response

### Target Group

A target group is a collection of backend targets.

Target types:

- instance
- ip
- lambda

### Health Checks

ELB continuously checks target health.

- unhealthy target: traffic stops
- healthy target: traffic resumes

Important settings:

- health check path
- interval and timeout
- healthy/unhealthy thresholds

---

## Important ELB Concepts

### Internet-facing vs Internal

- Internet-facing: public apps reachable from internet
- Internal: only reachable inside VPC/private network

### Cross-Zone Load Balancing

Distributes traffic across targets in multiple AZs for better fault tolerance.

### SSL Termination

ELB handles encryption/decryption using ACM certificate, reducing backend load.

### Sticky Sessions

Can route same client to same backend for a session window.
Useful for session-based or legacy apps.

### Traffic Distribution Behavior

- ALB: request-level balancing with routing rules
- NLB: connection-level flow hashing

---

## ELB with Auto Scaling

ELB + Auto Scaling Group is a common production pattern.

- load increases -> ASG launches new instances
- new instances register with target group
- ELB starts routing traffic to them
- load decreases -> extra instances terminate gracefully

Result: scalable and highly available architecture.

---

## ELB with ECS and EKS

### With ECS

- ALB/NLB can distribute traffic to ECS tasks
- ECS services auto register/deregister targets

### With EKS

- AWS Load Balancer Controller provisions ALB/NLB
- Kubernetes Services/Ingress can use AWS load balancers

---

## End-to-End ALB Setup (Console) - Script Format

### Step 1: Create Security Groups

1. Create alb-sg:
   - inbound HTTP 80 from 0.0.0.0/0
   - inbound HTTPS 443 from 0.0.0.0/0
2. Create app-sg:
   - inbound HTTP 80 from alb-sg only

Why:

- backend should not be open directly to internet
- only ALB should access backend

### Step 2: Launch Backend EC2 Instances

1. Launch at least 2 instances in different AZs.
2. Attach app-sg.
3. Run app and health endpoint.

```bash
sudo apt update
sudo apt install -y nginx
echo "Server-1" | sudo tee /var/www/html/index.html
echo "ok" | sudo tee /var/www/html/health
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Step 3: Create Target Group

1. Go to EC2 -> Target Groups -> Create target group
2. Target type: instance
3. Protocol: HTTP
4. Port: 80
5. Health check path: /health
6. Register both instances

### Step 4: Create ALB

1. Go to EC2 -> Load Balancers -> Create Load Balancer
2. Select Application Load Balancer
3. Scheme: internet-facing
4. Select public subnets in at least 2 AZs
5. Attach alb-sg
6. Listener 80 -> forward to target group

After ALB becomes active, open ALB DNS name in browser.

### Step 5: Enable HTTPS

1. Request certificate in ACM
2. Add listener 443 on ALB
3. Attach certificate
4. Redirect HTTP 80 to HTTPS 443

### Step 6: Validate Failover

Stop app on one backend:

```bash
sudo systemctl stop nginx
```

Wait for health check to fail.
Refresh ALB DNS and verify traffic still serves from healthy targets.

---

## AWS CLI Workflow (ALB)

Create target group:

```bash
aws elbv2 create-target-group \
	--name demo-tg \
	--protocol HTTP \
	--port 80 \
	--vpc-id vpc-xxxxxxxx \
	--target-type instance \
	--health-check-path /health
```

Create ALB:

```bash
aws elbv2 create-load-balancer \
	--name demo-alb \
	--subnets subnet-aaa subnet-bbb \
	--security-groups sg-xxxxxxxx \
	--scheme internet-facing \
	--type application
```

Create listener:

```bash
aws elbv2 create-listener \
	--load-balancer-arn arn:aws:elasticloadbalancing:...:loadbalancer/app/demo-alb/... \
	--protocol HTTP \
	--port 80 \
	--default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...:targetgroup/demo-tg/...
```

Register targets:

```bash
aws elbv2 register-targets \
	--target-group-arn arn:aws:elasticloadbalancing:...:targetgroup/demo-tg/... \
	--targets Id=i-aaaa Id=i-bbbb
```

---

## Security Best Practices

1. Expose only load balancer publicly.
2. Keep backend instances/services in private subnets.
3. Allow backend inbound only from ALB security group.
4. Use HTTPS with ACM and redirect HTTP to HTTPS.
5. Attach AWS WAF to ALB for web protection.
6. Use least-privilege IAM for ELB operations.
7. Enable access logs to S3 for audit.

---

## Monitoring and Observability

Track these CloudWatch metrics:

- RequestCount
- TargetResponseTime
- HealthyHostCount
- UnHealthyHostCount
- HTTPCode_ELB_5XX_Count
- HTTPCode_Target_5XX_Count

Recommended alarms:

- unhealthy targets > 0
- sudden 5xx spike
- high response time

Also enable:

- ELB access logs to S3
- VPC Flow Logs (if network issue suspected)

---

## Common Issues and Troubleshooting

### Target unhealthy

Check:

- health check path exists and returns success
- app listening on expected port
- instance SG allows traffic from ALB SG
- NACL and route rules are correct

### 502/504 from ALB

Possible causes:

- backend app crash
- wrong target port
- backend timeout/slow response
- idle timeout mismatch

### DNS opens but app not reachable

Check:

- target registration
- listener rules
- subnet and route mapping
- backend service status

### HTTPS not working

Check:

- ACM certificate is Issued
- certificate matches domain
- listener 443 is properly configured

---

## Which Load Balancer Should You Choose?

Choose ALB when:

- workload is HTTP/HTTPS
- path or host-based routing is needed
- microservices/API architecture is used

Choose NLB when:

- workload is TCP/UDP/TLS
- ultra-low latency is required
- static IP is required

Choose CLB when:

- maintaining old legacy setup only

Choose GWLB when:

- deploying security appliances inline
- advanced traffic inspection is required

---

## Advantages and Limitations

### Advantages

- automatic traffic distribution
- improved availability and fault tolerance
- easy scaling with ASG/ECS/EKS
- health-check driven resilience

### Limitations

- adds infrastructure cost
- wrong health checks can mark healthy targets unhealthy
- wrong listener/routing rules can break traffic path
- wrong LB type selection can hurt performance/design

---

## Pricing Idea

Pricing depends on:

- load balancer type (ALB/NLB/GWLB/CLB)
- running hours
- processed traffic
- capacity usage dimensions (LCU/NLCU)

Cost tip:

- remove unused LBs and target groups
- keep listener/routing rules optimized

---

## Real-World Architecture Pattern

```text
Users
	|
	v
Route 53
	|
	v
ALB (public subnets, HTTPS, WAF)
	|
	v
Target Group
	|
	v
ECS / EC2 / EKS in private subnets
	|
	v
RDS / Cache / internal services
```

---

## Interview Questions (Quick Revision)

1. What is ELB and why is it used?
2. What are CLB, ALB, NLB, and GWLB?
3. Difference between ALB and NLB?
4. Why are target groups needed?
5. How do health checks improve availability?
6. What is cross-zone load balancing?
7. How does ELB integrate with Auto Scaling?
8. How do you enable HTTPS on ALB?
9. Why should backend SG allow traffic only from ALB SG?
10. What causes 502/504 errors in ALB?

---
