# AWS CloudFormation

## About

### What is CloudFormation?

AWS CloudFormation is an Infrastructure-as-Code (IaC) service that allows you to define and provision AWS infrastructure using code. Instead of manually creating resources in the console, you describe them in a template file.

### What are Stacks?

A Stack is a collection of AWS resources that you manage as a single unit. All the resources in a stack are defined by the stack's CloudFormation template. When you delete a stack, all its related resources are deleted automatically.

### Why use CloudFormation?

CloudFormation provides a common language to model and provision all the infrastructure resources in your cloud environment. It allows for safe, repeatable, and automated deployment of resources.

### Key benefits of CloudFormation

CloudFormation offers several advantages, including:

- **Infrastructure as Code**: Manage your infrastructure with the same tools and workflows (like git) you use for application code.
- **Automation**: Automate the creation and deletion of resources, reducing manual error.
- **Cost Estimation**: Estimate the cost of your resources before you create them.
- **Dependency Management**: CloudFormation automatically handles resource dependencies and deployment order.
- **Rollback Triggers**: Automatically rolls back to the previous state if resource creation fails.

---

## Template Anatomy and Concepts

### What is a Template?

A template is a JSON or YAML text file that describes your AWS resources. It serves as the blueprint for your infrastructure.

### Key Template Sections

- **Parameters**: Inputs you pass to your template at runtime (e.g., KeyPair name, InstanceType).
- **Resources**: The actual AWS components you want to create (e.g., `AWS::EC2::Instance`, `AWS::S3::Bucket`). This is the only required section.
- **Outputs**: Values returned after the stack is created (e.g., the URL of a load balancer).
- **Mappings**: A lookup table for values, often used for region-specific AMI IDs.
- **Conditions**: Logic to control whether certain resources are created (e.g., create a prod DB only if Env=Prod).

### Intrinsic Functions

CloudFormation provides built-in functions to assign values to properties that are not available until runtime.

- `Ref`: Returns the value of the specified parameter or resource.
- `Fn::GetAtt`: Returns the value of an attribute from a resource in the template.
- `Fn::Sub`: Substitutes variables in an input string.
- `Fn::ImportValue`: Returns the value of an output exported by another stack.

---

## Creating and Managing Stacks

### Validating Templates

Before deploying, it's good practice to validate your template syntax.

```bash
aws cloudformation validate-template --template-body file://template.yml
```

### Packaging Templates

If your template references local files (like Lambda code or nested templates), you must package it first. This command uploads artifacts to S3 and produces a new template file referencing those S3 objects.

```bash
aws cloudformation package \
  --template-file template.yml \
  --s3-bucket my-artifact-bucket \
  --output-template-file packaged.yml
```

### Deploying Stacks

The `deploy` command is the easiest way to create or update a stack. It handles change sets automatically.

```bash
aws cloudformation deploy \
  --template-file packaged.yml \
  --stack-name MyStack \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides Env=dev KeyName=my-key
```

### Using Change Sets

For critical environments, use Change Sets to preview what will happen before you execute an update.

1. Create a change set.
2. View the change set to see which resources will be added, modified, or deleted.
3. Execute the change set to apply the changes.

---

## Advanced Features

### Nested Stacks

As your infrastructure grows, you can break your templates into smaller, reusable components called nested stacks. A parent stack calls these child stacks using the `AWS::CloudFormation::Stack` resource.

### Drift Detection

Over time, resources might be manually changed in the console, causing them to differ from the template configuration. Drift detection allows you to identify these unmanaged changes.

```bash
aws cloudformation detect-stack-drift --stack-name MyStack
```

### StackSets

StackSets allow you to create, update, or delete stacks across multiple accounts and regions with a single operation. This is essential for multi-account governance.

---

## Best Practices and Safeguards

### Resource Deletion Policies

Use the `DeletionPolicy` attribute to preserve resources when their stack is deleted.

- **Retain**: Keeps the resource.
- **Snapshot**: Creates a snapshot before deletion (for RDS, EBS, Redshift).

### Stack Policies

Stack policies are JSON documents that define update actions that can be performed on designated resources. You can use them to prevent accidental updates to critical production databases.

### Capabilities

When your template creates IAM resources (like Roles or Policies), you must explicitly acknowledge this by providing the `CAPABILITY_IAM` or `CAPABILITY_NAMED_IAM` capability.

---

## Troubleshooting

### Common Errors

- **CREATE_FAILED**: Inspect the "Events" tab or use `describe-stack-events`. The first failure usually triggers a rollback.
- **ROLLBACK_COMPLETE**: The stack creation failed and was cleaned up. You cannot update a stack in this state; you must delete and recreate it.
- **UPDATE_ROLLBACK_COMPLETE**: An update failed, and CloudFormation reverted the stack to its previous working state.

### Debugging Tips

- use `--disable-rollback` during `create-stack` to keep the resources alive for inspection if creation fails.
- Check CloudTrail logs if you suspect permission issues.
