import { useState } from "react";
import axios from "axios";
import styles from "./AuthPage.module.css"; 

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AuthPage({ onAuth }) {
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: ""
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (activeTab === "login") {
        const res = await axios.post(`${BACKEND_URL}/user/login`, {
          email: formData.username,
          password: formData.password
        });
        

        if (res.status === 200) {
          onAuth({
            type: "login",
            username: formData.username,
            token: res.data.token,
          });
        }
      } else {
        const res = await axios.post(`${BACKEND_URL}/user/register`, {
          fullName: formData.email,
          email: formData.username,
          password: formData.password,
        });

        if (res.status === 200) {
          onAuth({
            type: "register",
            username: formData.username,
            token: res.data.token,
          });
        }
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setErrorMsg("Wrong email or password.");
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      {/* Loading overlay */}
      {loading && (
        <div className={styles.overlay}>
          <div className={styles.spinner}></div>
        </div>
      )}

      {/* Left side marketing */}
      <div className={styles.leftPane}>
        <h1>Coordinate with your group in real time</h1>
        <p>
          Create groups, share your live location, and see your team on the map with instant updates.
        </p>
      </div>

      {/* Right side form */}
      <div className={styles.rightPane}>
        <div className={styles.tabButtons}>
          <button
            className={activeTab === "login" ? styles.activeTab : ""}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={activeTab === "register" ? styles.activeTab : ""}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errorMsg && <p className={styles.error}>{errorMsg}</p>}

          {activeTab === "register" && (
            <input
              type="text"
              placeholder="Name"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={styles.input}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={styles.input}
            required
          />

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {activeTab === "login" ? "Login" : "Register"}
          </button>
        </form>

        <p className={styles.terms}>
          By continuing you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
