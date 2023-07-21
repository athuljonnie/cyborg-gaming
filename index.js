const express = require("express");
const app = express();
const path = require("path");
const dbConnect = require("./config/dbConnect");
const dotenv = require("dotenv").config();
const PORT = 4000 || process.env.PORT;
const userRouter = require("./routes/userRoute");
// const authRouter = require("./routes/authRoutes");
// const { notFound, errorHandler } = require("./middlewares/errorHandler");
const session = require("express-session");
const adminRouter = require("../cyborg/routes/adminRoute");
dbConnect();

app.use(
  session({
    secret: process.env.SECRETKEY,
    cookie: { maxAge: 600000000 },
    saveUninitialized: false,
    resave: false,
  })
);

app.use(function (req, res, next) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "views")));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

// app.use('/', authRouter);
app.use("/admin",adminRouter);
app.use("/", userRouter);

// app.use(notFound);
// app.use(errorHandler);

// app.use(function (req, res, next) {
//   next(createError(404));
// });

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
