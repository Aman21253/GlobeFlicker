//multer is used for file
//cloudinary is used for store file
//env for credentials and cloudConfig for access env file

if(process.env.NODE_ENV != "production"){
require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError.js");
const session= require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStratergy=require("passport-local");
const User=require("./models/user.js");

const listingRouter= require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl= process.env.ATLAS_DB;
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

const store=MongoStore.create({
  mongoUrl: dbUrl,
  crypto:{
    secret:"my secret"
  },
  touchAfter:24*3600,
});

store.on("error",()=>{
  console.log("Error",err);
})

const sessionOptions={
  store,
  secret:"mysupersecretcode",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  }
};

// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));

//(Doc from npm(passport-local-mongoose))
passport.serializeUser(User.serializeUser()); //User se related jitni bhi chize h unko store krna 
passport.deserializeUser(User.deserializeUser()); //Unstore krna

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
})

// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "amanab@gmail.com",
//     username: "Amanab",
//   });

//   let registeredUser = await User.register(fakeUser, "Aman");
//   res.send(registeredUser);
// });


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


//About
app.get("/about",(req,res)=>{
  res.render('listings/about.ejs');
});

app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page not found"));
})

app.use((err,req,res,next)=>{
  let { statusCode=500,message="Something went wrong" } = err;
  res.status(statusCode).render("error.ejs",{message});
  //res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});