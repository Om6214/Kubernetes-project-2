# Event Management System — Deploy on EKS (Kubernetes)

This repo contains a small microservice setup:

- **frontend** (serves the UI)
- **auth-service** (login/signup + JWT)
- **event-service** (events CRUD)
- **booking-service** (book/cancel + talks to event-service)

The Kubernetes YAMLs live in `manifests/` and are written for **AWS EKS + AWS Load Balancer Controller (ALB Ingress)**.

---

## What you need before you start

1. An **EKS cluster** you can access with `kubectl`.
2. `kubectl`, `awscli`, and either `eksctl` or Helm installed.
3. **AWS Load Balancer Controller** installed in the cluster.
4. Docker images for the 4 apps pushed to a registry your cluster can pull from (ECR is the usual choice).
5. A MongoDB you can reach from EKS (Mongo Atlas / DocumentDB / self-managed). You’ll paste the connection string into a Kubernetes Secret.

---

## 1) Install AWS Load Balancer Controller (ALB Ingress)

If you already have it, skip this.

High level checklist:

- Your cluster should have OIDC enabled.
- Public subnets should be tagged so the controller can create an internet-facing ALB.
- Install the controller with Helm using an IAM role/service account.

Typical commands (example only — adjust cluster name, region, account id):

```bash
# (optional) associate OIDC
eksctl utils associate-iam-oidc-provider \
  --region <region> \
  --cluster <cluster-name> \
  --approve

# install the controller (usually via Helm)
# follow AWS docs for the exact IAM policy + service account steps
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=<cluster-name> \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

You’ll know it’s working when you see the controller pods running:

```bash
kubectl get pods -n kube-system | grep load-balancer-controller
```

---

## 2) Check the Kubernetes manifests in this repo

The deployment YAMLs are in:

- `manifests/namespace.yaml`
- `manifests/app-secret.yaml`
- `manifests/config/*.yaml`
- `manifests/svcs/*.yaml`
- `manifests/workloads/**/` (Deployments)
- `manifests/ingress.yaml` (ALB Ingress)

### Important: update the Secret before applying

Open `manifests/app-secret.yaml` and replace the placeholders:

- `MONGO_URI` (required by all 3 backend services)
- `JWT_SECRET` (required by all 3 backend services)

If those are missing, the Nest apps will exit on startup.

### Important: update Docker image names

The Deployments currently reference images like `om6214/auth-svc:latest`.

If you are using ECR (recommended for EKS), update the `image:` fields in:

- `manifests/workloads/auth-svc-workloads/auth-deployment.yaml`
- `manifests/workloads/event-svc-workloads/event-deployment.yaml`
- `manifests/workloads/booking-svc-workloads/booking-deployment.yaml`
- `manifests/workloads/frontend-svc-workloads/frontend-deployment.yaml`

Example ECR image format:

```
<aws_account_id>.dkr.ecr.<region>.amazonaws.com/<repo>:<tag>
```

---

## 3) Apply everything to Kubernetes

From the repo root:

```bash
kubectl apply -f manifests/namespace.yaml
kubectl apply -f manifests/app-secret.yaml
kubectl apply -f manifests/config/
kubectl apply -f manifests/svcs/
kubectl apply -f manifests/workloads/
kubectl apply -f manifests/ingress.yaml
```

Or, once you’re confident the folder only contains what you want:

```bash
kubectl apply -f manifests/
```

---

## 4) Verify the rollout

```bash
kubectl get all -n event
kubectl get pods -n event
```

If something is not starting:

```bash
kubectl describe pod -n event <pod-name>
kubectl logs -n event <pod-name>
```

Backend services have health endpoints:

- `GET /health/live`
- `GET /health/ready`

The deployments use those for probes.

---

## 5) Get the ALB URL

Once the ALB controller creates the load balancer, you should see an address:

```bash
kubectl get ingress -n event
```

Look for the `ADDRESS` field. That’s your ALB DNS name.

Open it in the browser:

- Frontend: `http://<alb-dns>/`
- Auth API: `http://<alb-dns>/api/auth/...`
- Events API: `http://<alb-dns>/api/events/...`
- Bookings API: `http://<alb-dns>/api/bookings/...`

---

## Notes / gotchas

- **booking-service needs EVENT_SERVICE_URL**. This is already set in `manifests/config/booking-configmap.yaml` and must not point to localhost.
- If your images are **private** (ECR), make sure nodes can pull them (EKS worker role permissions) or use `imagePullSecrets`.
- If the ALB never appears, it’s usually one of these:
  - Controller not installed / not running
  - Missing subnet tags for ALB
  - Missing IAM permissions for the controller
  - IngressClass is wrong (this repo uses `ingressClassName: alb`)

---

## Clean up

```bash
kubectl delete namespace event
```
