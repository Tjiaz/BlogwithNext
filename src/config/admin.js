export const ADMIN_EMAILS = ["azbytegems@gmail.com", "tunjiazeez24@gmail.com"];

export const isAdminEmail = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
