import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit : "16kb"}))  // configures middleware in an Express.js application to handle JSON data in HTTP requests
/* 1. express.json()
Purpose: Parses incoming HTTP requests with JSON payloads.
Result: The parsed JSON data becomes accessible in 'req.body' for subsequent route handlers.
Without this, Express wouldn't automatically parse JSON data sent in requests.

2. { limit: "16kb" }
Purpose: Sets a security/performance constraint.
Meaning: The server will only process JSON payloads ≤ 16 kilobytes in size.
Consequences:
Requests with JSON bodies larger than 16KB will be rejected (HTTP 413 Payload Too Large).
Protects against denial-of-service (DoS) attacks via oversized payloads.

3. app.use()
Purpose: Mounts the middleware globally.
Effect: All routes (e.g., POST /api/data) that receive JSON data will use this parser. */

app.use(express.urlencoded({extended: true, limit: "16kb"}))  // configures Express middleware to handle URL-encoded form data. Handles data from HTML forms submitted with Content-Type: application/x-www-form-urlencoded (the default for web forms). Parses the data into a JavaScript object accessible at req.body.

/* extended = true: Allows parsing nested objects/arrays using the qs library. Example: user[name]=John&user[age]=30 → { user: { name: "John", age: "30" } } 
   extended = false: Uses simpler querystring module (no nested support). Avoid unless needed.*/

app.use(express.static("public"))  // configures Express.js to serve static files (like HTML, CSS, images, JavaScript) from a directory named public. Any file in the public folder becomes accessible via HTTP requests.
/*
// Serve files with cache-control headers (1 day cache)
app.use(express.static("public", { maxAge: "1d" }));

// Serve from multiple directories
app.use(express.static("assets")); 
app.use(express.static("uploads"));

// Add a URL prefix
app.use("/static", express.static("public")); 
// Now: public/style.css → http://yoursite.com/static/style.css
*/
/*Security Best Practices
Don't store sensitive files in public (users can access anything in this folder!)
Use subdirectories for organization (e.g., public/css, public/js)

Set caching headers to improve performance:
app.use(express.static("public", { 
  maxAge: 86400000 // 1 day in milliseconds
}));*/

app.use(cookieParser())  // integrates the cookie-parser middleware into an Express.js application
/*
Standard Cookies	      req.cookies	          Unsigned cookies as key-value pairs ({ user: "Alice" })
Signed Cookies	          req.signedCookies	      Verifies cookie integrity using a secret (tampered cookies become undefined)
Set Cookies in Response	  res.cookie()	          Attaches cookies to outgoing responses
*/

// routes import
import userRouter from './routes/user.routes.js'

// routes declaration
app.use("/api/v1/users", userRouter)

// http://localhost:8000/api/v1/users/register

export { app }