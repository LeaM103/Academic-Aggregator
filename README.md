This web application runs using a multi-port architecture. The frontend runs on port 3000 and handles the user interface. All search requests are sent to a backend API server running on port 3001, which communicates with external APIs (such as the ArXiv API) and returns processed results. A proxy/load balancer runs on port 8080 and routes incoming traffic to the correct service. This separation of frontend, backend, and proxy makes the system easier to manage, avoids CORS issues, and demonstrates how load balancing works in production environments.”

Academic Aggregator – 3-Server Setup
Architecture

Server 1 (Proxy + Frontend): Serves the web frontend and forwards /api & /whoami requests.

Server 2 (Backend 1): Handles API requests and data aggregation.

Server 3 (Backend 2): Handles API requests and data aggregation.

Proxy uses round-robin to balance requests between Backend 1 and Backend 2.

Local Setup

Backend 1: localhost:3000

Backend 2: localhost:3001

Proxy: localhost:8080

Access via: http://localhost:8080

Real Deployment

Proxy: 52.87.227.106:8080

Backend 1: 54.205.117.66:3000

Backend 2: 100.26.183.187:3000

Notes

/ → frontend

/api → aggregated data (round-robin)

/whoami → returns server info
