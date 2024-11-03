- Commands to test the application locally before deployment to kubernetes 


- minikube start
- kubectl apply -f k8s/mongo-deployment.yaml
- kubectl apply -f k8s/backend-deployment.yaml
- kubectl apply -f k8s/frontend-deployment.yaml
- kubectl port-forward service/backend-service 3000:3000
- minikube service frontend --url

