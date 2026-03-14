const authService = require("../services/authService");
const sendEvent = require("../kafka/producer");
const topics = require("../kafka/topics");

exports.register = async (req, res, next) => {

  try {

    const user = await authService.registerUser(req.body);

    await sendEvent(topics.USER_CREATED, {
      userId: user._id,
      email: user.email
    });

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error) {
    next(error);
  }

};

exports.login = async (req, res, next) => {

  try {

    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    res.json(result);

  } catch (error) {
    next(error);
  }

};