# Banking API Core

A secure, scalable, and fully tested RESTful API for core banking operations, built with Node.js, Express, TypeScript, and SQLite.

## Architecture & Design

This API was engineered with a strict focus on **reliability, testability, and data integrity**, adhering to enterprise backend standards to fulfill the project's core and differential requirements.

* **Domain-Driven N-Tier Separation**
  The application strictly isolates concerns across the Routing, Controller, Service, and Repository layers. All core banking rules—such as daily withdrawal limits, balance checks, and account status validations—are centralized in the `AccountService`. This guarantees that business logic is evaluated independently of the database state.
* **ACID-Compliant Financial Operations**
  To ensure absolute data consistency and prevent "phantom funds," all state-mutating operations (deposits, withdrawals, blocking) are executed within atomic SQL Transactions (`BEGIN`, `COMMIT`, `ROLLBACK`). If any step of a transaction fails—such as the creation of an audit log—the entire operation is rolled back.
* **Inversion of Control (Dependency Injection)**
  The codebase is designed for maximum testability. The Service layer relies on data access abstractions (`IAccountRepository`) rather than concrete database classes. This decouples the application logic from SQLite, allowing for frictionless unit testing via mocked repositories and paving the way for future database migrations.
* **"Fail-Fast" Boundary Validation**
  The API perimeter is heavily shielded using **Zod** validation middleware. Malformed payloads, negative transaction amounts, or illogical data (such as a statement `startDate` occurring after an `endDate`) are intercepted and rejected with a `400 Bad Request` before they can consume deeper thread resources or reach the database.
* **Pragmatic Relational Integrity**
  Per the project constraints, the relationship between a `Person` and their `Account` is strictly enforced. The API validates the existence of a `personId` (throwing a `404 Not Found` if missing) before account creation, ensuring referential integrity without over-engineering unrequested CRUD operations for the Person domain. A database initialization script is provided to seed the environment for immediate evaluation.

---

## API Endpoints Summary

### Account Management
* \`POST /accounts\` - Create a new account.
* \`GET /accounts/:accountId/balance\` - Retrieve the current balance and status.
* \`PATCH /accounts/:accountId/block\` - Block or unblock an account (requires a reason).

### Transactions
* \`POST /accounts/:accountId/deposit\` - Deposit funds into an active account.
* \`POST /accounts/:accountId/withdraw\` - Withdraw funds (validates balance and daily limits).
* \`GET /accounts/:accountId/statement\` - Retrieve transaction history (Supports optional `startDate` and `endDate` query parameters in `YYYY-MM-DD` format).

---

## Execution Manual

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** (comes with Node.js)

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Database Initialization
This project uses a local SQLite database. To create the database file, build the tables, and seed the initial Person record, run:
```bash
npm run db:init
```
*(This will generate a `database.sqlite` file in your project root).*

### 3. Running the Server
To start the API in development mode with live logging (via Morgan and Pino):
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

---

## Testing Suite

The application features near 100% test coverage using **Vitest** and **Supertest**, proving the business logic and API boundaries.

### Run All Tests
To execute both the Integration Tests (HTTP routing/validation) and Unit Tests (Business Logic/Mocking):
```bash
npm run test
```
