// variable for the CIDR -(classless inter-domain routing) block to be used for the VPC with cide name

variable "cidr" {
    default = "10.0.0.0/16" 
}

// 10.0.0.0/16 is a private IP address range that can be used for a VPC. It allows for a large number of IP addresses (65,536) to be allocated within the VPC, which can be useful for hosting multiple resources and services. The CIDR block can be customized based on the specific needs of the infrastructure being built.