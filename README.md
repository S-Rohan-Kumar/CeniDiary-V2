# CeniDiary

**CeniDiary** is a high-performance, full-stack **MERN** application built for cinema enthusiasts. It combines the extensive **TMDB** database with social features, enabling users to track watch history, curate collections, write reviews, follow friends, and discover their next favorite film.

---

## Live Links

* **Frontend:** [https://ceni-diary-v2.vercel.app](https://ceni-diary-v2.vercel.app)
* **Backend API:** [https://cenidiary-v2.onrender.com](https://cenidiary-v2.onrender.com)

---

## Features

### Discovery & Exploration

* **Unified Multi-Search:** Search movies, TV shows, and platform users using the TMDB API.
* **Trending Dashboards:** Real-time daily and weekly trending lists for movies and TV series.
* **Dynamic Details Pages:** Rich metadata including cast, crew, ratings, trailers, and availability.

### Personal Cinema Journal

* **Custom Collections:** Create and manage personal shelves (Watched, Watchlist, Favorites).
* **Reviews & Ratings:** Write reviews, rate titles, and view aggregated community statistics.
* **User Profiles:** Customizable public profiles highlighting cinema taste and activity.
* **Social Graph:** Follow users to see reviews and collection updates in real time.

---

## Technical Highlights

* **Secure Authentication:** JWT-based authentication using `httpOnly` cookies with `SameSite=None` and `Secure` flags for cross-domain security.
* **Axios Optimization:** Dedicated Axios instances for public TMDB requests and private backend APIs to avoid credential conflicts.
* **Responsive UI:** Modern glass-morphism design built with **Tailwind CSS**, optimized for all screen sizes.
* **High Availability:** External monitoring prevents server cold starts on free-tier hosting.

---

## Tech Stack

| Layer              | Technology                                                    |
| ------------------ | ------------------------------------------------------------- |
| **Frontend**       | React.js, Tailwind CSS, React Router, Context API, Axios      |
| **Backend**        | Node.js, Express.js                                           |
| **Database**       | MongoDB Atlas, Mongoose ODM                                   |
| **Authentication** | JSON Web Tokens (JWT), Cookie-parser                          |
| **Infrastructure** | Vercel (Frontend), Render (Backend), UptimeRobot (Monitoring) |

---

## Local Setup & Installation

### Prerequisites

* Node.js v18 or higher
* MongoDB Atlas cluster
* TMDB API key

### Clone & Install

```bash
git clone https://github.com/your-username/cenidiary.git
cd cenidiary
```

### Backend Configuration

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CORS_ORIGIN=http://localhost:5173
TMDB_KEY=your_tmdb_api_key
```

### Frontend Configuration

```bash
cd ../frontend
npm install
```

Create a `.env` file:

```env
VITE_TMDB_KEY=your_tmdb_api_key
```

### Running the Application

Start the backend server:

```bash
npm run dev
```

Start the frontend application:

```bash
npm run dev
```

---

## Security Considerations

This project required careful handling of **CORS** and **cross-site cookies**:

* Enabled `withCredentials: true` for authenticated internal API requests.
* Used isolated Axios instances to separate public TMDB calls from private backend APIs.
* Configured cookies with `SameSite=None` to support secure cross-domain authentication.

---

## Contact

**S Rohan Kumar**
Second Year B.E. Student at BIT

* GitHub: [https://github.com/your-username](https://github.com/your-username)
* LinkedIn: [https://linkedin.com/in/your-profile](https://linkedin.com/in/your-profile)

---

CeniDiary was built as a hands-on implementation of the MERN stack, modern web security practices, and scalable full-stack application architecture.
