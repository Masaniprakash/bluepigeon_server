const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const db = require('./models/index'); 
const session = require('express-session');
var passport = require("passport");
var authRoutes = require('./routes/user_data')
var userOrgRoutes = require('./routes/user_organization')
var orgRoutes = require('./routes/organization')
var inviteRoutes = require('./routes/invite')
const dotenv = require("dotenv");
var cors = require('cors')

const app = express();

dotenv.config()
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())


app.use(session({
  secret: "SECRET_KEY",
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/organization", orgRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api/user/organization", userOrgRoutes);

app.get("/mass",(req,res)=>{
  try {
    let secrect = process.env.PASSWORD
    res.send(secrect)
  } catch (error) {
    
  }
})

const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log(`server listen on http://localhost:${port}`);
});

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYzdlMGM0ZS05MDFlLTQ3YmMtYTkwMS1mYzMxMDRhODQ1NTciLCJpYXQiOjE3NTY5MDE5ODh9.bxIXCsq83idQlaOB4Ld-Vdycz9olv8cH36h1KRSOCB8
