# 🛍️ ClickstreamStore

**ClickstreamStore** is a robust E-Commerce application designed to demonstrate **Data Engineering** pipelines and **Cloud Integration**. Unlike standard online stores, this project tracks detailed user behavior (Clickstream data) to generate actionable business insights through a simulated ETL (Extract, Transform, Load) process.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20MySQL%20%7C%20Azure-blue)

## 🚀 Key Features

### 🛒 Client-Side (Storefront)

- **Dynamic Product Catalog**: Fetches seeded data effectively from database (powered by FakeStoreAPI during setup).
- **User Tracking**: Assigns unique Session IDs to track anonymous user journeys.
- **Event Logging**: Captures granular events including:
  - `VIEW_HOME`
  - `VIEW_PRODUCT`
  - `ADD_TO_CART`
  - `PURCHASE`
- **Interactive Cart**: Full cart functionality with client-side state management.

### ⚙️ Data Engineering (The Core)

- **Hybrid Log Ingestion**:
  - **Primary**: Uploads JSON logs directly to **Azure Blob Storage**.
  - **Fallback**: Automatically saves to local `temp_logs` if cloud connection fails.
- **ETL Service**: A simulated job (similar to Azure Functions) that:
  1.  **Extracts** raw logs from Blob/Local storage.
  2.  **Transforms** data to aggregate metrics (Views, Carts, Purchases).
  3.  **Loads** clean data into **MySQL** Analytics tables.
  4.  **Archives** processed logs to prevent duplication.

### 📊 Admin Dashboard

- **Secure Authentication**: Protected Admin portal.
- **Real-time Analytics**:
  - **Traffic Trends**: Hourly traffic visualization (Line Chart).
  - **Product Performance**: Top performing products by Views, Add-to-Carts, and Purchases (Table).
- **Pipeline Control**: Manually trigger ETL jobs and reset analytics data directly from the UI.

## 🛠️ Tech Stack

- **Runtime**: Node.js (Express.js)
- **Database**: MySQL (Flexible Server)
- **Cloud Storage**: Azure Blob Storage SDK (`@azure/storage-blob`)
- **Frontend**: EJS Templating + TailwindCSS (CDN)
- **Visualization**: Chart.js

## 📦 Installation & Setup

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/her1god/clickStreamStore.git
    cd clickStreamStore
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:

    ```env
    PORT=3000

    # Database Configuration
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=
    DB_NAME=clickstream_store

    # Cloud Storage (Optional - Defaults to Local if empty)
    AZURE_STORAGE_CONNECTION_STRING=

    # Admin Credentials
    ADMIN_USER=admin
    ADMIN_PASS=password123
    ```

4.  **Setup Database**
    Run the setup script to create tables and seed initial product data:

    ```bash
    node scripts/setupDb.js
    ```

5.  **Run the Application**
    ```bash
    npm start
    ```
    Access the store at `http://localhost:3000` and Admin Panel at `http://localhost:3000/admin/login`.

## ☁️ Deployment (Azure)

This project is optimized for deployment on **Azure App Service**:

1.  **App Service**: Host the Node.js application.
2.  **MySQL Flexible Server**: Host the database.
3.  **Storage Account**: Store the Clickstream logs.

_Note: The application logic automatically detects the environment. If `AZURE_STORAGE_CONNECTION_STRING` is provided, it switches to Cloud Mode._

---

**Created by Heri Ramadhan** | _Simulating Modern Data Pipelines_
