# Product Roadmap

This document outlines the development stages of Amunet AI, distinguishing between current simulated capabilities and planned backend implementation.

## ✅ Production-Ready (Now)
- **Frontend UX:** Complete dashboard, responsive layout, CLI, and routing.
- **Simulation Engine:** Realistic data generation for threats, logs, and agent heartbeats.
- **Visualizations:** 3D Sentinel view, real-time charts, and topology maps.
- **Compliance Module:** Static controls mapped to dynamic logic.
- **Test Suite:** Comprehensive unit and integration tests for views and services.

## 🚧 Backend Implementation (Q1 2025)
- **Control Plane:** Python/FastAPI backend to replace `AmunetAPI` simulation.
- **Agent (Go):** Release the `amunet-agent` binary for Linux.
  - Integration with `iptables` for local port redirection.
  - Heartbeat mechanism over WebSocket.
- **Cloud Integrations:**
  - **AWS:** Lambda function for Elastic IP allocation/rotation.
  - **Docker:** Honeypot containers (SSH, HTTP, Telnet).
  - **GeoIP/ASN:** Real-time traceback enrichment.

## 🔮 Advanced AI (Q2 2025)
- **RL-Based Policies:** Reinforcement Learning model to optimize rotation intervals based on attack intensity.
- **Adversary Emulation:** Built-in Red Teaming engine to test defenses against known APT TTPs.
- **Threat Intel Feeds:** Integration with real-time global CVE databases.