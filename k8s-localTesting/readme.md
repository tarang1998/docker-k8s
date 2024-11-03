- Commands to test the application locally before deployment to kubernetes 


- minikube start
- kubectl apply -f k8s/mongo-deployment.yaml
- kubectl apply -f k8s/backend-deployment.yaml
- kubectl apply -f k8s/frontend-deployment.yaml
- minikube service frontend --url

