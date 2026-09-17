const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { users } = require("../database/connection");

/**
 * Get User Information / Profile
 * GET /api/user/profile
 */
async function getUserProfile(req, res) {
    try {
        const userId = req.user?.id || req.params.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User ID not found",
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
            message: "User information fetched successfully",
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
        console.error("Error fetching user profile:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

/**
 * Update User Profile
 * PUT /api/user/profile
 */
async function updateProfile(req, res) {
    try {
        const userId = req.user?.id || req.params.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User ID not found",
            });
        }

        const { fullName, Fullname, name, email, faculty, college } = req.body;
        const nameToUpdate = fullName || Fullname || name;

        const user = await users.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // If updating email, ensure it's not already taken by another user
        if (email && email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
            const existingUser = await users.findOne({
                where: {
                    email: email.toLowerCase().trim(),
                    id: { [Op.ne]: userId },
                },
            });

            if (existingUser) {
                return res.status(400).json({
                    message: "Email is already taken by another account",
                });
            }
            user.email = email.toLowerCase().trim();
        }

        if (nameToUpdate) {
            user.Fullname = nameToUpdate.trim();
        }

        if (faculty) {
            user.faculty = faculty;
        }

        if (college !== undefined) {
            user.college = college ? college.trim() : null;
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user.id,
                fullName: user.Fullname,
                Fullname: user.Fullname,
                email: user.email,
                faculty: user.faculty,
                college: user.college,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

/**
 * Change User Password
 * PUT /api/user/change-password
 */
async function changePassword(req, res) {
    try {
        const userId = req.user?.id || req.params.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User ID not found",
            });
        }

        const { oldPassword, currentPassword, newPassword, confirmPassword } = req.body;
        const currentPass = oldPassword || currentPassword;

        if (!currentPass || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required",
            });
        }

        if (confirmPassword && newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "New password and confirm password do not match",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters long",
            });
        }

        // Find user with password to compare
        const user = await users.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(currentPass, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect current password",
            });
        }

        // Check if new password is same as old password
        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return res.status(400).json({
                message: "New password cannot be the same as the current password",
            });
        }

        // Hash new password and save
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

module.exports = {
    getUserProfile,
    updateProfile,
    changePassword,
};
