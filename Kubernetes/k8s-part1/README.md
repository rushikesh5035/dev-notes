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

- ## Deploying Architecture with K8s
  Your frontend, backend are all pods in your kubernetes cluster
     <p align="center">
       <img width="600" src="https://github.com/user-attachments/assets/6a013a1f-8d72-4f2e-8f00-22eed783997c">
    </p>
- In Kubernetes, if we want to start a container we don't start a container directly. We start a **Pod**.

   _**Note**: A single **Pod** can contain one or more containers._

  <br>

- A **Node** is simply a EC2 machine (VM) where we can run our containers. In Kubernetes, we divide the **Nodes** into two categories:

  - Master Nodes (Control Pane)
  - Worker Nodes

  <br>

- **Master Nodes** are responsible for managing the **Pods**. Its the master node's responsibility to:

  - deploy bunch of containers as per the requirement.
  - manage them.

  <br>

- **Worker Nodes** are the ones who actually run the containers.

  <br>

- **Kubernetes Cluster** is the collection of **Master Nodes** and **Worker Nodes**.

  <br>

  <details>
    <summary> <b>Master Node Internals</b> </summary>

    <p align="center">
      <img width="500" src="https://github.com/user-attachments/assets/d623e0f8-961f-4984-a2bb-125149265b10">
    </p>

    - **API Server**: its the main entry point for all requests. developer sends the request (eg: 'pls initiate and run that docker image') to this server inside master nodes.

    - **etcd**: similar to redis. but unlike redis, its a distributed key-value store that stores the cluster state (eg: if there we want to run them on different pods, then storing 'pod1': backend1, 'pod2': backend2). means key-value pairs can be shared across multiple machines.

    - **Scheduler**: it looks at the cluster state and decides where to run the container. eg: if there are 2 worker nodes, then it will decide to run the container on worker node 1 or 2.

    - **Controller Manager**: runs an infinite loop to make sure that the cluster state is as per the requirement (checks it by running other controllers). eg: if the container is down, then it will restart it.

    </details>
    <details>
    <summary> <b>Worker Node Internals</b> </summary>

    <p align="center">
      <img width="500" src="https://github.com/user-attachments/assets/3485c8cd-bf7d-4d9c-b943-b99b291bfeda">
    </p>
  
    - **container runtime**: its the place where the container actually runs. eg: docker.

    - **kubelet**: it is the agent that runs on each worker node. it is responsible for making sure that the containers are running in a pod.

    - **kube-proxy**: it is responsible for making sure that the network is properly set up. eg: if we have 2 pods, then it will make sure that they can communicate with each other.

    </details>
      

    
