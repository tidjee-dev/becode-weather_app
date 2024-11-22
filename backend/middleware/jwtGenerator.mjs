import jwt from "jsonwebtoken";

/**
 * Generate JWT for a user.
 * @param {object} payload - The user payload to encode in the JWT
 * @returns {string} - The generated JWT
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};
