"use client";
import React from "react";
import styles from "./loginPage.module.css";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const { data, status } = useSession();

  const router = useRouter();
  if (status === "loading") {
    return <div className={styles.loading}>Loading...</div>;
  }
  if (status === "authenticated") {
    router.push("/");
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.socialButton} onClick={() => signIn("google")}>
          Signin with Google
        </div>
        <div className={styles.socialButton} onClick={() => signIn("github")}>
          Signin with Github
        </div>
        <div className={styles.socialButton}>Signin with Facebook</div>
      </div>
    </div>
  );s
};

export default LoginPage;
