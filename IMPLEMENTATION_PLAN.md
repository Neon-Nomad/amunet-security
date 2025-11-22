# Amunet AI - Technical Implementation Plan

## Executive Summary

This document outlines a comprehensive technical implementation plan to evolve the Amunet AI prototype into a production-ready, enterprise-grade security platform. The strategy focuses on building a scalable and resilient backend, a sophisticated Moving Target Defense (MTD) system, and a multi-layered defense fabric to achieve 99% effectiveness against automated threats. The plan is divided into distinct phases, prioritizing the development of a core control plane and agent, followed by the progressive integration of advanced features like AI-driven behavioral analysis and automated response. This phased approach ensures incremental value delivery and allows for continuous feedback and adaptation.

---

## A. High-Level Architecture Diagram (Text Description)

The Amunet AI platform is designed as a distributed, cloud-native system with a clear separation of concerns between the control plane, data plane, and the agents.

*   **Clients (React Frontend, CLI):** The existing React UI, plus a future CLI for DevOps/power-users. They communicate with the Control Plane via a REST API (for configuration, queries) and WebSockets (for real-time telemetry).

*   **Control Plane (Python/FastAPI):** The central brain of the system, hosted in a multi-cloud environment on Kubernetes.
    *   **API Gateway:** Manages all incoming requests, handles authentication (OAuth/MFA), rate limiting, and routes traffic to appropriate microservices.
    *   **Core Services (FastAPI):** A set of microservices for:
        *   **Agent Management:** Onboarding, configuring, and monitoring agents.
        *   **MTD Controller:** Orchestrates IP/port mutation strategies.
        *   **Threat Intel Service:** Ingests, analyzes, and correlates threat data from agents and external sources.
        *   **Analytics & Reporting Service:** Processes telemetry and generates security insights.
        *   **User Management & Auth Service:** Handles user accounts, roles, and permissions.
    *   **Real-time Communication Layer:**
        *   **Message Queue (NATS):** Decouples services and manages command/telemetry flow between the control plane and agents with high performance.
        *   **WebSocket Service (FastAPI + WebSockets):** Pushes real-time updates (threats, agent status, MTD changes) to the frontend.

*   **Data Stores (Cloud-native & Managed):**
    *   **PostgreSQL (e.g., Amazon RDS, Google Cloud SQL):** Stores structured data: agent configurations, user data, MTD policies, compliance reports.
    *   **Time-Series DB (TimescaleDB):** A PostgreSQL extension to store high-volume telemetry, logs, and performance metrics for efficient querying and analysis.
    *   **Object Storage (e.g., S3, GCS):** Stores large artifacts like captured payloads from honeypots and forensic data.
    *   **Key-Value Store (Redis):** Caches session data, feature flags, and orchestrates distributed locks for MTD state management.

*   **Amunet Agent (Go):** A lightweight, cross-platform agent deployed on monitored nodes (VMs, containers, bare metal).
    *   **Telemetry Collector:** Gathers system metrics, network traffic (e.g., via eBPF), process information, and logs.
    *   **MTD Actuator:** Executes MTD commands received from the control plane (e.g., calls cloud APIs to change IPs, modifies `iptables`/`nftables`).
    *   **Honeypot Service:** Deploys and manages decoy services (e.g., fake SSH, database listeners) using lightweight containers.
    *   **Local Threat Detection:** Can run basic IDS/IPS rules (e.g., via embedded Suricata/Zeek libraries) for immediate response.
    *   **Secure Communicator:** Establishes a mutually authenticated TLS (mTLS) connection to the control plane's message queue (NATS).

*   **External Integrations:**
    *   **Cloud Provider APIs (AWS, GCP, Azure):** For MTD (IP/firewall changes) and honeypot deployment (spawning VMs/containers).
    *   **SIEMs (Splunk, Elastic):** The control plane forwards curated threat intelligence and audit logs.
    *   **Alerting Systems (PagerDuty, Slack):** For incident notifications.

---

## B. Technology Stack Recommendations

This stack prioritizes performance, scalability, and developer productivity, leveraging open-source standards and managed services where practical.

*   **Frontend:**
    *   **Framework:** React 18, TypeScript, Tailwind CSS, Vite (No change)
    *   **State Management:** Zustand (for simplicity and performance)
    *   **Data Fetching:** TanStack Query (React Query)
    *   **Visualization:** Recharts, Three.js

*   **Control Plane (Backend):**
    *   **Framework:** Python 3.11+ with FastAPI
    *   **ASGI Server:** Uvicorn
    *   **API Gateway:** Traefik Proxy (excellent for Kubernetes) or a managed cloud provider gateway.
    *   **Real-time Messaging (Agent Comms):** NATS
    *   **Internal Service Bus:** RabbitMQ (if complex inter-service routing is needed)
    *   **Containerization:** Docker & Kubernetes

*   **Agent:**
    *   **Language:** Go
    *   **Networking:** Official NATS Go client, Go standard library for HTTP.
    *   **System Interaction:** eBPF libraries (e.g., Cilium's eBPF library) for efficient network monitoring.
    *   **Cloud SDKs:** Official Go SDKs for AWS, GCP, Azure.

*   **Databases:**
    *   **Primary/Relational/Time-Series:** PostgreSQL 15+ with the TimescaleDB extension. This hybrid approach simplifies the stack.
    *   **Caching/Session/Locking:** Redis
    *   **Payload/Artifact Storage:** AWS S3 or Google Cloud Storage

*   **AI/ML & Data Science:**
    *   **Core Libraries:** Scikit-learn, PyTorch (for deep learning models), Pandas
    *   **MLOps Platform:** MLflow or Kubeflow for experiment tracking and model deployment.
    *   **Data Processing:** Apache Spark (for large-scale batch analysis, if needed).

*   **Deployment & Operations:**
    *   **Infrastructure as Code (IaC):** Terraform
    *   **Orchestration:** Kubernetes (managed services like EKS, GKE, AKS are preferred)
    *   **CI/CD:** GitHub Actions
    *   **Observability:**
        *   **Metrics:** Prometheus
        *   **Dashboards:** Grafana
        *   **Logging:** Loki
        *   **Tracing:** OpenTelemetry (instrumented in all services)

*   **Security & Compliance:**
    *   **Secrets Management:** HashiCorp Vault
    *   **Authentication:** Keycloak or Ory Hydra (self-hosted), or Auth0/Okta (managed).
    *   **Service Mesh:** Istio or Linkerd (for mTLS, traffic control, and observability within Kubernetes).

---
## C. Phased Implementation Timeline (12-18 months)

This timeline prioritizes incremental delivery of core features.

*   **Phase 1: Core Backend & Agent MVP (Months 1-4)**
    *   **Goal:** Establish the foundational backend infrastructure and a functional agent.
    *   **Tasks:**
        *   Develop the Python/FastAPI control plane with basic Agent Management and User Auth services.
        *   Design and implement the Go agent with secure communication (mTLS over NATS) and basic telemetry collection (CPU, memory, network stats).
        *   Set up the core data stores: PostgreSQL, Redis.
        *   Implement basic API endpoints for agent registration and data ingestion.
        *   Establish CI/CD pipeline and Terraform scripts for a development environment.
    *   **Outcome:** A live, albeit simple, system where agents can register and send telemetry to the control plane. The frontend can be updated to connect to this real backend, replacing the mock service.

*   **Phase 2: MTD Implementation (Months 5-8)**
    *   **Goal:** Build and validate the core Moving Target Defense functionality.
    *   **Tasks:**
        *   Develop the MTD Controller service.
        *   Implement IP rotation logic for AWS, GCP, and Azure in the Go agent.
        *   Implement port shuffling using `iptables`/`nftables`.
        *   Develop state management in Redis to track MTD configurations and ensure seamless transitions.
        *   Build the frontend components to visualize and control MTD strategies.
        *   **Key Challenge:** Minimizing latency and avoiding service disruption during transitions.
    *   **Outcome:** A functional MTD system capable of automatically rotating IPs and shuffling ports for a set of nodes.

*   **Phase 3: Deception Layer & Threat Intel (Months 9-12)**
    *   **Goal:** Add honeypot and threat intelligence capabilities.
    *   **Tasks:**
        *   Develop the agent's ability to deploy containerized honeypots (e.g., fake SSH, HTTP servers).
        *   Create the Threat Intel Service to ingest data from honeypots.
        *   Implement payload capture and basic analysis (sandboxing can be a later addition).
        *   Integrate external threat feeds.
        *   Develop the initial AI/ML models for anomaly detection based on telemetry.
    *   **Outcome:** The platform can deploy decoys, capture low-level attack data, and generate initial threat intelligence.

*   **Phase 4: Layered Defense & Automation (Months 13-16)**
    *   **Goal:** Integrate with other security systems and build the automated response engine.
    *   **Tasks:**
        *   Develop integrations for firewalls (Security Groups, WAFs) and IDS/IPS (Suricata).
        *   Build the Automated Response System with a basic playbook engine.
        *   Implement real-time risk scoring.
        *   Create SIEM integration for data forwarding.
        *   Enhance AI/ML models with data from the deception layer.
    *   **Outcome:** The system can now take automated actions (e.g., block an IP, isolate a node) based on correlated threat data.

*   **Phase 5: Scale, Harden & Optimize (Months 17-18)**
    *   **Goal:** Prepare for enterprise-wide deployment.
    *   **Tasks:**
        *   Conduct extensive performance and load testing.
        *   Implement multi-tenancy and advanced RBAC.
        *   Complete security hardening (secrets management, full audit logging).
        *   Develop automated red teaming and chaos engineering tests.
        *   Finalize documentation and operational playbooks.
    *   **Outcome:** A production-ready, scalable, and resilient platform.

---
## D. Key Technical Challenges & Solutions

1.  **MTD State Synchronization & Resiliency:**
    *   **Challenge:** Ensuring all components (load balancers, firewalls, DNS, agents) have a consistent view of the "current" active IP/port configuration, especially during a failure.
    *   **Solution:** Use a distributed consensus store like `etcd` or a Redis-based distributed lock mechanism for MTD state transitions. The control plane acts as the single source of truth, and agents have a fallback mechanism to re-register if they lose contact during a transition. All changes must be transactional.

2.  **Performance Impact of MTD:**
    *   **Challenge:** IP rotation and port shuffling can introduce latency or drop packets if not handled gracefully.
    *   **Solution:** Use connection draining on load balancers. For IP changes, update DNS with a low TTL well in advance. For port shuffling, use `iptables` rules that allow existing connections to finish on the old port while new connections are directed to the new one. The mutation frequency must be tunable based on application sensitivity.

3.  **High-Volume Telemetry Processing:**
    *   **Challenge:** Handling millions of events per second from thousands of agents without overwhelming the backend or database.
    *   **Solution:** Use a high-performance message queue like NATS. Agents should pre-process and batch data. Ingest data into a time-series database like TimescaleDB which is optimized for this workload. Use a stream processing engine (like Apache Flink or Spark Streaming) for real-time analysis if necessary.

4.  **Agent Security & Trustworthiness:**
    *   **Challenge:** The agent has privileged access. A compromised agent is a major security risk.
    *   **Solution:** Enforce mTLS for all agent-to-control-plane communication. Agents should be signed and their integrity verified on startup. The agent's permissions should be strictly limited to what's necessary (e.g., only the permissions to modify its own IP or run specific `iptables` commands). Use signed commands from the control plane.

---
## E. Security Effectiveness Breakdown (How to reach 99%)

The 99% effectiveness target is against *automated and opportunistic attacks*, not determined human adversaries. It's achieved by layering defenses that disrupt specific stages of the cyber kill chain.

*   **Reconnaissance (70% reduction):**
    *   **MTD (IP Hopping, Port Shuffling):** This is the core contributor. Automated scanners (Shodan, etc.) that scan an IP range will find the infrastructure is constantly moving, making it extremely difficult to build a reliable map of the attack surface. The data becomes stale almost instantly.
    *   **Ghost Mode:** Obfuscating service banners and infrastructure signatures further confuses scanners.

*   **Weaponization & Delivery (15% reduction):**
    *   **Deception Layer:** Attackers who manage to find a target may be directed to a high-fidelity honeypot. They waste their exploits and payloads on a decoy.
    *   **WAF/Firewall Integration:** Standard signature-based blocking of common exploits and delivery mechanisms (e.g., Log4j scanners).

*   **Exploitation & Installation (10% reduction):**
    *   **Honeypot Sandboxing:** If an attacker exploits a decoy service, the payload is captured and analyzed, preventing it from reaching production.
    *   **Zero-Trust Micro-segmentation:** Even if a production host is compromised, strict network policies prevent lateral movement to other critical services. The "blast radius" is contained.
    *   **IDS/IPS:** Real-time detection and blocking of known exploit patterns on the wire.

*   **Command & Control / Actions on Objectives (4% reduction):**
    *   **AI Behavioral Analysis:** The system detects anomalous egress traffic (e.g., C2 callbacks, data exfiltration) that deviates from the established baseline, triggering an alert and automated response.
    *   **Automated Response:** The system can automatically sever the C2 connection by blocking the malicious IP/domain or isolating the compromised node.

*   **Total Effectiveness:** The multiplicative effect of these layers leads to the high effectiveness rate. `1 - ( (1-0.70) * (1-0.15) * (1-0.10) * (1-0.04) ) ~= 99.1%`. This is a model; real-world effectiveness would need to be constantly validated via testing.

---
## F. API Design (Key Endpoints & Message Subjects)

A hybrid approach of REST for client-server interaction and async messaging for agent communication ensures both usability and real-time performance.

**1. REST API (Control Plane ↔ Frontend)**

Exposed via the API Gateway, consumed by the React UI.

*   `POST /api/v1/auth/token`: Login, get JWT token.
*   `GET /api/v1/agents`: List all agents, status, and config.
*   `GET /api/v1/agents/{agent_id}`: Get detailed info for one agent.
*   `PUT /api/v1/agents/{agent_id}/config`: Update agent configuration (e.g., telemetry level).
*   `GET /api/v1/mtd/strategies`: List available MTD strategies.
*   `POST /api/v1/mtd/strategies`: Create a new MTD strategy.
*   `GET /api/v1/threats`: Get list of recent threats, with filtering.
*   `GET /api/v1/analytics/telemetry`: Query time-series telemetry data for dashboards.

**2. Async API (Control Plane ↔ Agent via NATS)**

The backbone of the system, using NATS subjects for high-throughput, low-latency communication.

*   **Agent → Control Plane (Publishing):**
    *   `amunet.telemetry.{agent_id}.health`: Agent heartbeat and health status (JSON payload). `{"cpu": 10.5, "mem_used": 2048, "timestamp": "..."}`. Published every 60s.
    *   `amunet.telemetry.{agent_id}.network`: Network flow data (JSON or Protobuf for efficiency).
    *   `amunet.events.{agent_id}.threat`: High-priority threat event detected by the agent (e.g., honeypot interaction, anomalous process).
    *   `amunet.logs.{agent_id}.system`: System logs from the agent.

*   **Control Plane → Agent (Subscribing):**
    *   The agent subscribes to `amunet.commands.{agent_id}`.
    *   **Command Payloads (JSON):**
        *   MTD IP Rotation: `{"command": "mtd_rotate_ip", "provider": "aws", "interface": "eth0", "new_ip_config": "{...}"}`
        *   MTD Port Shuffle: `{"command": "mtd_shuffle_ports", "service": "ssh", "new_port": 2222}`
        *   Deploy Honeypot: `{"command": "deploy_honeypot", "type": "cowrie", "port": 2223}`
        *   Update Config: `{"command": "update_config", "config": {"telemetry_level": "verbose"}}`

---
## G. Database Schema (Core PostgreSQL Tables)

This schema is normalized for consistency but uses `jsonb` for flexible configuration data.

*   **`users`**
    *   `id` (uuid, pk)
    *   `email` (varchar, unique)
    *   `hashed_password` (varchar)
    *   `role` (varchar, e.g., 'admin', 'viewer')
    *   `created_at` (timestamptz)

*   **`agents`**
    *   `id` (uuid, pk)
    *   `hostname` (varchar)
    *   `os_type` (varchar)
    *   `ip_address` (inet)
    *   `status` (varchar, e.g., 'online', 'offline')
    *   `config` (jsonb)
    *   `last_seen` (timestamptz)
    *   `created_at` (timestamptz)

*   **`mtd_strategies`**
    *   `id` (uuid, pk)
    *   `name` (varchar)
    *   `type` (varchar, e.g., 'ip_rotation', 'port_shuffling')
    *   `config` (jsonb, e.g., `{"frequency_seconds": 60, "provider": "aws"}`)
    *   `is_active` (boolean)

*   **`threat_events`**
    *   `id` (uuid, pk)
    *   `agent_id` (uuid, fk to agents)
    *   `type` (varchar, e.g., 'honeypot_login', 'malicious_payload')
    *   `source_ip` (inet)
    *   `payload` (jsonb)
    *   `risk_score` (integer)
    *   `timestamp` (timestamptz)

*   **`telemetry` (TimescaleDB Hypertable)**
    *   `time` (timestamptz, pk)
    *   `agent_id` (uuid, pk, fk to agents)
    *   `metric_name` (varchar, e.g., 'cpu_usage', 'network_out')
    *   `value` (double precision)

---
## H. Deployment Architecture (Kubernetes & Cloud)

*   **Cluster:** EKS (AWS), GKE (GCP), or AKS (Azure) for managed Kubernetes.
*   **Ingress:** Traefik Proxy as a Kubernetes Ingress Controller to manage external access to the API and UI.
*   **Control Plane Services:** Each FastAPI microservice (Agent Management, MTD Controller, etc.) is deployed as a separate Kubernetes `Deployment` with a corresponding `Service`. Auto-scaling is configured based on CPU/memory usage.
*   **Real-time Layer:**
    *   NATS is deployed as a stateful cluster within Kubernetes using the NATS Operator.
    *   The WebSocket service is a standard Kubernetes deployment, scaled horizontally.
*   **Agents:** Deployed outside the main K8s cluster on the target infrastructure (VMs, bare metal, other K8s clusters) using standard OS packages (`.deb`, `.rpm`) or as a DaemonSet in other Kubernetes environments.
*   **Databases:** Use managed cloud services (RDS, Cloud SQL) for PostgreSQL/TimescaleDB and Redis for reliability and scalability.
*   **GitOps:** Use ArgoCD or Flux to automatically sync the state of the Kubernetes cluster with manifests stored in a Git repository.

---
## I. Testing Strategy

A multi-layered testing strategy is crucial for ensuring correctness, performance, and security.

*   **Unit Tests:**
    *   **Go Agent:** Standard Go testing library. Test individual functions (e.g., parsing a command, interacting with a cloud SDK mock).
    *   **Python Backend:** `pytest`. Test business logic within services, API endpoint responses (with mocked database), and data transformations.
    *   **React Frontend:** Jest & React Testing Library. Test individual components and custom hooks.

*   **Integration Tests (in CI/CD):**
    *   Use `docker-compose` to spin up the entire backend stack locally.
    *   Write test scripts that simulate an agent, send telemetry, receive commands, and verify data in the database.
    *   Test the full flow: Agent → NATS → Service → Database.

*   **Security Testing (CI/CD Integrated):**
    *   **SAST (Static Analysis):** Snyk Code or `gosec` for Go.
    *   **DAST (Dynamic Analysis):** OWASP ZAP against a staging environment.
    *   **Dependency Scanning:** Snyk/Dependabot integrated with GitHub.
    *   **Container Scanning:** Trivy to scan Docker images for vulnerabilities.
    *   **Automated Red Teaming:** Custom scripts using tools like `Atomic Red Team` to execute TTPs against a deployed environment and validate that defenses trigger as expected.

*   **Load Testing:**
    *   Use `k6` or `Locust`.
    *   Simulate thousands of agents sending high-volume telemetry to NATS.
    *   Load test the REST API to understand request limits and ensure the system meets performance targets.

---
## J. Open-Source vs. Commercial Considerations

The "Open Core" model is recommended to build community and drive adoption while creating a path to revenue.

*   **Open-Source (MIT/Apache 2.0):**
    *   **Core Agent:** The agent should be fully open-source. This is critical for trust and transparency.
    *   **Core Control Plane:** A single-node, single-tenant version of the control plane.
    *   **What to Open Source:** The agent, the core FastAPI services, the database schema, and the agent communication protocol. This provides a complete, self-hostable solution for individuals and small teams.

*   **Commercial (Enterprise) Features:**
    *   **Scalability & HA:** Multi-tenancy, horizontal scaling, and high-availability deployments.
    *   **Advanced AI/ML:** The most sophisticated behavioral analysis, predictive models, and automated tuning.
    *   **Premium Integrations:** Pre-built, supported integrations for enterprise tools (Splunk, ServiceNow, Okta).
    *   **Compliance & Reporting:** Automated compliance modules for specific standards (PCI-DSS, HIPAA) with audit-ready reports.
    *   **Managed SaaS Offering:** The primary commercial product.
    *   **Support & SLAs:** Enterprise-level support contracts.
