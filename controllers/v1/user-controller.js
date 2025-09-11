const userService = require("../../services/v1/user-service");

exports.getUserById = async (req, res) => { 
  try {
    const { uid } = req.params;
    const userData = await userService.getUserById(uid);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

exports.getUsers = async (req, res) => {
  try {
    const { limit } = req.query;
    const usersData = await userService.getUsers(limit);
    res.status(200).json({
      success: true,
      count: usersData.length,
      data: usersData,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const userData = req.body;
    const newUser = await userService.createUser(userData);
    res.status(201).json({
      success: true,
      data: newUser,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

exports.updateUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const userData = req.body;
    const updatedUser = await userService.updateUser(uid, userData);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    await userService.deleteUser(uid);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};