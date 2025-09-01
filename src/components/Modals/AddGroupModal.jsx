import { useState } from "react";
import styles from "./AddGroupModal.module.css";

export default function AddGroupModal({ onClose, onAdd, loading, error }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(name);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Create New Group</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="groupName">
            Group Name
          </label>
          <input
            id="groupName"
            type="text"
            placeholder="Enter group name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.addBtn}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>

        {error && (
          <p style={{ color: "red", marginTop: "0.75rem", fontSize: "0.9rem" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
