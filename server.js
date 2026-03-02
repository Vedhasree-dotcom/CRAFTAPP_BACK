const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser"); 
const authRoutes = require("./routes/auth");
const submissionRoutes = require("./routes/submission");
const paymentRoutes = require("./routes/payment");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const craftRoutes = require("./routes/craft");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

const app = express();

// app.use(cors({origin: "http://localhost:5173", credentials:true}));
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());

app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));


app.use("/uploads", express.static("uploads"));


app.use("/api/auth", authRoutes);

app.use("/api/crafts", craftRoutes);
    
app.use("/api/user", userRoutes);

app.use("/api/submission", submissionRoutes);

app.use("/api/payments", paymentRoutes);


// admin
app.use("/api/admin", adminRoutes);





// app.listen(process.env.PORT, ()=> console.log(`Server 
// running on port ${process.env.PORT}`));
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);