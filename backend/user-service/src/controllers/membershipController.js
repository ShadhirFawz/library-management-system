const Membership = require("../models/Membership");

exports.createMembership = async (req, res, next) => {

  try {

    const membership = await Membership.create(req.body);

    res.status(201).json(membership);

  } catch (error) {
    next(error);
  }

};

exports.getMemberships = async (req, res, next) => {

  try {

    const memberships = await Membership.find();

    res.json(memberships);

  } catch (error) {
    next(error);
  }

};