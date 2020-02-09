const express = require("express");

const app = express()

const connectDB = require('./config/db');


//connect DB
connectDB();

//init middleware
app.use(express.json({extended: false}));

app.get("/",(req,res)=>{
res.send("running");
})


//Define Routes
app.use("/api/users",require('./routes/api/users'))
app.use("/api/auth",require('./routes/api/auth'))
app.use("/api/profile",require('./routes/api/profile'))
app.use("/api/post",require('./routes/api/post'))

const PORT =  process.env.PORT || 5678;

app.listen(PORT, ()=> console.log("Running"))