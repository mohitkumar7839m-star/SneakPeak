# SneakPeak 👟

### Discover Your Style. Step Into SneakPeak.

SneakPeak is a full-stack sneaker e-commerce web application built to provide customers with a smooth online shopping experience and administrators with tools to manage products, inventory, customers, and orders.

The project is developed using the MERN stack and includes customer-facing shopping functionality alongside an administrative dashboard.

---

## ✨ Features

### Customer Features
- Browse and explore sneaker products.
- View product details and available sizes.
- Select shoe sizes and add products to the cart.
- Manage cart quantities and view calculated prices.
- Complete the checkout process.
- View order confirmations and track order statuses.
- Manage customer profiles.
- Add and manage delivery addresses.
- Change account passwords.

### Admin Features
- Secure admin login.
- Admin dashboard with store statistics.
- Add and manage products.
- Edit product details and pricing.
- Manage product inventory and shoe-size stock.
- View customer information.
- View and manage customer orders.
- Update order statuses.
- Monitor low-stock and out-of-stock inventory.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Vite | Frontend development and build tool |
| Node.js | Backend runtime |
| Express.js | Backend framework and REST APIs |
| MongoDB | Database |
| Mongoose | MongoDB object modelling |
| JWT | Authentication |
| bcrypt | Password hashing |
| CSS | Interface styling |

---

## 📁 Project Structure

The project contains separate frontend and backend applications.

SneakPeak/
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── public/
├── package.json
└── README.md

*Note: Adjust this structure if the actual repository folders differ.*

---

## ⚙️ Getting Started

Follow these steps to run the project locally.

### Prerequisites

Install the following:

- Node.js
- npm
- MongoDB Atlas account or a local MongoDB installation
- Git

### 1. Clone the repository

```bash
git clone https://github.com/mohitkumar7839m-star/SneakPeak.git
cd SneakPeak
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` directory.

Add the environment variables required by the backend configuration.

Example format:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

**Important:** The variable names above are examples. Confirm that they match the names actually used in the backend source code before running the application. Never commit real database credentials or secrets to GitHub.

### 5. Start the backend

From the `server` directory:

```bash
npm start
```

### 6. Start the frontend

Open another terminal in the project root:

```bash
npm run dev
```

Vite will display the local frontend URL in the terminal.

---

## 🛍️ Inventory Management

SneakPeak supports inventory management at the product-size level.

Administrators can manage available stock for different shoe sizes. When a customer places an order, the corresponding inventory is updated.

---

## 📊 Admin Dashboard

The administrative dashboard provides an overview of store activity, including:

- Product statistics
- Order statistics
- Customer information
- Revenue information
- Low-stock product indicators
- Inventory availability

---

## 🧪 Testing

The following functionality has been manually tested during development:

- Admin authentication and dashboard access
- Product creation and editing
- Product catalogue browsing
- Size selection and cart operations
- Checkout and order confirmation
- Inventory deduction after ordering
- Customer profile and address management
- Order status updates
- Customer order history

Testing results reflect the development environment and should not be interpreted as a complete production security or performance audit.

---

## 🔐 Security

The application uses authentication and password hashing mechanisms.

Before any public production deployment, additional security checks, configuration reviews, and end-to-end testing should be completed.

Do not publish `.env` files, database credentials, JWT secrets, or other private configuration values.

---

## 🚀 Future Improvements

Potential improvements include:

- Online payment gateway integration
- Email notifications for orders
- Product reviews and ratings
- Advanced search and filtering
- Improved product imagery
- Automated testing
- Production deployment and monitoring

These are proposed improvements, not claims that the features are currently implemented.

---

## 👥 Team & Acknowledgements

**Project:** SneakPeak
**Category:** Full-Stack Web Development
**Technology:** MERN Stack

Add the project contributors and their respective responsibilities here.

---

## 📄 License

This project is developed for educational and demonstration purposes. Add a license if the project is intended to be distributed under specific terms.
