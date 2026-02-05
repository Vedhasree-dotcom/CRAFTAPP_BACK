const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser"); 
const authRoutes = require("./routes/auth");
// const submissionRoutes = require("./routes/submission");
// const adminRoutes = require("./routes/admin");
// const path = require("path");
const craftRoutes = require("./routes/craft");

require("dotenv").config();


const app = express();

// Allow credentials so httpOnly refresh cookie can be sent
app.use(cors({origin: "http://localhost:5173", credentials:true}));

app.use(cookieParser());

app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));


// Server uploaded images statically 
app.use("/uploads", express.static("uploads"));


app.use("/api/auth", authRoutes);

app.use("/api/crafts", craftRoutes);

// submissions
// app.use("/api/submissions", require("./routes/submission"));

// admin
// app.use("/api/admin", adminRoutes);




app.listen(process.env.PORT, ()=> console.log(`Server 
running on port ${process.env.PORT}`));
