<div align="center">
  <h1>📦 Inventory Management</h1>
  <p><b>Enterprise-Grade Multi-Tenant Inventory Management System</b></p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
</div>

---

## 🚀 Overview

**TenantFlow** is a powerful, scalable, and secure multi-tenant inventory management system designed for modern businesses. It allows multiple organizations (tenants) to manage their inventories, staff, roles, and communications within a single, unified platform while maintaining strict data isolation.

Built with a robust **Node.js/Express** backend and a **PostgreSQL** database, TenantFlow provides the heavy lifting for complex supply chain operations, granular access control, and real-time business insights.

## ✨ Key Features

### 🏢 Multi-Tenancy Architecture
- **Complete Isolation:** Each business operates in its own secure environment.
- **Business Profiles:** Customizable business settings and branding.
- **Onboarding Flow:** Seamless registration and verification for new businesses.

### 🔐 Advanced RBAC (Role-Based Access Control)
- **Granular Permissions:** Define exactly what users can see and do.
- **Custom Roles:** Create roles like 'Owner', 'Manager', 'Stockist', or 'Viewer'.
- **Secure Auth:** JWT-based authentication with password hashing using Bcrypt.

### 📦 Inventory Management
- **Product Tracking:** Manage stock levels, categories, and descriptions.
- **Cloud Analytics:** Integration with **Cloudinary** for high-quality product image hosting.
- **Stock History:** (Planned) Track every movement of goods.

### 📨 Internal Communications & Support
- **Notice Board:** Broadcast announcements to all staff members.
- **Messaging System:** Internal communication between team members.
- **Ticketing System:** Structured support and issue tracking within the organization.

### 📧 Automated Notifications
- **Email Integration:** Automated onboarding emails, OTPs, and status updates via **Nodemailer**.

---

## 🛠️ Technology Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM/Client:** [pg (node-postgres)](https://node-postgres.com/)
- **Authentication:** [JSON Web Token (JWT)](https://jwt.io/)
- **Security:** [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **File Storage:** [Cloudinary](https://cloudinary.com/)
- **Mailing:** [Nodemailer](https://nodemailer.com/)

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v16.x or higher)
- PostgreSQL Database
- Cloudinary Account (for image uploads)

---

## 📂 Project Structure

```text
src/
├── config/         # Database and third-party service configs
├── controllers/    # Request handlers & Business logic
├── models/         # Database schemas & Table definitions
├── routes/         # API Route definitions
├── utils/          # Helper functions & Services
└── index.js        # Entry point
```


---

