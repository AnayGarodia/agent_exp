require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const gmailRoutes = require("./routes/gmail-routes");
const workflowRoutes = require("./routes/workflows");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200 // For legacy browser support
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true in prod, false in dev
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allow cross-site requests in development
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/workflows", workflowRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Dorian API is running" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Dorian server running on http://localhost:${PORT}`);
  console.log(`📧 Gmail OAuth callback: ${process.env.GMAIL_REDIRECT_URI}`);
});
