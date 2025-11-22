export function encrypt(text) {
  // Basic encryption (for demonstration - use a more secure method in production)
  const buffer = Buffer.from(text);
  return buffer.toString("base64");
}

export function decrypt(encryptedText) {
  // Basic decryption (for demonstration - use a more secure method in production)
  const buffer = Buffer.from(encryptedText, "base64");
  return buffer.toString("ascii");
}
