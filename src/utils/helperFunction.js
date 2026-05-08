export function dateSplitByT(dateInput) {
  if (dateInput) {
    return dateInput?.split("T")[0];
  }
}

export const capitalize = (str) =>
  typeof str === "string"
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : str;

export function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "";
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const strTime = hours.toString().padStart(2, '0') + ':' + minutes + ' ' + ampm;

  // return `${day}-${month}-${year} ${strTime}`;//if need time in this format then use this line
  return `${day}-${month}-${year}`;//if need date only
}

export function formatDateOrTime(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "";
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear().toString().slice(-2);
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${day}/${month}/${year} ${time}`;
}

export function handleValidationError({ message, errors }) {
  if (errors != undefined && message === "Validation Error") {
    if (Array.isArray(errors)) {
      return errors[0];
    }
    return errors;
  }
  return message;
}

export function formatToINR(amount) {
  if (isNaN(amount)) return "₹0.00";

  return Number(amount).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const formatNameInput = (value, digits) => {
  const formatted = value.replace(/[^a-zA-Z]/g, "");
  return digits ? formatted.slice(0, digits) : formatted;
};
export const formatNameInputWithSpace = (value, digits) => {
  const formatted = value.replace(/[^a-zA-Z\s]/g, "");
  return digits ? formatted.slice(0, digits) : formatted;
};

export const formatNumberInput = (value, digits) => {
  return value.replace(/[^0-9]/g, "").slice(0, digits);
};

export const formatDecimalNumberInput = (value, digits) => {
  if (!value) return "";

  // Remove invalid chars (keep digits + dot)
  let cleaned = value.replace(/[^0-9.]/g, "");

  // Handle leading dot → "0."
  if (cleaned.startsWith(".")) {
    cleaned = "0" + cleaned;
  }

  // Allow only first dot
  const firstDotIndex = cleaned.indexOf(".");
  if (firstDotIndex !== -1) {
    const beforeDot = cleaned.slice(0, firstDotIndex);
    const afterDot = cleaned.slice(firstDotIndex + 1).replace(/\./g, ""); // remove extra dots

    const integerPart = beforeDot.slice(0, digits);
    const decimalPart = afterDot.slice(0, 2);

    // Preserve dot if user typed it
    return cleaned.endsWith(".")
      ? `${integerPart}.`
      : decimalPart
        ? `${integerPart}.${decimalPart}`
        : integerPart;
  }

  // No dot case
  return cleaned.slice(0, digits);
};

export const validateIndianPhone = (value) => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(value);
};

export const formatPanInput = (value) => {
  return value.replace(/[^A-Z0-9]/g, "").slice(0, 10);
};

export const formatEmailInput = (value) => {
  return value.replace(/[^a-zA-Z0-9@._-]/g, "").slice(0, 100);
};

export const formatAadharInput = (value) => {
  return value.replace(/[^0-9]/g, "").slice(0, 12);
};

export const formatGstInput = (value) => {
  return value.replace(/[^A-Z0-9]/g, "").slice(0, 15);
};

export const formatIfscInput = (value) => {
  return value.replace(/[^A-Z0-9]/g, "").slice(0, 11);
};


export const formatUpiInput = (value) => {
  return value
    .toLowerCase() // UPI is usually lowercase
    .replace(/[^a-z0-9@._-]/g, "") // allow valid chars
    .replace(/@{2,}/g, "@") // prevent multiple @
    .slice(0, 50); // max length safety
};
export const formatAlphaNumeric = (value, digits) => {
  const formatted = value.replace(/[^a-zA-Z0-9\s]/g, "");
  return digits ? formatted.slice(0, digits) : formatted;
};

export const formatUtrInput = (value, paymentMode) => {
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, "");
  const maxLengths = { upi: 12, imps: 16, neft: 22 };
  return cleaned.slice(0, maxLengths[paymentMode?.toLowerCase()] || 22);
};

export const validateUtrLength = (utr, paymentMode) => {
  const minLengths = { upi: 12, imps: 16, neft: 22 };
  return utr?.length >= (minLengths[paymentMode?.toLowerCase()] || 12);
};

export const InputSlice = (value, digits = 50) => {
  return value.slice(0, digits);
};

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const phoneRegex = /^[6-9]\d{9}$/;
export const aadharRegex = /^[0-9]{12}$/;
export const pincodeRegex = /^\d{6}$/;
export const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const gstRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const nameRegex = /^[A-Za-z]{3,}$/;
export const nameWithSpaceRegex = /^[A-Za-z]{3,}(?:\s+[A-Za-z]{3,})*$/;
export const urlRegex = /^https?:\/\/.+/
