const User = require("../../models/User");
const { admin } = require("../../config/firebase-admin");
const Stats = require("../../models/Stats");

exports.getUserById = async (uid) => {
  try {
    const user = await User.findOne({ uid });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

exports.getUsers = async (limit = 10) => {
  try {
    const limitNumber = parseInt(limit) || 10;
    const users = await User.find().limit(limitNumber).sort({ createdAt: -1 });
    return users;
  } catch (error) {
    throw error;
  }
};

exports.createUser = async (userData) => {
  try {
    const firebaseUser = await admin.auth().createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.fullName,
    });
    userData.uid = firebaseUser.uid; // Firebase UID'yi kullanıcı verisine ekle
    const newUser = new User(userData);
    await newUser.save();

    // Increment user count in stats
    await Stats.incrementCount("users");

    return newUser;
  } catch (error) {
    throw error;
  }
};

exports.updateUser = async (uid, userData) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { $set: userData },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

exports.deleteUser = async (uid) => {
  try {
    // Firebase'den kullanıcıyı sil
    await admin.auth().deleteUser(uid);

    // Veritabanından kullanıcıyı sil
    await User.deleteOne({ uid });
  } catch (error) {
    throw error;
  }
};
