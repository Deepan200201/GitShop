# GitShop

GitShop is a full-stack e-commerce platform designed to demonstrate a modern, scalable architecture using Python and TypeScript. It leverages FastAPI for a high-performance backend and Next.js for a responsive, server-rendered frontend, all backed by a robust MySQL database.

## Project Overview

This application was built to simulate a real-world shopping experience, complete with different user roles (consumers and sellers), inventory management, and secure transaction flows. The goal was to create a clean, maintainable codebase that follows best practices for containerization and API design.

## Key Features

- **User System**: Secure authentication and profile management for both customers and merchants.
- **Product Management**: Sellers can easily list and manage products, while customers can browse and filter the catalog.
- **Shopping Experience**: A fully functional cart system that persists data across sessions.
- **Order Processing**: Complete checkout flow with order tracking and history.
- **Invoicing**: Automated generation of PDF invoices for every purchase.
- **Reviews**: A verified review system allowing legitimate buyers to rate products.
- **Interface**: A polished, responsive UI featuring a glassmorphism aesthetic and dark mode support.

## Technology Stack

**Backend**
- FastAPI (Python)
- MySQL 8.0
- SQLModel (ORM)
- Docker & Docker Compose

**Frontend**
- Next.js 14 (TypeScript)
- Tailwind CSS
- Shadcn UI

## Setup Instructions

The project is containerized using Docker Compose for easy deployment.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/gitshop.git
    cd gitshop
    ```

2.  **Run the application**:
    ```bash
    docker compose up -d --build
    ```

    This will start the database, backend, and frontend services.

3.  **Access the services**:
    -   Frontend: http://localhost:3000
    -   Backend API: http://localhost:8000
    -   API Documentation: http://localhost:8000/api/v1/docs

## License

This project is open source and available under the MIT License.
