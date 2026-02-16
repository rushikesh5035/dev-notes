# AWS CLI

## About

### What is AWS CLI?

The AWS Command Line Interface (CLI) is a unified tool to manage your AWS services. With just one tool to download and configure, you can control multiple AWS services from the command line and automate them through scripts.

### Why use AWS CLI?

The AWS CLI provides direct access to the AWS public APIs. It allows you to develop shell scripts to manage your resources, which can be faster and more reproducible than using the AWS Management Console (GUI).

### Key benefits of AWS CLI

AWS CLI offers several advantages, including:

- **Automation**: You can write scripts to automate repetitive tasks.
- **Speed**: Executing commands is often faster than clicking through the console.
- **Consistency**: Scripts ensure that tasks are performed exactly the same way every time.
- **Functionality**: Some features are available in the CLI or API before they appear in the Console.
- **Cross-platform**: Works on Windows, macOS, and Linux.

---

## Installation and Configuration

### Installing AWS CLI

You can install the AWS CLI on your local machine using the official installers provided by AWS for Windows, macOS, and Linux. For Python environments, you can also use `pip` to install it.

### Configuring credentials

Before using the CLI, you must configure it with your credentials. The `aws configure` command prompts you for your AWS Access Key ID, Secret Access Key, default region name, and default output format.

### Managing Profiles

You can store credentials for multiple AWS accounts or users by using named profiles.

For example, you can configure a profile with `aws configure --profile my-profile` and then use it in commands by adding the `--profile my-profile` flag.

### Credential Precedence

The CLI looks for credentials in a specific order:

1. Command line options
2. Environment variables
3. The AWS credentials file
4. The AWS config file
5. Instance profile credentials (for EC2 instances)

---

## Working with Commands

### Basic command structure

Most AWS CLI commands follow a standard structure:
`aws <service> <command> <subcommand> [options and parameters]`

For example: `aws s3 ls` lists your S3 buckets.

### Output formats

The CLI supports multiple output formats for command results:

- **JSON**: The default format, best for programmatic processing.
- **Table**: A human-readable format that displays data in a grid.
- **Text**: A simple tab-delimited format, useful for text processing tools like grep or awk.

### Getting help

You can get help for any command by appending `help` to the command.

For example, `aws s3 help` provides documentation on available S3 commands and options.

---

## Common Operations

### S3 Operations

You can use the CLI to manage S3 buckets and objects.

- `aws s3 ls`: Lists buckets or objects.
- `aws s3 cp`: Copies files between your local machine and S3, or between S3 buckets.
- `aws s3 sync`: Synchronizes the contents of a bucket and a directory, or two buckets.
- `aws s3 rm`: Deletes objects.

### EC2 Operations

You can manage your virtual servers (instances).

- `aws ec2 describe-instances`: Lists your EC2 instances and their attributes.
- `aws ec2 start-instances`: Starts stopped instances.
- `aws ec2 stop-instances`: Stops running instances.

### IAM Operations

You can manage users, groups, and roles.

- `aws iam list-users`: Lists IAM users in your account.
- `aws iam create-user`: Creates a new user.
