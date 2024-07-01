"use client"
import React,{useState} from "react";
import styles from "./navbar.module.css";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "../themetoggle/ThemeToggle";
import AuthLinks from "../authLinks/AuthLinks";
import { IoMdArrowDropdown } from "react-icons/io";
import { BsTwitterX } from "react-icons/bs";
import { BsLinkedin } from "react-icons/bs";
import { BsFacebook } from "react-icons/bs";



const Navbar = () => {
  const[showMenu,setShowMenu]=useState(false)
  return (
    <div className={styles.container}>
      <div className={styles.social}>
       
       
      <Link href="/" className={styles.social_icons}><BsFacebook/></Link>
        
        <Link href="/" className={styles.social_icons}><BsLinkedin/></Link>
        <Link href="/" className={styles.social_icons}><BsTwitterX /></Link>
        <button href="/" className={styles.join_newsletter_button}>join newsletter</button>
        
      </div>
      <div className={styles.logo}><Image src="/AZBYTEGEMS.png" alt="logo" width={108} height={48}/></div>
      <div className={styles.links}>
        <ThemeToggle />
        <Link href="/" className={styles.link}>Blog<span className={styles.arrow}><IoMdArrowDropdown/></span></Link>
        <div className={styles.dropdown} onMouseEnter={() => setShowMenu(true)} onMouseLeave={() => setShowMenu(false)}>
        <Link href="/" className={styles.link} >Topics<span className={styles.arrow}><IoMdArrowDropdown/></span></Link>
        {showMenu && (
          <div className={styles.dropdownMenu}>
            <div className={styles.dropdownColumn}>
              <Link href="/" className={styles.dropdownItem}>AI</Link>
              <Link href="/" className={styles.dropdownItem}>Career Advice</Link>
              <Link href="/" className={styles.dropdownItem}>Computer Vision</Link>
              <Link href="/" className={styles.dropdownItem}>Data Engineering</Link>
              <Link href="/" className={styles.dropdownItem}>Data Science</Link>
              <Link href="/" className={styles.dropdownItem}>Language Models</Link>
            </div>
            <div className={styles.dropdownColumn}>
              <Link href="/" className={styles.dropdownItem}>Machine Learning</Link>
              <Link href="/" className={styles.dropdownItem}>MLOps</Link>
              <Link href="/" className={styles.dropdownItem}>NLP</Link>
              <Link href="/" className={styles.dropdownItem}>Programming</Link>
              <Link href="/" className={styles.dropdownItem}>Python</Link>
              <Link href="/" className={styles.dropdownItem}>SQL</Link>
            </div>
          </div>
        )}
        </div>
        <Link href="/" className={styles.link}>Datasets</Link>
        <Link href="/" className={styles.link}>Resources<span className={styles.arrow}><IoMdArrowDropdown/></span></Link>
        <AuthLinks />
      </div>
    </div>
  );
};

export default Navbar;
