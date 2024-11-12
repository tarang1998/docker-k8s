# Kubernetes and Docker

## To run the frontend, backend and mongo containers locally using docker 
- docker-compose up
- List all the running containers : docker ps -a

## Setting up a local kubernetes cluster before deploying it to the cloud 

-  Minikube allows to simulate a real Kubernetes environment on the local system for testing and development purposes. The command spins up a virtual machine or container and configures it to run Kubernetes.
```
minikube start
```

- Apply Kubernetes configuration defined in the following yaml files.
```
kubectl apply -f k8s/mongo-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

- Makes the backend accessible locally on port 3000 for testing or interaction.
``` 
kubectl port-forward service/backend-service 3000:3000
```

- To retrieve the public URL to access the frontend application running in Minikube.
```
minikube service frontend --url
```


## Deploying the application to cloud 
- Setting up the EKS Cluster on AWS with eksctl
```
eksctl create cluster --name doctorcluster --region us-east-1 --nodegroup-name standard-nodes --node-type t3.small --nodes 3 --nodes-min 2 --nodes-max 5 --managed
```

- Alternatively, could use the following command with the configuration file : (eks-cluster-deployment.yaml)[./k8s-cloud-deployment/eks-cluster-deployment]
```
eksctl create cluster -f eks-cluster-deployment.yaml
```

- Check if the cluster is running 
```
eksctl get cluster
```

- Delete the cluster along with all the associated resources 
```
eksctl delete cluster -f eks-cluster.yaml
```