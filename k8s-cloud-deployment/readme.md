-  

- aws eks --region us-east-1 update-kubeconfig --name doctorcluster

- kubectl apply -f mongo-pv-pvc.yaml
- kubectl apply -f mongo-deployment.yaml
- kubectl apply -f backend-deployment.yaml
- kubectl apply -f frontend-deployment.yaml