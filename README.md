# SneakPeak 👟

### Discover Your Style. Step Into SneakPeak.

**SneakPeak** is a full-stack sneaker e-commerce web application built with the MERN stack. It brings together a modern sneaker-shopping experience for customers and a centralized management system for administrators.

Customers can explore sneakers, select sizes, manage their shopping carts, place orders, and track purchases. Administrators can manage products, size-wise inventory, customers, orders, and store activity through a dedicated dashboard.

---

## ✨ Features

### 🛍️ Customer Experience

- Browse the sneaker catalogue.
- Explore product details, images, brands, categories, and available sizes.
- Select shoe sizes and add products to the shopping cart.
- Update cart quantities and view automatically calculated prices.
- Complete the checkout process.
- View order confirmations and order history.
- Track order status updates.
- Manage personal profile information.
- Add and update delivery addresses.
- Change account passwords.
- Explore related product recommendations.

### ⚙️ Admin Dashboard

- Secure administrator authentication.
- Dashboard with store statistics.
- Create, view, update, and manage products.
- Manage product details, pricing, and images.
- Maintain inventory at the individual shoe-size level.
- View customer information.
- Access and manage customer orders.
- Update order statuses.
- Monitor low-stock and out-of-stock inventory.

### 📦 Inventory & Order Management

- Track stock for individual shoe sizes.
- Automatically deduct inventory when orders are placed.
- Restore inventory when eligible orders are cancelled.
- Manage order processing and delivery statuses.
- Maintain product and order information through the backend.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Vite | Frontend development and production build |
| React Router | Client-side navigation |
| Axios | API communication |
| Lucide React | Interface icons |
| CSS | Styling and responsive layouts |
| Node.js | Backend runtime |
| Express.js | REST API and server framework |
| MongoDB | NoSQL database |
| Mongoose | Database modelling and queries |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Helmet | HTTP security headers |
| CORS | Cross-origin request handling |
| Git & GitHub | Version control and collaboration |

---

## 📁 Project Structure

The repository is organized into two independent applications: `client` and `server`.

```text
SneakPeak/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   │   └── Admin/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

Follow these instructions to run SneakPeak locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- [MongoDB Atlas](https://www.mongodb.com/atlas) or a local MongoDB database
- [Git](https://git-scm.com/)
- A code editor such as Visual Studio Code

### 1. Clone the repository

```bash
git clone https://github.com/mohitkumar7839m-star/SneakPeak.git
cd SneakPeak
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `server` directory.

Add your own configuration values:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_private_jwt_secret
FRONTEND_URLS=http://localhost:5173
NODE_ENV=development
```

**Important:** Use the exact variable names expected by the backend. Keep your real MongoDB connection string and JWT secret private. Never commit your `.env` file to GitHub.

### 4. Start the backend

From the `server` directory, run:

```bash
npm start
```

The backend should start at:

```text
http://localhost:5000
```

API health endpoint:

```text
http://localhost:5000/api/health
```

### 5. Install frontend dependencies

Open another terminal at the repository root:

```bash
cd client
npm install
```

### 6. Configure the frontend API URL

If your frontend API configuration uses `VITE_API_URL`, create a `.env` file inside `client`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 7. Start the frontend

From the `client` directory:

```bash
npm run dev
```

Vite will display the local development URL in the terminal. Open that URL in your browser.

---

## 🔌 Backend API Overview

The Express backend exposes REST API routes for the application's main modules.

| API Base Route | Functionality |
|---|---|
| `/api/auth` | User authentication and account operations |
| `/api/products` | Product catalogue and product operations |
| `/api/cart` | Shopping cart operations |
| `/api/orders` | Checkout and order management |
| `/api/inventory` | Inventory management |
| `/api/admin/customers` | Customer administration |
| `/api/admin/dashboard` | Dashboard statistics |
| `/api/health` | Backend health check |

Protected routes require appropriate authentication and authorization.

---

## 📊 Admin Dashboard

The administration panel provides tools to manage the store and monitor its activity.

Key areas include:

- Product management
- Customer management
- Order management
- Revenue and order statistics
- Inventory monitoring
- Low-stock indicators

---

## 🧪 Development Testing

The following workflows have been manually tested during development:

- Administrator login and dashboard access.
- Product creation and editing.
- Product catalogue browsing.
- Product size selection.
- Shopping cart quantity and price calculations.
- Checkout and order confirmation.
- Inventory deduction after placing orders.
- Customer profile and address management.
- Customer order history.
- Administrator order status updates.
- Inventory restoration after eligible order cancellations.

These tests reflect development-environment testing and do not constitute a complete production security, performance, or compatibility audit.

---

## 🔐 Security Considerations

SneakPeak incorporates several security-related mechanisms:

- JWT-based authentication.
- Password hashing using bcryptjs.
- Protected backend routes.
- Administrator authorization middleware.
- Helmet security headers.
- CORS configuration.
- Environment-based configuration for sensitive values.

A complete production release should also undergo security review, authorization testing, error-handling checks, and end-to-end testing.

**Never publish database credentials, JWT secrets, access tokens, or private environment files.**

---

## 🚀 Deployment

The planned deployment architecture is:

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend API | Render |
| Database | MongoDB Atlas |

Production environment variables must be configured through the respective hosting platforms. Do not include private credentials in this repository.

Deployment links will be added after the hosted application has been successfully tested.

---

## 🔮 Future Improvements

Potential areas for future development include:

- Online payment gateway integration.
- Email notifications and order updates.
- Product reviews and ratings.
- Advanced search and filtering.
- Enhanced product imagery.
- Automated testing.
- Performance optimization.
- Production monitoring.

These are planned improvements and should not be interpreted as currently implemented features.

---

## 👥 Team & Acknowledgements

**Project Name:** SneakPeak  
**Project Category:** Full-Stack E-Commerce Web Application  
**Technology:** MERN Stack

Developed as a collaborative web development project.

Add the names of all six project contributors and their respective responsibilities here.

---

## 📄 License

This project is developed for educational and demonstration purposes. No open-source license has been specified yet.

---

<p align="center">
  **SneakPeak 👟**
  <br />
  Discover Your Style. Step Into SneakPeak.
</p>
