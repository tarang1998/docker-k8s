# Kubernetes and Docker

## Creating Docker Images and running the containers locally  
- Update the .env file in the doctor-office-backend folder
```
MONGODB_URL=mongo:27017
MONGODB_DB_NAME=appointments
MONGODB_REPLICA_SET=rs0
ENV=local
```

- To run the frontend, backend and mongo services locally using docker, run the following command in the project root directory:
```
docker-compose up --build
```

- List all the containers: 
```
docker ps -a
```

![Running Containers](/screenshots/docker-local-running-containers.png)

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

- Update the .env file in the doctor-office-backend folder
```
MONGODB_URL=mongo:27017
MONGODB_DB_NAME=appointments
MONGODB_REPLICA_SET=rs0
ENV=cloud
```

- After creating the ECR repositories in AWS and configuring the AWS CLI, authenticate docker to ECR
```
aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com
```

- Build and tag the docker images.

    - Build the docker image for the front end service
    ```
    cd docker-office-frontend
    docker build -t <frontendRepositoryUri>:latest .
    ```

    - Build the docker image for the back end service
    ```
    cd doctor-office-backend
    docker build -t <backendRepositoryUri>:latest .
    ```

- Push the images to the remote repository
```
docker push <frontendRepositoryUri>:latest
docker push <backendRepositoryUri>:latest
```

- Update the frontend and backend deployment config files specifying the correct image path

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
    kubectl exec -it mongo-0 -- mongosh
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

    ![rs.status()](/screenshots/rs.status.png)

- Install the Metrics Server. The Metrics Server collects resource usage metrics (like CPU and memory) and provides them to the HorizontalPodAutoscaler for autoscaling.
```
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

- Check if the Metrics Server Pod is running
```
kubectl get pods -n kube-system
```


### Load Testing an EKS Deployment for Key Metrics

- Scope of Work
    - Latency: Measure the response time under different load conditions.
    - Throughput: Determine the number of requests processed per second.
    - Error Rate: Monitor for failed requests or system errors during the tests.
    - Resource Utilization: Analyze CPU and memory usage on the EKS pods during testing.
 
- Load Testing, Monitoring and Metrics Collection

    - Tool Used : Apache JMeter, Prometheus, Grafana, AWS CloudWatch

    - Set up monitoring tools, such as Prometheus, Grafana, or AWS CloudWatch, to collect and visualize metrics.

        - Setting up AWS CloudWatch

            - Refer to the following documentation : https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Container-Insights-setup-EKS-addon.html 

            - Set up the necessary permissions by attaching the CloudWatchAgentServerPolicy IAM policy to your worker nodes. This is specified in the cluster creation config file

            - Install amazon-cloudwatch-observability add-on in the EKS cluster. This is also specified in the cluster creation config file

            ![Cloud Watch Observability Addon](/screenshots/amazon-cloud-watch-addon.png)

            - Navigate to cloud Watch > Insights > Container Insights 

            ![Container Insights](/screenshots/container-insights.png)

        - Setting up Prometheus

            - Refer the following AWS Documentation : https://docs.aws.amazon.com/eks/latest/userguide/deploy-prometheus.html 

            - Create the prometheus namespace 
            ```
            kubectl create namespace prometheus
            ```

            - Add the prometheus-community chart repository.
            ```
            helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
            ``` 

            - Deploy Prometheus 
            ```
            helm upgrade -i prometheus prometheus-community/prometheus --namespace prometheus --set alertmanager.persistence.storageClass="gp2" --set server/persistentVolume.storageClass="gp2"
            ```
            ![Prometheus Deployment](/screenshots/prometheus-deployment.png)

            - Verify that all of the Pods in the prometheus namespace are in the READY state.
            ```
            kubectl get pods -n prometheus
            ```
            ![Pods namespace Grafana](/screenshots/kubectl-get-pods-n-prometheus.png)

            - Use kubectl to port forward the Prometheus console to your local machine
            ```
            kubectl --namespace=prometheus port-forward deploy/prometheus-server 9090
            ```

            - Access the Prometheus Console : http://localhost:9090 
            ![Prometheus Console](/screenshots/prometheus-console.png)







    - Load scenarios:
        - Light load (e.g., 10 concurrent users).



            - Medium load (e.g., 50 concurrent users).
            - Heavy load (e.g., 200+ concurrent users).
        - Test durations should be sufficient to gather meaningful data (e.g., 10 minutes per scenario).

    - Monitoring and Metrics Collection
        - Capture pod-level CPU and memory utilization during load testing.

- Reporting and Analysis
    - Summarize your findings in a detailed report, including:
        - Graphs and tables of latency, throughput, error rates, and resource utilization.
        - Key observations about system behavior under different load conditions.
        - Recommendations for optimizing the application or cluster configuration based on test results.

- Documentation
Provide a step-by-step guide to replicate your tests, including:
Tools and configurations used.
Kubernetes manifests or Helm charts.
Load testing scripts and test plans.

### Clean Up 

- To Delete the cluster along with all the associated resources 
```
eksctl delete cluster -f eks-cluster-deployment.yaml
```

