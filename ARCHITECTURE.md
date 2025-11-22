# Architecture Guide

This document outlines the technical structure of the Amunet AI frontend platform.

## High-Level Overview

Amunet is designed as a **Single Page Application (SPA)** that acts as the Command & Control (C2) interface for a distributed fleet of security agents.

### Directory Structure

```
/
├── src/
│   ├── components/     # Reusable UI atoms (StatCard, CommandPalette, etc.)
│   ├── views/          # Main page views (Dashboard, MTD, Compliance)
│   ├── services/       # API & Simulation Logic (AmunetAPI.ts)
│   ├── contexts/       # Global State (AuthContext)
│   ├── types.ts        # TypeScript interfaces
│   ├── constants.ts    # Mock data & config constants
│   └── App.tsx         # Main Router & Layout
```

## The Simulation Layer (`AmunetAPI.ts`)

To facilitate demonstrations without a live Kubernetes cluster, the app includes a robust simulation layer.

*   **Dual Mode:** The service checks for a live backend at `http://localhost:8000`. If unreachable, it falls back to `Simulation Mode`.
*   **Event Emitter:** Uses a subscription model to broadcast real-time events (`intrusion_detected`, `rotation_complete`) to UI components.
*   **State Persistence:** Uses `localStorage` to persist user settings, API keys, and audit logs between reloads.
*   **Honeypot Theater:** Generates realistic-looking attack logs (SQLi, XSS, Brute Force) for visualization.

## Key Modules

### 1. Sentinel Mode (3D Visualization)
Located in `views/SentinelMode.tsx`, this module uses an HTML5 Canvas + Mathematics to project a 3D sphere of nodes. It runs a custom particle engine to visualize threat deflection in real-time.

### 2. Command Palette (CLI)
Located in `components/CommandPalette.tsx`. A terminal emulator that accepts natural language or unix-style commands. It parses input and calls methods directly on the `AmunetAPI` singleton.

### 3. Moving Target Defense (MTD)
Visualizes `Agent` state changes. The animation logic handles the transition between `Active` -> `Rotating` -> `Active` states using Framer Motion layout transitions.

## Security Considerations (Frontend)

*   **Strict CSP:** The app is designed to run with a strict Content Security Policy.
*   **No Sensitive Storage:** Real API keys are stored in memory or secure HTTP-only cookies (in production build), never in `localStorage` (except for demo keys).
*   **Input Sanitization:** All inputs in the Command Palette and Search bars are sanitized before processing.