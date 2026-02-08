require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const authRoutes = require("./routes/auth");
const gmailRoutes = require("./routes/gmail-routes");
const workflowRoutes = require("./routes/workflows");
const userRoutes = require("./routes/user");

// Initialize database
require("./config/database");

const app = express();
const PORT = process.env.PORT || 3001;

app.set("trust proxy", 1);

// IMPORTANT: Set a session secret if not provided
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  (() => {
    console.warn(
      "  WARNING: No SESSION_SECRET in .env! Using fallback. Generate one with:"
    );
    console.warn(
      "   node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
    return "INSECURE-FALLBACK-SECRET-CHANGE-IN-PRODUCTION";
  })();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration - FIXED for localhost development
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "dorian.sid", // Custom name to avoid conflicts
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    },
  })
);

// Debug middleware - logs session info
app.use((req, res, next) => {
  const isHealthCheck = req.path === "/api/health";
  if (!isHealthCheck) {
    console.log(` [${req.method}] ${req.path}`);
    console.log(` Session ID: ${req.session?.id}`);
    console.log(` Has tokens: ${!!req.session?.googleTokens}`);
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/user", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Dorian API is running" });
});

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../dorian-ui/dist");

  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error(" Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(` Dorian server running on http://localhost:${PORT}`);
  console.log(` Gmail OAuth callback: ${process.env.GMAIL_REDIRECT_URI}`);
  console.log(
    ` Session secret configured: ${
      SESSION_SECRET !== "INSECURE-FALLBACK-SECRET-CHANGE-IN-PRODUCTION"
        ? ""
        : "  USING FALLBACK"
    }`
  );
});
