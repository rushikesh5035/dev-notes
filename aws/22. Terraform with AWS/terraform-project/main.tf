// create aws VPC with name of myvpc and CIDR block of var.cidr (https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/vpc)
resource "aws_vpc" "myvpc" {
  cidr_block = var.cidr
}

// create a subnet in the VPC with name of mysubnet and CIDR block of var.cidr (https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/subnet)

resource "aws_subnet" "mysubnet1" {
  vpc_id = aws_vpc.myvpc.id
  cidr_block = "10.0.1.0/24" // this is a smaller CIDR block that can be used for a subnet within the VPC. It allows for 256 IP addresses to be allocated within the subnet, which can be useful for hosting resources and services that require a smaller number of IP addresses.
  availability_zone = "us-east-1a" // this is the availability zone where the subnet will be created.

  map_public_ip_on_launch = true // this will automatically assign a public IP address to any instances launched in the subnet, which can be useful for accessing the instances from the internet.
}

// create another subnet in the VPC with name of mysubnet2 and CIDR block of var.cidr (https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/subnet)

resource "aws_subnet" "mysubnet2" {
  vpc_id = aws_vpc.myvpc.id
  cidr_block = "10.0.2.0/24" 
  availability_zone = "us-east-1b" 
  map_public_ip_on_launch = true
}

// now we have created a VPC with two subnets, we can create an internet gateway and attach it to the VPC to allow communication between the subnets and the internet (https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/internet_gateway)


resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.myvpc.id
}

// now we create IGW, we can create a route table and associate it with the subnets to allow traffic to flow between the subnets and the internet (https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route_table)

resource "aws_route_table" "rt" {
  vpc_id = aws_vpc.myvpc.id

  route {
    cidr_block = "0.0.0.0/0" // this route allows all traffic to flow to the internet through our internet gateway.
    gateway_id = aws_internet_gateway.igw.id // connects the route to the internet gateway
  }
}

// now we created a route table, we can associate it with the subnets to allow traffic to flow between the subnets and the internet (https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route_table_association)

resource "aws_route_table_association" "rta1" {
  subnet_id = aws_subnet.mysubnet1.id // attach the route table to the first subnet
  route_table_id = aws_route_table.rt.id // attach the route table to the first subnet
}

resource "aws_route_table_association" "rta2" {
  subnet_id = aws_subnet.mysubnet2.id // attach the route table to the second subnet
  route_table_id = aws_route_table.rt.id // attach the route table to the second subnet
}

// 1. terraform validate -> checks the syntax of the configuration files and ensures that all required variables are defined.
// 2. terraform plan -> creates an execution plan or try-run that shows what actions Terraform will take to create the infrastructure based on the configuration files. 
// it shows the resources that will be created, modified, or destroyed, and allows you to review the changes before applying them when apply on aws, it will create the 1 VPC, 2 subnets, 1 internet gateway, 1 route table, and 2 route table associations as defined in the configuration files.

// 3. terraform apply -> applies the changes defined in the execution plan to create the infrastructure on AWS.


// now we have created a VPC with two subnets, we can create a security group to allow traffic to flow between the subnets and the internet (https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group)

resource "aws_security_group" "mysg" {
    name = "web-sg" 
    description = "Security group for web servers"
    vpc_id = aws_vpc.myvpc.id

    // ingress means inbound rules/ incoming traffic
    ingress {
        description = "HTTP from VPC"
        from_port = 80 
        to_port = 80
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        description = "SSH"
        from_port = 22 
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port = 0
        to_port = 0
        protocol = "-1" // -1 means all protocols
        cidr_blocks = ["0.0.0.0/0"] // this allows all outbound traffic to flow to the internet.

    }

    tags = {
        Name = "web-sg"
    }
}


// now we have created a security group, we can create an EC2 instance and associate it with the security group to allow traffic to flow between the instance and the internet (https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/instance)
resource "aws_instance" "webserver1" {
    ami                     =   "ami-0b6c6ebed2801a5cb" 
    instance_type           =   "t2.micro" 
    vpc_security_group_ids  =   [aws_security_group.mysg.id]
    subnet_id               =   aws_subnet.mysubnet1.id
    user_data_base64        =   base64encode(file("userdata.sh"))
}

resource "aws_instance" "webserver2" {
    ami                     =   "ami-0b6c6ebed2801a5cb" 
    instance_type           =   "t2.micro" 
    vpc_security_group_ids  =   [aws_security_group.mysg.id]
    subnet_id               =   aws_subnet.mysubnet2.id
    user_data_base64        =   base64encode(file("userdata1.sh"))
}


// now we have created an EC2 instance, we can create an S3 bucket to store data (https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket)  
resource "aws_s3_bucket" "mybucket" {
  bucket = "terraform-project-bucket-50350079767" 
}

// now we have created an S3 bucket, we can create an IAM role to allow the EC2 instance to access the S3 bucket (https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role)
# resource "aws_iam_role" "myrole" {
#     name = "myrole"
#     assume_role_policy = jsonencode({
#         Version = "2012-10-17"
#         Statement = [
#         {
#             Action = "sts:AssumeRole"
#             Effect = "Allow"
#             Principal = {
#             Service = "ec2.amazonaws.com"
#             }
#         }
#         ]
#     })
# }


// now we have to create an load balancer to distribute traffic between the EC2 instances (https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb)
resource "aws_lb" "myalb" {
  name               = "myalb"
  internal           = false
  load_balancer_type = "application"
  
  security_groups    = [aws_security_group.mysg.id]
  subnets            = [aws_subnet.mysubnet1.id, aws_subnet.mysubnet2.id]

  tags = {
    Name = "web"
  }
}

// now we have created a load balancer, we can create a target group and attach the EC2 instances to the target group to allow traffic to flow between the load balancer and the EC2 instances (https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_target_group)
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


// now we have created a target group, we can attach the EC2 instances to the target group to allow traffic to flow between the load balancer and the EC2 instances (https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_target_group_attachment)
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

// now we have created a listener, we can create a listener to listen for incoming traffic on the load balancer and forward it to the target group (https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener)
resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_lb.myalb.arn
  port              = "80"
  protocol          = "HTTP"
    
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}

// this output will display the DNS name of the load balancer after it is created, which can be used to access the web servers through the load balancer. The DNS name will be in the format of "myalb-1234567890.us-east-1.elb.amazonaws.com" and can be used to access the web servers through the load balancer.
output "loadbalancerdns" {
  value = aws_lb.myalb.dns_name
}

// terraform destroy -> destroys the infrastructure that was created by terraform apply. It will delete all the resources that were created, including the VPC, subnets, internet gateway, route table, security group, EC2 instances, S3 bucket, and load balancer. It is important to note that terraform destroy will prompt for confirmation before deleting the resources, and it will also show a plan of what resources will be destroyed before proceeding with the destruction.