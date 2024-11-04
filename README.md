# dockerProject

- curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json
aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://iam_policy.json


- eksctl create iamserviceaccount --cluster cluster --namespace kube-system --name aws-load-balancer-controller --attach-policy-arn arn:aws:iam::448049797968:policy/AWSLoadBalancerControllerIAMPolicy --approve

helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=cluster --set serviceAccount.create=false --set serviceAccount.name=aws-load-balancer-controller
