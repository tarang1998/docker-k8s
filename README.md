# Kubernetes and Docker

## Creating Docker Images and running the containers locally  
- To run the frontend, backend and mongo services locally using docker, run the following command in the project root directory:
```
docker-compose up --build
```
- List all the containers: 
```
docker ps -a
```

- Try accessing the front end at : http://localhost:3001/, backend at : http://localhost:3000/appointments and mongo DB using MongoDBCompass.

## Setting up a local kubernetes cluster before deploying it to the cloud 

### Start minikube 

-  Minikube allows to simulate a real Kubernetes environment on the local system for testing and development purposes. The command spins up a virtual machine or container and configures it to run Kubernetes.
```
minikube start
```

- Check the status of minikube
```
minikube status
```

### Upload local images to docker hub

- Check the docker images
```
docker images 
```

- Tag the docker images to push it to the remote docker hub account 
```
docker tag dockerproject-frontend tarangnair/frontend:latest
docker tag dockerproject-backend tarangnair/backend:latest
docker tag mongo tarangnair/mongo:latest
```

- Login into docker hub 
```
docker login
```

- Push the images to docker hub 
```
docker push tarangnair/frontend:latest
docker push tarangnair/backend:latest
docker push tarangnair/mongo:latest
```

- Navigate to the directory 'k8s-localTesting' and update the image property in the yaml file to point to your remote docker hub repository.

### Apply Kubernetes configuration and access the application

- Apply Kubernetes configuration defined in the following yaml files.
```
kubectl apply -f mongo-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
```

- Start the minikube tunnel. This allows Kubernetes services inside the Minikube cluster that are exposed with a LoadBalancer type to get a publicly accessible IP address on your local machine.
```
minikube tunnel 
```

- Get all the running services to access the frontend and backend endpoints 
```
kubectl get svc
```

- Access the kubernetes dashboard run the command
```
minikube dasboard
```

- Stop the minikube service
```
minikube stop
```

## Deploying the application to cloud - AWS 

### Current Architecture 
- [AWS Architecture](https://lucid.app/lucidchart/35c9d803-957a-4b4c-aa84-ef9f496c27fd/edit?invitationId=inv_546543de-f751-459a-9f7d-bc028998cef7)

### Push Docker images to Amazon Elastic Container Registry in AWS 

- After creating the ECR repositories in AWS and configuring the AWS CLI, authenticate docker to ECR
```
aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com
```

- Tag the docker images 
```
docker tag dockerproject-frontend <frontendRepositoryUri>:latest
docker tag dockerproject-backend <backendRepositoryUri>:latest
```

- Push the images to the remote repository
```
docker push <frontendRepositoryUri>:latest
docker push <backendRepositoryUri>:latest
```

### Setting up the EKS Cluster


- Navigate to the directory 'k8s-cloud-deployment', and use the command: 
```
eksctl create cluster -f eks-cluster-deployment.yaml
```

- Check if the cluster is running 
```
eksctl get cluster
```

- Configure kubectl to point to the eks 
```
aws eks --region us-east-1 update-kubeconfig --name doctorcluster
```

- Check the cluster nodes 
```
kubectl get nodes
```

### Deploy Kubernetes configuration to EKS

- Deploy the frontend, backend and mongo kubectl configurations to EKS.
```
kubectl apply -f ./k8s-cloud-deployment/deployment --recursive
```

- Now we need to specify a specific mongo pod as the master node and other pods as the slave node
    
    - Access one of the mongo pods
    ```
    kubectl exec -it mongo-0 --mongosh
    ```

    - Initiate the replica set 
    ```
    rs.initiate(
        {
            _id: "rs0",
            members: [
                {_id: 0, host:"mongo-0.mongo.default.svc.cluster.local:27017" },
                {_id: 1, host:"mongo-1.mongo.default.svc.cluster.local:27017" },
                {_id: 2, host:"mongo-2.mongo.default.svc.cluster.local:27017" },
            ]
        }
    );
    ```

    - Exit the pod and access it again to check the status using 
    ```
    rs.status()
    ```

    [rs.status()](/screenshots/rs.status.png)

- Install the Metrics Server. The Metrics Server collects resource usage metrics (like CPU and memory) and provides them to the HorizontalPodAutoscaler for autoscaling.
```
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

- Check if the Metrics Server Pod is running
```
kubectl get pods -n kube-system
```

### Clean Up 

- To Delete the cluster along with all the associated resources 
```
eksctl delete cluster -f eks-cluster-deployment.yaml
```

