import React from "react";
import styles from "./GroupCard.module.css";

export default function GroupCard({ group, onClick, handleDeleteGroup, loadingRemove, i }) {
  return (
    <div onClick={onClick} className={styles.card}>
      <div className={styles.content}>
        <h3>{group.name}</h3>
        <p>ID: {group.id}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation(); 
          handleDeleteGroup(i,group.id,group.name);
        }}
        className={styles.removeBtn}
        disabled={loadingRemove === i}
      > 
        {loadingRemove === i ? "Removing..." : "Remove"}
      </button>
    </div>
  );
}
