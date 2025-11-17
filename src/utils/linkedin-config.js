// utils/linkedin-config.js
export const LINKEDIN_CONFIG = {
  clientId: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  redirectUri: `${process.env.NEXT_PUBLIC_DOMAIN}/api/linkedin/callback`,
  scope: [
    "r_organization_social",
    "w_organization_social",
    "r_basicprofile",
    "w_member_social",
  ],
  organizationId: "106269314", // Your azbytegems organization ID
};
