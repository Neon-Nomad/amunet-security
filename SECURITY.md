# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| 1.x     | :x:                |

## Reporting a Vulnerability

We take the security of Amunet AI seriously. If you believe you have found a security vulnerability in the platform, please **do not** open a public issue.

Instead, please report it responsibly:

1.  Email **security@amunet.ai** with a description of the vulnerability.
2.  Include steps to reproduce the issue.
3.  We will acknowledge your report within 48 hours.

We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

## Demo Mode Disclaimer

The current public deployment is a **Frontend Demonstration** running on mock data. It does not connect to a real backend or production database. 

*   **Mock Credentials:** Finding "vulnerabilities" in the mock login (e.g., hardcoded credentials in `AmunetAPI.ts`) is expected behavior for the demo environment.
*   **Simulated Logs:** The logs displayed in the "Audit Trail" are generated for demonstration and do not represent real user activity.