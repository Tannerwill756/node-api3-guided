const express = require("express"); // importing a CommonJS module
// const morgan = require("morgan");
const helmet = require("helmet");
const hubsRouter = require("./hubs/hubs-router.js");

const server = express();

// Global Middleware
server.use(express.json()); // built in middleware, no need to npm install it
server.use(helmet());
server.use("/api/hubs", gate, role("fellowship"), hubsRouter);

// three amigas
server.use(function (req, res, next) {
  const today = new Date().toISOString();
  console.log(` [${today}] ${req.method} a ${req.url}`);
  next();
});

// server.use(gate);
// check the headers to see if there is a password property
// if their is, check that it is 'mellon'. If it is, call next(); Otherwise return status 401 and { you: "cannot pass!"}. if there is no password return status 400 and {message: 'speak friend and enter'}

server.get("/moria", gate, (req, res) => {
  res.status(200).json({ welcome: "friends" });
});

function errorHandler(error, req, res, next) {
  res.status(500).json({ message: "oops, sorry, we have an error" });
}

// before the request handler runs, have a middleware that makes your name available to display
function addName(req, res, next) {
  req.name = "Tanner";

  next();
}

server.get("/", addName, (req, res) => {
  const nameInsert = req.name || "stranger";

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome ${nameInsert.toUpperCase()} to the Lambda Hubs API</p>
    `);
});

function role(roleName) {
  return function (req, res, next) {
    let role = req.headers.role;

    if (role === roleName) {
      next();
    } else {
      res.status(403).json({ you: "you do not have the right ROLE" });
    }
  };
}

function gate(req, res, next) {
  let password = req.headers.password;

  if (password && typeof password === "string") {
    password = password.toLowerCase();

    if (password === "mellon") {
      next();
    } else {
      res.status(401).json({
        message: "you cannot pass!!",
      });
    }
  } else {
    res.status(400).json({
      error: "speak friend and enter",
    });
  }
}

server.use(errorHandler);

module.exports = server;
