import React, { useState, useRef, useEffect } from "react";
import styles from "./AddMemberModal.module.css";

export default function AddMemberModal({ onClose, onAdd, loading }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Member");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const roles = ["Admin", "Member"];

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), role); // API call handled in parent
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h3 className={styles.heading}>Add Member</h3>

        <input
          type="text"
          placeholder="User email"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          disabled={loading}
        />

        <div className={styles.customSelect} ref={dropdownRef}>
          <div className={styles.selectHeader} onClick={() => setOpen(!open)}>
            {role} <span className={styles.arrow}>{open ? "▲" : "▼"}</span>
          </div>
          {open && (
            <ul className={styles.selectList}>
              {roles.map((r) => (
                <li
                  key={r}
                  className={styles.selectItem}
                  onClick={() => {
                    setRole(r);
                    setOpen(false);
                  }}
                >
                  {r}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={styles.addBtn}
            onClick={handleAdd}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
