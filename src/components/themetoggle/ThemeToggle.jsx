"use client"
import {useContext} from 'react'
import styles from './themeToggle.module.css'
import Image from 'next/image'
import { ThemeContext } from '@/context/ThemeContext'

const Themetoggle = () => {
    const {theme,toggle} = useContext(ThemeContext)
  
    return (
    <div 
     className={styles.container} 
     onClick={toggle} 
     style={theme == "dark" ? {backgroundColor: "white"}:{backgroundColor:"#0B73B1"}
     }>
        <Image src="/moon.png"  alt="" width={14} height={14}/>
        
      <div 
        className={styles.ball} 
        style={theme == "dark" ? {left:1 , background: "#0f172a"} : {right:1, background:"white"}}
        ></div>
          <Image src="/sun.png" alt="" width={14} height={14}/>
    </div>
    
    );
};

export default Themetoggle