import React from "react";
import styles from "./Navbar.module.css";

export default function Navbar({ user, onLogout }) {
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.brand}>FindMe</h1>

      <div className={styles.userSection}>
        <span className={styles.username}>{user?.username}</span>
        <button className={styles.logoutBtn} onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
