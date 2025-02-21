const validator = require("validator");
const validateSignUpApi = (req) => {
  const {
    firstName,
    lastName,
    emailId,
    password,
    confirmPassword,
    username,
    phoneNumber,
  } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Invalid firstName or lastName");
  }
  if (!emailId || !validator.isEmail(emailId)) {
    throw new Error("Invalid email address");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("password is weak");
  }
  if (password !== confirmPassword) {
    throw new Error("password does not match");
  }
  if (!username) {
    throw new Error("invalid username");
  }
  if (!phoneNumber) {
    throw new Error("invalid phone number");
  }
};

const validateLoginApi=(req)=>{
   const {password,emailId}=req.body;
   if(!password ||!emailId){
     throw new Error("Invalid credentials");
   }
   if(!validator.isEmail(emailId)){
     throw new Error("Invalid email address");
   }
}

module.exports = { validateSignUpApi ,validateLoginApi };
