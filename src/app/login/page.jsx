"use client";
import React, { useState } from "react";
import styles from "./loginPage.module.css";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const { data, status } = useSession();
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false); // Default to login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (status === "loading") {
    return <div className={styles.loading}></div>;
  }
  if (status === "authenticated") {
    router.push("/");
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Handle email login
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    console.log("Sign in response:", result);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Handle email signup
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        setSuccess("Signup successful!");
        await signIn("credentials", { email, password });
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Signup failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Signup error:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.socialButton} onClick={() => signIn("google")}>
          Sign in with Google
        </div>
        <div className={styles.socialButton} onClick={() => signIn("github")}>
          Sign in with GitHub
        </div>
        <div className={styles.socialButton} onClick={() => signIn("facebook")}>
          Sign in with Facebook
        </div>
        <div className={styles.toggle} onClick={() => setIsSignup(!isSignup)}>
          {isSignup
            ? "Already have an account? Log in"
            : "Don't have an account? Sign up"}
        </div>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        <form
          onSubmit={isSignup ? handleEmailSignup : handleEmailLogin}
          className={styles.form}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
          <button type="submit" className={styles.submitButton}>
            {isSignup ? "Sign up" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
