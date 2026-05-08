export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return "Name must be at least 2 characters long.";
  }
  return null;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }
  return null;
};

export const validatePhone = (phone) => {
  // Basic phone validation (digits, maybe + at start, length)
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!phone || !phoneRegex.test(phone)) {
    return "Please enter a valid phone number.";
  }
  return null;
};

export const validateMessage = (message) => {
  if (!message || message.trim().length < 10) {
    return "Message must be at least 10 characters long.";
  }
  return null;
};
