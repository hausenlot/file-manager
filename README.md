# File Manager System

A distributed file management system capable of handling file uploads, asynchronous processing, and storage.

## Architecture

The system consists of two main components:
-   **API Server**: Handles HTTP requests, file uploads, and acts as the entry point.
-   **Worker**: A background service that processes uploaded files (e.g., uploads to Object Storage).

They communicate via **RabbitMQ** for task distribution and share a **MongoDB** database for state management. **MinIO** is used for object storage.

## Prerequisites

-   Node.js (v18+ recommended)
-   MongoDB
-   RabbitMQ
-   MinIO Server

## Getting Started

1.  **Clone the repository**.
2.  **Install dependencies**:
    ```bash
    cd api && npm install
    cd ../worker && npm install
    ```
3.  **Configuration**:
    -   Copy `api/.env.example` to `api/.env` and configure accordingly.
    -   Copy `worker/.env.example` to `worker/.env` and configure accordingly.
4.  **Run the services**:
    -   Start the API: `cd api && npm run dev`
    -   Start the Worker: `cd worker && node src/worker.js` (or use a process manager)

## Features

-   File Upload with metadata
-   Asynchronous processing queue
-   Real-time status updates (Socket.io)
-   S3-compatible storage integration
