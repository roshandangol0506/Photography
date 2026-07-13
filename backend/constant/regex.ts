export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{12,}$/;
export const phoneNumberRegex = /^\+?\d{6,13}$/;
export const emailAddressRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const otpRegex = /^\d{6}$/;
export const urlRegex =
  /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
export const phoneNumberCSVRegex = /^\+[\d\s\-()]{6,20}$/;
