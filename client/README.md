# File Manager Client

A React-based frontend for the File Manager system, built with Vite.

## Features

-   File Upload with progress tracking.
-   File listing and management.
-   Real-time updates via Socket.io.

## Prerequisites

-   Node.js (v18+ recommended)
-   API Service running (usually on port 3000)

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Configuration**:
    The client expects the API to be available. By default, it connects to standard local ports. Review `src/config.js` or environment variables if you need to customize connections.

3.  **Run Locally**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or similar).

## Docker

The client can be run as part of the full system using Docker Compose from the root directory.
