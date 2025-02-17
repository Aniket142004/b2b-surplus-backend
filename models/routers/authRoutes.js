const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require('express-validator'); // Import for validation

router.post(
    "/register", [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Invalid email format'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, email, password } = req.body;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = new User({ name, email, password: hashedPassword });
            await user.save();
            res.status(201).json({ message: "User registered successfully" });
        } catch (err) {
            console.error(err); // Log the error on the server
            res.status(500).json({ message: "An error occurred during registration" });
        }
    }
);

router.post("/login", async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Short expiration time!
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred during login" });
    }
});

module.exports = router;