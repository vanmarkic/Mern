const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';


  if(!Validator.isLength(data.name, { min: 2, max: 30})) {errors.name = 'Name must be between 2 and 30 characteres'};

  if(Validator.isEmpty(data.name)) {
      errors.name = "Name is field required";
  }

  if(Validator.isEmpty(data.email)) {
    errors.email = "email is field required";
}

if(!Validator.isEmail(data.email)) {
    errors.email = "email is invalid";
}

if(Validator.isEmpty(data.password)) {
    errors.password = "password is field required";
}

if(!Validator.isLength(data.password, {min:6, max:30})) {
    errors.password = "password must be between 6 and 30 characters long";
}

if(Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm password field is required";
}

if(!Validator.equals(data.password, data.password2)) {
    errors.password2 = "passwords must match";
}

  return {
    errors: errors,
    isValid: isEmpty(errors)
  }
}
