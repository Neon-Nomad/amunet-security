
# Amunet AI | Autonomous Infrastructure Defense

![Amunet AI Banner](https://placehold.co/1200x400/0B0F19/00F0FF?text=AMUNET+AI+%7C+Autonomous+Defense+Platform&font=roboto)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/amunet-ai/platform)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Demo](https://img.shields.io/badge/Demo-Live-FF2A6D)](https://demo.amunet.ai)

**Amunet AI** is a next-generation security platform that turns your cloud infrastructure into a moving target. Unlike traditional firewalls that rely on static rules, Amunet autonomously rotates IP addresses, shifts ports, and deploys high-fidelity honeypots to confuse and trap attackers.

> **Mission:** To make reconnaissance mathematically impossible for adversaries by constantly mutating the attack surface.

---

## 🛑 Project Status: UI Demo

**This repository currently contains a high-fidelity frontend prototype of the Amunet AI platform.**

*   **FUNCTIONAL UI:** The React application is fully built out, showcasing the intended user experience, all major views, and interactive components.
*   **SIMULATED BACKEND:** All data, metrics, and real-time events (like IP rotations or incoming attacks) are generated locally in your browser. There is **no production backend or agent** connected to this demo.
*   **ROADMAP:** We are actively developing the production backend services (Go/Python) and infrastructure agents needed to bring the full vision to life. See the [ROADMAP.md](ROADMAP.md) for details.

This demo serves as a detailed blueprint for the final product and a platform for user experience feedback.

---

## 📸 Visual Tour

### Command Center

The central hub for monitoring threat probability, network traffic, and active nodes.
![Command Center](https://placehold.co/1200x675/0B0F19/00F0FF?text=Command+Center+Dashboard&font=roboto)

### Moving Target Defense (MTD)

Visualize the autonomous rotation of IP addresses and port mappings in real-time.
![MTD Visualization](https://placehold.co/1200x675/0B0F19/FFC107?text=Moving+Target+Defense+Visualizer&font=roboto)

### Developer CLI (⌘K)

A power-user terminal for executing audits, deploying decoys, and running "Red Team" simulations.
![Command Palette](https://placehold.co/1200x675/0B0F19/FF2A6D?text=Command+Palette+CLI&font=roboto)

### Defense Mode

3D visualization of the entire fleet defense posture and active threat deflection.
![Defense Mode](https://placehold.co/1200x675/05080f/00F0FF?text=Defense+Mode+3D+View&font=roboto)

---

## * Core Capabilities

### 1. Moving Target Defense (MTD)

* **IP Hopping:** Autonomously rotates public IPs every 60 seconds.
* **Port Shuffling:** Dynamic port mapping for internal services.
* **Ghost Mode:** Obfuscates infrastructure signatures from scanners like Shodan.

### 2. Intelligent Deception

* **Honeypot Grid:** Deploys shadow infrastructure (Databases, K8s clusters) that mirrors production.
* **Payload Analysis:** Captures and analyzes zero-day payloads in a quarantined environment.
* **Attacker Cost:** Increases the economic cost of attacks by wasting adversary time.

### 3. Zero Trust & Compliance

* **Continuous Auth:** Real-time risk scoring for every session.
* **Automated SOC 2:** Evidence collection and audit logging.
* **Lockdown Protocol:** One-click emergency isolation for compromised nodes.

---

## 🛠️ Technology Stack

* **Frontend:** React 18, TypeScript, Tailwind CSS
* **Visualization:** Recharts, Framer Motion, Three.js (Defense View)
* **Simulation:** In-browser `AmunetAPI` service (mimics WebSocket telemetry)
* **Icons:** Lucide React

---

## 🚀 Quick Start

### Prerequisites

* Node.js v18+
* npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/amunet-ai/platform.git

# Install dependencies
cd platform
npm install

# Start the development server
npm start
```

Access the dashboard at `http://localhost:1234`.

---

## 🎮 Demo Mode

By default, the application runs in **Simulation Mode**. It generates realistic telemetry, attack vectors, and logs locally in the browser.

* **Auto-Login:** The login screen is pre-filled with demo credentials.
* **Mock Data:** All threats, agents, and logs are simulated for demonstration purposes.
* **Watermark:** A "DEMO MODE" indicator is visible in the bottom right corner.

To connect to a real control plane, update the configuration in `Settings > Connection`.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with paranoia by the Amunet Security Research Team.*
