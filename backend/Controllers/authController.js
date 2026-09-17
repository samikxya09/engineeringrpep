const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { users } = require("../database/connection");

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_here";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Register a new user
 * POST /api/auth/register or /register
 */
async function register(req, res) {
    try {
        const { fullName, Fullname, name, email, password, faculty, college } = req.body;
        const nameToSave = fullName || Fullname || name;

        // 1. Validate required fields
        if (!nameToSave || !nameToSave.trim()) {
            return res.status(400).json({
                message: "Full name is required",
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                message: "Email address is required",
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                message: "Please enter a valid email address",
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 2. Check if user already exists
        const existingUser = await users.findOne({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            return res.status(400).json({
                message: "An account with this email already exists",
            });
        }

        // 3. Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Create user in database
        const newUser = await users.create({
            Fullname: nameToSave.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            faculty: faculty || "General Engineering",
            college: college ? college.trim() : null,
        });

        // 5. Generate JWT token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, faculty: newUser.faculty },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(201).json({
            message: "Registration successful",
            token,
            user: {
                id: newUser.id,
                fullName: newUser.Fullname,
                Fullname: newUser.Fullname,
                email: newUser.email,
                faculty: newUser.faculty,
                college: newUser.college,
                createdAt: newUser.createdAt,
            },
        });
    } catch (error) {
        console.error("Error in register controller:", error);
        return res.status(500).json({
            message: "Internal server error during registration",
            error: error.message,
        });
    }
}

/**
 * Login an existing user
 * POST /api/auth/login or /login
 */
async function login(req, res) {
    try {
        const { email, password } = req.body;

        // 1. Validate required fields
        if (!email || !email.trim()) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        if (!password) {
            return res.status(400).json({
                message: "Password is required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 2. Find user in database
        const user = await users.findOne({
            where: { email: normalizedEmail },
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // 3. Compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // 4. Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, faculty: user.faculty },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                fullName: user.Fullname,
                Fullname: user.Fullname,
                email: user.email,
                faculty: user.faculty,
                college: user.college,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Error in login controller:", error);
        return res.status(500).json({
            message: "Internal server error during login",
            error: error.message,
        });
    }
}

/**
 * Get current authenticated user profile
 * GET /api/auth/me or /me
 */
async function getProfile(req, res) {
    try {
        const userId = req.user ? req.user.id : null;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User not authenticated",
            });
        }

        const user = await users.findByPk(userId, {
            attributes: ["id", "Fullname", "email", "faculty", "college", "createdAt", "updatedAt"],
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "Profile retrieved successfully",
            user: {
                id: user.id,
                fullName: user.Fullname,
                Fullname: user.Fullname,
                email: user.email,
                faculty: user.faculty,
                college: user.college,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Error in getProfile controller:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

module.exports = {
    register,
    login,
    getProfile,
};
