# 🏥 Hospital Management System (HMS)

A RESTful Hospital Management System (HMS) API built using **Node.js**, **Express.js**, **Sequelize ORM**, and **PostgreSQL (Supabase)**. This project demonstrates a modular backend architecture with authentication, role-based entities, and CRUD operations for hospital management.

---

## 🚀 Features

* User Authentication (Register & Login)
* JWT Access Token Authentication
* User Management
* Doctor Management
* Patient Management
* Department Management
* Doctor–Department Assignment
* Appointment Management
* RESTful API Design
* PostgreSQL Database (Supabase)
* Sequelize ORM
* Modular MVC Architecture

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (Supabase)
* **ORM:** Sequelize
* **Authentication:** JWT (JSON Web Token)
* **Environment Variables:** dotenv
* **Development:** Nodemon

---

## 📁 Project Structure

```text
hospital-management-system/
│
├── src/
│   ├── config/
│   ├── features/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── doctor/
│   │   ├── patient/
│   │   ├── department/
│   │   ├── doctorDepartment/
│   │   └── appointment/
│   ├── middleware/
│   ├── routes/
│   └── app.js
│
├── server.js
├── package.json
├── .env
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/hospital-management-system.git
```

### 2. Move into the Project

```bash
cd hospital-management-system
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Create a `.env` File

```env
PORT=6000

DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=5432

JWT_SECRET=your_jwt_secret
```

### 5. Start the Server

```bash
npm run dev
```

The server will start on:

```text
http://localhost:6000
```

---

## 📌 API Modules

### Authentication

* Register User
* Login User

### User

* Create User
* Get All Users
* Get User By ID
* Update User
* Delete User

### Doctor

* Create Doctor
* Get All Doctors
* Get Doctor By ID
* Update Doctor
* Delete Doctor

### Patient

* Create Patient
* Get All Patients
* Get Patient By ID
* Update Patient
* Delete Patient

### Department

* Create Department
* Get All Departments
* Get Department By ID
* Update Department
* Delete Department

### Doctor Department

* Assign Doctor to Department
* Get Assignments
* Update Assignment
* Delete Assignment

### Appointment

* Create Appointment
* Get All Appointments
* Get Appointment By ID
* Get Appointments By Patient
* Get Appointments By Doctor
* Update Appointment
* Update Appointment Status
* Delete Appointment

---

## 🔐 Authentication

Protected routes require a JWT access token.

Example:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 🗄️ Database

This project uses **PostgreSQL** hosted on **Supabase** and is managed using **Sequelize ORM**.

---

## 🧪 Testing

API endpoints can be tested using:

* Postman
* Thunder Client
* Insomnia

---

## 📷 Screenshots

You can add screenshots here:

* Project Structure
* Postman API Testing
* Database Tables
* Authentication Flow

---

## 📚 Learning Outcomes

Through this project I learned:

* REST API Development
* Express.js Architecture
* Sequelize ORM
* PostgreSQL Database Design
* JWT Authentication
* Environment Variable Management
* MVC Project Structure
* CRUD Operations
* Model Relationships
* API Testing with Postman

---

## 👨‍💻 Author

**Sabin Chaulagain**

* BICTE Student
* MERN Stack Learner
* AI-Assisted Full Stack Developer

---

## 📄 License

This project is developed for educational and portfolio purposes.
