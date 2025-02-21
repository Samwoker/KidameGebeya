// const validator = require("validator");
// const validateSignUpApi = (req) => {
//   const {
//     firstName,
//     lastName,
//     emailId,
//     password,
//     confirmPassword,
//     username,
//     phoneNumber,
//   } = req.body;
//   if (!firstName || !lastName) {
//     throw new Error("Invalid firstName or lastName");
//   }
//   if (!emailId || !validator.isEmail(emailId)) {
//     throw new Error("Invalid email address");
//   }
//   if (!validator.isStrongPassword(password)) {
//     throw new Error("password is weak");
//   }
//   if (password !== confirmPassword) {
//     throw new Error("password does not match");
//   }
//   if (!username) {
//     throw new Error("invalid username");
//   }
//   if (!phoneNumber) {
//     throw new Error("invalid phone number");
//   }
// };

// const validateLoginApi=(req)=>{
//    const {password,emailId}=req.body;
//    if(!password ||!emailId){
//      throw new Error("Invalid credentials");
//    }
//    if(!validator.isEmail(emailId)){
//      throw new Error("Invalid email address");
//    }
// }

// module.exports = { validateSignUpApi ,validateLoginApi };
const {
  check,
  validationRequest,
  validationResult,
} = require("express-validator");

const userSignUpValidationRules = () => {
  return [
    check("firstName", "First name is required").notEmpty(),
    check("lastName", "Last name is required").notEmpty(),
    check("emailId", "Invalid email address").notEmpty().isEmail(),
    check(
      "password",
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
      .notEmpty()
      .isLength({ min: 8 }),

    check("confirmPassword", "Passwords do not match").custom(
      (value, { req }) => value === req.body.password
    ),
    check("username", "Username is required").notEmpty(),
    check("phoneNumber", "Invalid phone number format").matches(
      "/^+251[1-9]{1}[0-9]"
    ),
  ];
};

const userLoginValidationRules = () => {
  return [
    check("emailId", "Invalid email address").notEmpty().isEmail(),
    check("password", "Password is required").notEmpty().isLength({ min: 8 }),
  ];
};

const validateSignUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var messages = [];
    errors.array().forEach((error) => {
      messages.push(error.msg);
    });
    req.flash("error", messages);
    return res.redirect("/signup");
  }
  next();
};

const validateLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var messages = [];
    errors.array().forEach((error) => {
      messages.push(error.msg);
    });
    req.flash("error", messages);
    return res.redirect("/login");
  }
  next();
};

module.exports = {
  userSignUpValidationRules,
  userLoginValidationRules,
  validateSignUp,
  validateLogin,
};
