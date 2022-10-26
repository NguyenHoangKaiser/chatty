export const validateEmail = (email: string): string | undefined => {
  var validRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!email.length || !validRegex.test(email)) {
    return "Email address is invalid";
  }
};

export const validatePassword = (password: string): string | undefined => {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
};

export const validateName = (name: string): string | undefined => {
  if (!name.length) {
    return "Name is required";
  }
};
