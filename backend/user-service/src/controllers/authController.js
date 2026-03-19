const authService = require("../services/authService");

exports.register = async (req, res, next) => {

  try {

    const user = await authService.registerUser(req.body);

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