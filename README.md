# Digital Wallet Application

A full-stack digital wallet application built with React and Node.js that provides secure user authentication, wallet management, and money transfers.

## 🚀 Features

### Authentication

- User registration with phone number and email
- Secure login with JWT token authentication
- Password hashing with bcrypt

### Wallet Management

- View wallet balance in real-time
- Transaction history with detailed records
- Automatic signup bonus (configurable)

### Money Transfer

- Search users by phone number or name
- Secure peer-to-peer money transfers
- Transaction reference IDs for tracking
- Idempotency key support to prevent duplicate transfers

### Security Features

- JWT-based authentication
- Input validation with Zod schemas
- MongoDB transactions for atomic operations
- Optimistic concurrency control
- CORS protection

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **CSS3** - Styling with responsive design

### Backend

- **Node.js** with **Express.js** - Server framework
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Zod** - Schema validation
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
paytm/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Transfer.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── MainApp.jsx
│   │   ├── AuthContext.jsx  # Authentication context
│   │   ├── api.js          # API client configuration
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Application entry point
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── backend/                 # Node.js backend application
    ├── controllers/         # Request handlers
    │   ├── authController.js
    │   └── accountController.js
    ├── models/             # MongoDB schemas
    │   ├── user.js
    │   ├── account.js
    │   └── idempotency.js
    ├── routes/             # API routes
    │   ├── auth.js
    │   └── account.js
    ├── middleware/         # Custom middleware
    │   ├── authmiddleware.js
    │   └── validate.js
    ├── schemas/           # Validation schemas
    │   └── index.js
    ├── config/           # Configuration files
    │   └── db.js
    ├── scripts/          # Utility scripts
    │   └── migrateToPaise.js
    ├── package.json
    └── index.js
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd paytm
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the backend directory:

   ```env
   MONGODB_URI=mongodb://localhost:27017/paytm
   JWT_SECRET=your-super-secret-jwt-key
   SIGNUP_BONUS=1000
   PORT=3000
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   ```

   Create a `.env` file in the frontend directory:

   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```

### Running the Application

1. **Start the Backend Server**

   ```bash
   cd backend
   npm run dev
   ```

   Server will run on `http://localhost:3000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/v1/signup`

Register a new user

```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/api/v1/login`

Login user

```json
{
  "phone": "9876543210",
  "password": "password123"
}
```

#### GET `/api/v1/users`

Search users (requires authentication)

```
GET /api/v1/users?name=John
GET /api/v1/users?phone=9876543210
```

### Account Endpoints

#### GET `/api/v1/balance`

Get wallet balance (requires authentication)

#### GET `/api/v1/transactions`

Get transaction history (requires authentication)

#### POST `/api/v1/transfer`

Transfer money (requires authentication)

```json
{
  "to": "9876543210",
  "amount": 100.5
}
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `SIGNUP_BONUS` - Bonus amount for new users (in rupees)
- `PORT` - Server port (default: 3000)

**Frontend (.env)**

- `VITE_API_URL` - Backend API base URL

## 🌐 Deployment

### Frontend (Vercel)

1. Build the project: `npm run build`
2. Deploy to Vercel or any static hosting service

### Backend (Vercel/Railway/Heroku)

1. The backend is configured for serverless deployment
2. Set environment variables on your hosting platform
3. Deploy using the provided `vercel.json`

## 💰 Money Management

The application handles monetary values carefully:

- Frontend displays amounts in rupees (₹)
- Backend stores amounts in paise (integer) to avoid floating-point precision issues
- Automatic conversion between rupees and paise at API boundaries

## 🔒 Security Features

1. **Password Security**: Passwords are hashed using bcrypt with salt rounds
2. **JWT Authentication**: Secure token-based authentication
3. **Input Validation**: All inputs validated using Zod schemas
4. **Atomic Transactions**: MongoDB transactions ensure data consistency
5. **Idempotency**: Duplicate transfer prevention using idempotency keys
6. **CORS Protection**: Configured for specific origins

## 🧪 Features in Detail

### User Authentication

- Phone-based registration and login
- Email validation (optional)
- JWT token management with automatic refresh
- Persistent login state

### Wallet System

- Real-time balance updates
- Comprehensive transaction history
- Credit/debit transaction categorization
- Reference ID tracking

### Transfer System

- User search by phone/name
- Real-time balance validation
- Atomic money transfers
- Transaction logging
- Duplicate prevention

## 🔄 Database Schema

### User Model

```javascript
{
  phone: String (unique, required),
  email: String (unique, optional),
  name: String (required),
  password: String (hashed),
  timestamps: true
}
```

### Account Model

```javascript
{
  userId: ObjectId (ref: User),
  phone: String (unique),
  walletBalance: Number (in paise),
  transactions: [Transaction],
  timestamps: true
}
```

### Transaction Schema

```javascript
{
  type: "credit" | "debit",
  amount: Number (in paise),
  to: String (phone),
  from: String (phone),
  date: Date,
  referenceId: String
}
```

## 🚀 Future Enhancements

- [ ] Transaction categories and tags
- [ ] Recurring payments
- [ ] QR code generation for payments
- [ ] Transaction limits and controls
- [ ] Multi-currency support
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Bank account integration
- [ ] Bill payment features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


