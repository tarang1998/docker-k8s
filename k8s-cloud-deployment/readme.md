-  eksctl create cluster --name doctorcluster --region us-east-1 --nodegroup-name standard-nodes --node-type t3.small --nodes 3 --nodes-min 2 --nodes-max 5 --managed

- aws eks --region us-east-1 update-kubeconfig --name doctorcluster

- kubectl apply -f mongo-pv-pvc.yaml
- kubectl apply -f mongo-deployment.yaml
- kubectl apply -f backend-deployment.yaml
- kubectl apply -f frontend-deployment.yaml