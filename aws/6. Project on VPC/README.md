# AWS VPC + ASG + Bastion + Load Balancer Project

---

## Step 1: VPC Creation

1. To create VPC, go to AWS console and search **VPC**.
2. Click on **Create VPC**.
3. Select **VPC and more**.
4. Give name: `aws-prod-example-vpc`.
5. Configure the VPC with following settings:
   - IPv4 CIDR block → `10.0.0.0/16`
   - IPv6 CIDR block → No IPv6
   - Number of AZs → 2
   - Public subnets → 2
   - Private subnets → 2
   - NAT gateways → 1 per AZ
   - VPC endpoints → None
   - Enable DNS hostnames
   - Enable DNS resolution

6. Click on **Create VPC**.

---

## Step 2: Create Auto Scaling Group

1. Go to **EC2** service.
2. Click on **Auto Scaling Groups**.
3. Click on **Create Auto Scaling group**.
4. Give name: `aws-prod-example`.
5. Select **Launch template** option.
6. If launch template is not available, click on **Create new launch template**.

---

## Step 3: Create Launch Template

1. Enter launch template name: `aws-prod-example`.
2. Enter version description: proof of concept of app deploy in aws private subnet.
3. Select AMI → Recently launched → Ubuntu.
4. Select instance type → t3.micro.
5. Select login key pair.

### Network Settings

6. Click on **Create security group**.
7. Give name: `aws-prod-example`.
8. Description: allow ssh access.
9. Select VPC: `aws-prod-example-vpc`.

### Inbound Rules

10. Add rule → SSH → Port 22 → Source Anywhere.
11. Add rule → Custom TCP → Port 8000 → Source Anywhere.
12. Save launch template.

---

## Step 4: Configure Auto Scaling Group

1. Go back to Auto Scaling group creation page.
2. Select newly created launch template.
3. Click on **Next**.

### Network Configuration

4. Select VPC: `aws-prod-example-vpc`.
5. Select private subnets from both AZs.

### Load Balancing

6. Select **No load balancer**.
7. Select **No VPC Lattice**.

### Group Size

8. Set Desired capacity → 2.
9. Set Minimum → 1.
10. Set Maximum → 4.
11. Click on **Create Auto Scaling group**.

---

## Step 5: Verify EC2 Instances

1. Go to **EC2 → Instances**.
2. Check that 2 instances are created by ASG.
3. Verify both instances are in different subnets.
4. Confirm no public IP is assigned.

---

## Step 6: Create Bastion Host

1. Go to **EC2 → Launch Instance**.
2. Give name: bastion-host.
3. Select AMI → Ubuntu.
4. Select instance type → t3.micro.
5. Select VPC → aws-prod-example-vpc.
6. Select subnet → Public subnet.
7. Enable auto-assign public IP.
8. Select security group → Default.
9. Click on **Launch instance**.

---

## Step 7: Copy Key to Bastion Host

1. Open terminal on local system.
2. Run following command:

   ```bash
   scp -i rushiengg.pem rushiengg.pem ubuntu@<BASTION_PUBLIC_IP>:/home/ubuntu
   ```

- This command copies a file from your local computer to a remote server using SCP (Secure Copy Protocol over SSH).

  or

3. This command copies key file to bastion host.

---

## Step 8: Login to Bastion Host

1. Run SSH command:

   ```bash
   ssh -i rushiengg.pem ubuntu@<BASTION_PUBLIC_IP>
   ```

2. Check key file:

   ```bash
   ls /home/ubuntu
   ```

3. Make sure `rushiengg.pem` is present.

---

## Step 9: Connect to Private Instance

1. Inside bastion host, change permission:

   ```bash
   chmod 400 rushiengg.pem
   ```

2. Connect to private EC2:

   ```bash
   ssh -i rushiengg.pem ubuntu@<PRIVATE_IP>
   ```

---

## Step 10: Deploy Application on Private Instance

1. Create index file:

   ```bash
   nano index.html
   ```

2. Paste following code:

   ```html
   <!DOCTYPE html>
   <html>
     <body>
       <h1>This is server runs on private subnet</h1>
     </body>
   </html>
   ```

3. Save and exit.
4. Run python server:

   ```bash
   python3 -m http.server 8000
   ```

5. Repeat same steps on second instance.

---

## Step 11: Create Load Balancer

1. Go to **EC2 → Load Balancers**.
2. Click on **Create Load Balancer**.
3. Select **Application Load Balancer**.

### Basic Configuration

4. Give name: `aws-prod-example-lb`.
5. Select Scheme → Internet-facing.
6. Select IP type → IPv4.

### Network Mapping

7. Select VPC → aws-prod-example-vpc.
8. Select both AZs.
9. Select public subnets.

### Security Group

10. Select security group → aws-prod-example.

---

## Step 12: Create Target Group

1. Click on **Create target group**.
2. Select target type → Instance.
3. Give name → `aws-prod-example`.
4. Set port → 8000.
5. Select VPC → aws-prod-example-vpc.

### Register Targets

6. Select both private instances.
7. Click on **Include as pending**.
8. Click on **Create target group**.

---

## Step 13: Attach Target Group to Load Balancer

1. Go back to load balancer creation page.
2. In Listeners and routing section, select created target group.
3. Click on **Create Load Balancer**.
4. Wait until status becomes Active.

---

## Step 14: Open Port 80 in Security Group

1. Go to **EC2 → Security Groups**.
2. Select `aws-prod-example`.
3. Click on **Edit inbound rules**.
4. Add rule:
   - Type → HTTP
   - Port → 80
   - Source → Anywhere

5. Save rules.

---

## Step 15: Test Application

1. Go to **EC2 → Load Balancers**.
2. Copy DNS name of load balancer.
3. Open browser.
4. Paste DNS name with http.

Example:

    http://aws-prod-example-lb-xxxx.elb.amazonaws.com

5. Output should display application page.
6. Refresh multiple times to verify load balancing.

---
