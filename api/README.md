# File Manager API Service

The API service for the file manager system. It provides endpoints for file uploads and management.

## Installation

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Setup Environment Variables**:
    Copy `.env.example` to `.env` and fill in the required values:
    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/file_manager
    RABBITMQ_URI=amqp://localhost
    # Add other variables as needed
    ```

## Running the Service

-   **Development**:
    ```bash
    npm run dev
    ```
    Starts the server with `nodemon` for hot-reloading.
-   **Production**:
    ```bash
    npm start
    ```
    Starts the server using `node src/server.js`.

## API Endpoints

-   `POST /upload`: Upload a file.
    -   Body: `multipart/form-data` with `file` key.
-   `GET /files/:id`: Get file metadata.
-   `DELETE /files/:id`: Delete a file.
-   `GET /health`: Health check.

## Architecture

The API uses Express.js and connects to MongoDB for data persistence. It communicates with the Worker service using RabbitMQ for asynchronous file processing. Real-time updates are pushed to clients using Socket.io.
