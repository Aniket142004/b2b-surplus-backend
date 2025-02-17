const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const authRoutes = require("./routes/authRoutes");
const surplusRoutes = require("./routes/surplusRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid Token" });
        req.user = user;
        next();
    });
};

app.use("/api/auth", authRoutes);
app.use("/api/surplus", authenticateToken, surplusRoutes);
app.use("/api/transactions", authenticateToken, transactionRoutes);

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));