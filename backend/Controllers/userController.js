const { users } = require("../database/connection");
const bcrypt = require("bcrypt");

// Register User
async function createUser(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            });
        }

        // Check existing email
        const existingUser = await users.findOne({
            where: {
                email: email,
            },
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered",
            });
        }

        // Encrypt password
        const encryptedPassword = bcrypt.hashSync(password, 10);

        // Create user
        const newUser = await users.create({
            name: name,
            email: email,
            password: encryptedPassword,
        });

        res.status(201).json({
            message: "Registered successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

module.exports = {
    createUser,
};