// utils/token-storage.js
import { encrypt, decrypt } from "./encryption"; // Implement encryption

export async function storeAccessToken(token, expiresIn) {
  try {
    // Encrypt token before storing
    const encryptedToken = encrypt(token);

    // Store in your database
    await prisma.linkedinAuth.upsert({
      where: { organizationId: LINKEDIN_CONFIG.organizationId },
      update: {
        accessToken: encryptedToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      },
      create: {
        organizationId: LINKEDIN_CONFIG.organizationId,
        accessToken: encryptedToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    });
  } catch (error) {
    console.error("Error storing token:", error);
    throw error;
  }
}

export async function getAccessToken() {
  try {
    const auth = await prisma.linkedinAuth.findUnique({
      where: { organizationId: LINKEDIN_CONFIG.organizationId },
    });

    if (!auth || new Date(auth.expiresAt) < new Date()) {
      return null;
    }

    return decrypt(auth.accessToken);
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
}
