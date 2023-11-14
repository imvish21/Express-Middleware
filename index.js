const express = require("express");
const path = require("path");
const app = express();
const router = express.Router();
const logger = require("morgan");
const multer = require("multer");

const upload = multer({ dest: "./public/uploads" });
const port = 5001;
//Built-in Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

//Application-level middleware
const loggerMiddleware = (req, res, next) => {
  console.log(`${new Date()} ---Request [${req.method}] [${req.url}]`);
  next();
};
app.use(loggerMiddleware);
//Third party middleware
// app.use(logger("dev"))
// app.use(logger("combined"))
app.post(
  "/upload",
  upload.single("image"),
  (req, res, next) => {
    console.log(req.file, req.body);
    res.send(req.file);
  },
  (err, req, res, next) => {
    res.status(400).send({ err: err.message });
  }
);

//Router-level middleware
app.use("/api/users", router);

const fakeAuth = (req, res, next) => {
  const authStatus = true;
  if (authStatus) {
    console.log("User authStatus: ", authStatus);
    next();
  } else {
    res.status(401);
    throw new Error("User is not authorized");
  }
};

const getUsers = (req, res) => {
  res.json({ message: "Get all users" });
};
const createUser = (req, res) => {
  console.log("This is req body received from the client: ", req.body);
  res.json({ message: "Create new user" });
};

router.use(fakeAuth);
router.route("/").get(getUsers).post(createUser);

//Error-handling Middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  switch (statusCode) {
    case 401:
      res.json({
        title: "Unauthorized",
        message: err.message,
      });
      break;
    case 404:
      res.json({
        title: "Not found",
        message: err.message,
      });
      break;
    case 401:
      res.json({
        title: "Server Error",
        message: err.message,
      });
      break;
    default:
      break;
  }
};

//if we don't define any route,we want to throw a 404 error
app.all("*", (req, res) => {
  res.status(404);
  throw new Error("Route not defined");
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
