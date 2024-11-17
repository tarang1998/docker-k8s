# Kubernetes and Docker

## Creating Docker Images and running the containers locally  
- To run the frontend, backend and mongo services locally using docker, run the following command in the project root directory:
```
- docker-compose up --build
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

- Install the Metrics Server. The Metrics Server collects resource usage metrics (like CPU and memory) and provides them to the HorizontalPodAutoscaler.
```
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

- Check if the Metrics Server Pod is running
```
kubectl get pods -n kube-system
```

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

## Deploying the application to cloud 
- Setting up the EKS Cluster on AWS with eksctl
```
eksctl create cluster --name doctorcluster --region us-east-1 --nodegroup-name standard-nodes --node-type t3.small --nodes 3 --nodes-min 2 --nodes-max 5 --managed
```

- Alternatively, could use the following command with the configuration file : [eks-cluster-deployment.yaml](./k8s-cloud-deployment/eks-cluster-deployment.yaml)
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

- Delete the cluster along with all the associated resources 
```
eksctl delete cluster -f eks-cluster-deployment.yaml
```