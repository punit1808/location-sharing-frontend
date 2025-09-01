import React, { useState } from "react";
import styles from "./AddGroupModal.module.css";

export default function AddGroupModal({ onClose, onAdd }) {
  const [name, setName] = useState("");

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h3>Add New Group</h3>
        <input
          type="text"
          placeholder="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>Cancel</button>
          <button
            className={styles.add}
            onClick={() => {
              if (name.trim()) {
                onAdd(name.trim());
                setName("");
              }
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
