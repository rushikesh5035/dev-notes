# AWS CodeCommit

### Introduction

AWS CodeCommit is a version control service hosted by Amazon Web Services that you can use to privately store and manage assets (such as documents, source code, and binary files) in the cloud. It is a secure, highly scalable, managed source control service that hosts private Git repositories.

### Steps to setup

1. **Go to AWS and sign in.**
2. **Create Repository:**
   - Go to the CodeCommit console.
   - Click on **Create repository**.
   - Enter a repository name and description (optional).
   - Click **Create**.
3. Create an IAM user and attach the `AWSCodeCommitPowerUser` permission policy.
   - _Note: AWS suggests using an IAM user for CodeCommit because the root user has too many restrictions._
4. Sign in through the IAM user.
5. Go to CodeCommit and copy the HTTPS clone URL.
6. Now we need HTTPS Git credentials for AWS CodeCommit.
   - To create credentials: Go to IAM -> select current user -> Security credentials -> navigate to **HTTPS Git credentials for AWS CodeCommit** -> Create and copy credentials.
7. After that, paste the clone URL into the terminal. It will ask you to enter credentials -> paste the newly created HTTPS Git credentials and the repo will be cloned.
8. Now you can add files, code, etc.
9. You can also push code to CodeCommit by:
   ```bash
   git add .
   git commit -m "commit message"
   git push
   ```
10. Go to the repo on AWS and see the pushed code.

## Disadvantages of CodeCommit

1. Less features.
2. AWS restricted.
3. Fewer integrations with services outside AWS.
