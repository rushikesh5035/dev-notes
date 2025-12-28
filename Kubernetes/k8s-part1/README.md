# Kubernetes

## Container Orchestration

- **What are containers?** Isolated environments that contain everything an application needs to run. They are portable, efficient, and easy to use. Eg: Docker lets you create, deploy, and run containers.

- **💡Kubernetes is also known as k8s. K_ _ _ _ _ _ _ _ s**

- **Container Orchestration:** _Managing the lifecycle of containers_, especially in large, dynamic environments. It involves _deploying, scaling, and managing containers_.

- **Why do we need container orchestration?**

  - Starting up a single container requires a lot of manual work. Imagine managing a **cluster** of VMs containing multiple containers.

  - If we want to manage these clusters for us, like simply provide the scripts/instructions to someone else, and it will take care of the rest.

  - If we want to move our containers from one host to another, we need to make sure that the containers are running and the data is not lost.

  - Along with the above points, what if we can monitor the health of our containers, and if they are unhealthy, we can restart them automatically. This is also where container orchestration comes in.
 
- ## Different Architectures for deploying before K8s
  - Backend
      <p align="center">
        <img width="600" src="https://github.com/user-attachments/assets/fb016fa2-1fd1-4337-bf21-5a6b6f39547c">
      </p>
      
  - Frontend (Nextjs) -> EC2 Machine (For Frontend)
      <p align="center">
        <img width="600" src="https://github.com/user-attachments/assets/689f6f88-93b3-47c2-b6c4-8fd78c52d8a6">
      </p>
  - Frontend (React) -> CDN -> S3 Bucket (For Static Files)
      <p align="center">
        <img width="600" src="https://github.com/user-attachments/assets/7d7ae2aa-0c4b-4783-9d87-f3b1159a70d3">
      </p>
