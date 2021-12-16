export default function validateInfo(values) {
  let errors = {};

  if (!values.firstname.trim()) {
    errors.firstname = "First name is required";
  }

  if (!values.lastname.trim()) {
    errors.lastname = "Last name is required";
  }

  if (!values.captcha.trim()) {
    errors.captcha = "Are you a robot?";
  }

  if (!values.terms) {
    errors.terms = "Please Check The Terms and Condition";
  }

  if (!values.address.trim()) {
    errors.address = "Address is required";
  }

  if (!values.paymentMethod.trim()) {
    errors.paymentMethod = "Please select payment method";
  }

  if (values.shippingMethod === 'shipping_by_zone') {
    if (!("barangay" in (values.barangay ? values.barangay : {} ))) {
      errors.barangay = "Please select barangay";
    }
  }
  // else if (!/^[A-Za-z]+/.test(values.name.trim())) {
  //   errors.name = 'Enter a valid name';
  // }

  if (!/^\+?([0-9]{11,12})$/.test(values.phone)) {
    errors.phone = "Phone number is invalid";
  }

  if (!/\S+@\S+\.\S+/.test(values.email) || values.email == "") {
    errors.email = "Email address is invalid";
  }
  // if (!values.password) {
  //   errors.password = 'Password is required';
  // } else if (values.password.length < 6) {
  //   errors.password = 'Password needs to be 6 characters or more';
  // }

  // if (!values.password2) {
  //   errors.password2 = 'Password is required';
  // } else if (values.password2 !== values.password) {
  //   errors.password2 = 'Passwords do not match';
  // }
  return errors;
}
