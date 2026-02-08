# File Manager Worker Service

The background worker service for the file manager system. It processes files uploaded via the API.

## Installation

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Setup Environment Variables**:
    Copy `.env.example` to `.env` and fill in the required values:
    ```env
    MONGO_URI=mongodb://localhost:27017/file_manager
    RABBITMQ_URI=amqp://localhost
    MINIO_ENDPOINT=localhost
    MINIO_PORT=9000
    MINIO_ACCESS_KEY=minioadmin
    MINIO_SECRET_KEY=minioadmin
    MINIO_BUCKET_NAME=files
    # Add other variables as needed
    ```

## Running the Service

-   **Start Worker**:
    ```bash
    node src/worker.js
    ```
    The worker will connect to RabbitMQ and start consuming messages from the `file_processing` queue.

## Features

-   **Asynchronous Processing**: Handles file processing tasks offloaded by the API.
-   **S3 Integration**: Uploads files to MinIO (or any S3-compatible storage).
-   **State Management**: Updates file status in MongoDB throughout the processing lifecycle.
-   **Event Publication**: Publishes processing events (processing, processed, failed) back to RabbitMQ for other services to consume.

## How it Works

The worker listens for messages on the `file_processing` queue. Each message contains a `fileId` and `filePath`. The worker:
1.  Marks the file as `processing`.
2.  Uploads the file from local storage to MinIO.
3.  Marks the file as `processed` and updates the S3 URL.
4.  Deletes the local file.
5.  Sends a notification about the completion.
