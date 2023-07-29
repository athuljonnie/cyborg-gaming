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
const multer = require("multer");
const fs = require('fs');
dbConnect();


app.use(
  session({
    secret: process.env.SECRETKEY,
    cookie: { maxAge: 600000000 },
    saveUninitialized: false,
    resave: false,
  })
);

// cache control
app.use((req,res,next)=>{
  res.header('cache-control','private,nocache,no-store')
  res.header('expurse','-1')
  res.header('parama','no-cache')
  next()
}) 



app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "views")));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));
// app.use('/', authRouter);
app.use("/admin", adminRouter);
app.use("/", userRouter);



// Set storage engine for uploaded images

// app.use(upload.array("productImage", 3));


app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});

