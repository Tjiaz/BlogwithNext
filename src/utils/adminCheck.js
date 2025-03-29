export const isAdminEmail = (email) => {
  if (!email) return false;

  // Get admin emails from environment variable and split into array
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];

  // Check if the provided email is in the admin emails list
  return adminEmails.includes(email);
};

// You can also add more admin-related utility functions here
export const checkAdminPermissions = (session) => {
  if (!session || !session.user) return false;
  return isAdminEmail(session.user.email);
};
