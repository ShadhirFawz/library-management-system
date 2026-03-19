const userService = require("../services/userService");

exports.getProfile = async (req, res, next) => {

  try {

    const user = await userService.getUserProfile(req.user.id);

    res.json(user);

  } catch (error) {
    next(error);
  }

};

exports.updateProfile = async (req, res, next) => {

  try {

    const user = await userService.updateUserProfile(
      req.user.id,
      req.body
    );

    res.json(user);

  } catch (error) {
    next(error);
  }

};

exports.getAllUsers = async (req, res, next) => {

  try {

    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const users = await User.find()
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(users);

  } catch (error) {
    next(error);
  }

};

exports.getUserById = async (req, res, next) => {

  try {

    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);

  } catch (error) {
    next(error);
  }

};

exports.updateUserRole = async (req, res, next) => {

  try {

    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    res.json(user);

  } catch (error) {
    next(error);
  }

};