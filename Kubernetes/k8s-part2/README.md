# Kubernetes Part 2

## Quick Recap

1. **Cluster**: a small group of servers that work together to provide a service.

2. **Node**: a single server within a cluster.

3. **Pods**: the smallest deployable units in Kubernetes. A Pod encapsulates an application's container (or, in some cases, multiple containers), storage resources, a unique network IP, and options that govern how the container(s) should run.

4. **ReplicaSet**: ensures that a specified number of pod replicas are running at any given time.

5. **Deployment**: provides declarative updates to Pods and ReplicaSets. In short, a Deployment helps you manage Pods and ReplicaSets.

   <br>

   **Difference b/w Deployment & ReplicaSet**: Deployment lets you do rolling updates and rollbacks using ReplicaSets.

   <br>

6. **Service**: an abstract way to expose an application running on a set of Pods as a network service.

---

<details>
<summary>Summarizing  Steps</summary>

_**Note**: If you have a cluster, it will automatically create the nodes. If you have a deployment, it will automatically create replicasets and pods._

So, the steps to start a complete Kubernetes service are:

1. Start a cluster.
2. Create a deployment.
3. Create a service.

### Starting a Cluster

**Locally**

1. Check `/k8s/cluster.yml` for the cluster configuration.

2. Open the `/k8s` folder in terminal. Run the following command to start the cluster:

   ```bash
   kind create cluster --config cluster.yml --name k8s-cluster
   ```

<p align="center">------or------</p>

**Cloud Provider**

1. Create a cluster on a cloud provider (for eg: digitalocean, Vultr).

2. Download the configuration file and replace `~/.kube/config` with it.

### Starting the Deployment

1. Check the `/k8s/deployment.yml` file for the deployment configuration.

2. Open the `/k8s` folder in terminal. Run the following command to start the deployment:

   ```bash
   kubectl apply -f deployment.yml
   ```

3. Check if the deployment is running:

   ```bash
   kubectl get deployments
   ```

### Starting the Service

1. Check the `/k8s/service.yml` file for the service configuration.

  <br>

2. Open the `/k8s` folder in terminal. Run the following command to start the service:

   ```bash
   kubectl apply -f service.yml
   ```

  <br>

3. Go to `http://localhost:30007` to see the service running.

<p align="center">
<img width="500" alt="image" src="https://github.com/its-id/100x-Cohort-Programs/assets/60315832/cfad1539-6c34-4999-ad7d-235d8a822fc5">
</p>

- To export the service using an external LoadBalancer ip, Follow the Cloud Provider step to create the cluster, replace the type of service to LoadBalancer in the service.yml file and restart it.

  <br>

- Copy the external ip and go to `http://<external-ip>:<port>` to see the service running.

  <br>

**Additional Comments**

- To delete the deployment, run:

  ```bash
  kubectl delete deployment <deployment-name>
  ```

- To delete the service, run:

  ```bash
  kubectl delete service <service-name>
  ```

- To delete the cluster, run:

  ```bash
    kind delete cluster --name k8s-cluster
  ```

  **Note**: The above steps are a quick recap of the previous week's learnings. For a detailed explanation, please refer to the previous week's README.

     <br>

</details>

---

---

## Downsides of Services

- **Scaling to multiple apps**:
  - If you have multiple apps, you need to create multiple services.
  - There also limits to how many load balancers you can create.

- **Multiple Certificates for every route**:
  - If you have load balancers, you need to have certificates for every route.

- **No Centralized Control to rate limitting**:
  - You need to manage every service separately.

  <br>

  When our app comes into the above scenarios, we need an **Ingress Controller**.

---

## Ingress & Ingress Controller

- _Ingress is an API object that manages external access to services in a cluster, typically HTTP._

  <br>

- It will provide a single load balancer which will act as a gateway to all the services.

  <br>

- We connect this load balancer with our ingress resource point which routes the traffic to the respective services.

  <br>

- We can't use ingress without an ingress controller. Some of the popular ones can be found [here](https://kubernetes.io/docs/concepts/services-networking/ingress/).

  <br>
