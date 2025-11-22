# Contributing to Amunet AI

We welcome contributions from the community! Whether you're fixing a bug, improving documentation, or proposing a new feature, your help is appreciated.

## Local Development Setup

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/amunet-platform.git
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Start the dev server**:
    ```bash
    npm start
    ```

## Code Style & Standards

*   **TypeScript:** We use strict typing. Avoid `any` whenever possible.
*   **Components:** Functional components with React Hooks.
*   **Styling:** Tailwind CSS for all styling. Avoid custom CSS files unless for complex animations.
*   **Icons:** Use `lucide-react` for all iconography.

## Project Structure

*   `services/AmunetAPI.ts`: If you add a new feature, ensure you add a simulation method here so the frontend works without a backend.
*   `types.ts`: Update this file when modifying data models.

## Pull Request Process

1.  Create a feature branch: `git checkout -b feature/my-new-feature`.
2.  Commit your changes with clear messages.
3.  Push to your fork and submit a Pull Request.
4.  Ensure all tests pass (`npm test`).

Thank you for helping us secure the cloud!