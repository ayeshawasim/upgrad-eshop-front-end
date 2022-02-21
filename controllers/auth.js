const bcrypt = require("bcrypt");
const { User, validateUser } = require("./../models/user");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const { AUTH_TOKEN, ADMIN } = require("../constants");
const config = require("config");

async function signIn(req, res) {
  const { email, password } = req.body;

  let user = await User.findOne({ email });

  if (!user) {
    return res.status(401).send({message:"This email has not been registered!"});
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.status(400).send({message:"Invalid Credentials!"});
  }

  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin || false,
    },
    config.get("jwt-token"),{ expiresIn: "3h" }
  );
//console.log(token);
  user.token = token;

  User.findOneAndUpdate({email}, user, {
    useFindAndModify: false,
  })
    .then(updateUser => {
      if (updateUser === null) throw new Error("Unable to update user");
    
      res.header(AUTH_TOKEN, token);
      res.status(200).send({
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        isAuthenticated: user.isAdmin || false,
      });
    })
    .catch(err => {
      res.status(500).send({message:err.message});
    }); 
}

async function signUp(req, res) {
  const { error } = validateUser(req.body);
  if (error) {
    return res.status(400).send({message:`Bad Request ${error}`});
  }

  let user = await User.findOne({ email: req.body.email });

  if (user) {
    return res
      .status(400)
      .send("Try any other email, this email is already registered!");
  }

  let userPhone = await User.findOne({ contactNumber: req.body.contactNumber });

  if (userPhone) {
    return res.status(400).send({message:"Number already exists"});
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const user = new User({
      ...req.body,
      password: await bcrypt.hash(req.body.password, salt),
    });
    const response = await user.save();
    res.send(_.pick(response, [
    "_id","password","firstName","lastName",
    "email","contactNumber",
    "role","createdAt","updatedAt"]));
  } catch (error) {
    res.status(400).send(error.message);
  }
}

module.exports = {
  signUp,
  signIn,
};
