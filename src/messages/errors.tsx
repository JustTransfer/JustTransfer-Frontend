
// Login and Registration Errors
export const errorLoginFailed = "Login failed. Please check your credentials.";
export const errorRegistrationFailed = "Registration failed. Please try again.";
export const errorUsernameEmailTaken = "Username or email already used. Please choose another one.";
export const errorPublicKeyNotFound = "Public key not found for the user.";
export const errorUserNotFound = "User not found. Please check the username and try again.";
export const errorWrongPassword = "Incorrect password. Please try again.";
export const errorChangePassword = "Failed to change password."
export const errorDeleteAccount = "Failed to delete account.";
export const errorRotateKeys = "Failed to generate new keys.";
export const errorMailNotVerified = "Email not verified. Please verify your email before logging in.";
export const errorEmailVerificationFailed = "Email verification failed. The verification link may be invalid or expired.";
export const errorPasswordResetRequestFailed = "Password reset request failed. Please try again.";
export const errorPasswordResetFailed = "Password reset failed. Please try again.";
export const errorMaxUserAccountsReached = "The server has reached the maximum number of user accounts. Please try again later.";

// Cryptography Errors
export const errorMultipleValidKeys = "Multiple valid keys found.";
export const errorNoValidKeys = "No valid keys found.";
export const errorKeyDerivationFailed = "Key derivation failed";
export const errorFailureSignatureVerification = "Signature verification failed";
export const errorFailureMACVerification = "MAC verification failed";
export const errorFailureDecryption = "Decryption failed";

// UI Errors
export const errorFileNotSelected = "No file selected. Please select a file to upload.";
export const errorPasswordMismatch = "Passwords do not match.";
export const errorSamePassword = "New password cannot be the same as the current password.";
export const errorWeakPassword = "Password is too weak. Please choose a stronger password.";
export const errorPageNotFound = "Page not found.";
export const errorInvalidUsernameShort = "Invalid username format."
export const errorInvalidUsername = "Invalid username, use 3-20 characters, letters, numbers and - only.";

// API Errors
export const errorAPIRequestFailed = "API request failed. Please try again later.";

// Anonymous Message Errors
export const errorMaxAnonymousTransfersReached = "The server has reached the maximum number of anonymous messages. Please try again later or register for an account.";

// Premium Account Errors
export const errorInsufficientRessources = "You have reached your resource limits. Upgrade to a premium account for higher limits and additional features.";

// Unknown Error
export const errorUnknown = "Unknown error occurred.";
