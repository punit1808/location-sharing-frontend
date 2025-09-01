import { useState, useEffect, useRef } from "react";
import { Copy } from "lucide-react";
import MapView from "./MapView";
import AddMemberModal from "./Modals/AddMemberModal";
import axios from "axios";
import styles from "./GroupDetails.module.css";
import "./Modals/AddMemberModal.module.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const WEBSOCKET_URL =import.meta.env.VITE_WEBSOCKET_URL;

export default function GroupDetails({ user, token, group, handleSelect, onBack }) {
  const [members, setMembers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingRemove, setLoadingRemove] = useState(null);
  const stompClientRef = useRef(null);

  // ✅ Fetch initial members
  useEffect(() => {
    if (!group) return;

    const fetchGroupMembers = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/location/${user.username}/${group.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const initialMembers = res.data.map((loc) => ({
          name: loc.email,
          role: "member",
          lat: loc.latitude,
          lng: loc.longitude,
          timestamp: new Date(loc.timestamp).getTime(),
        }));

        setMembers(initialMembers);
      } catch (err) {
        console.error("❌ Failed to fetch group members:", err);
      }
    };

    fetchGroupMembers();
  }, [group, user, token]);

  // ✅ WebSocket live updates
  useEffect(() => {
    if (!group) return;

    const ws = new WebSocket(`${WEBSOCKET_URL}/location?groupId=${group.id}`);

    ws.onopen = () => {
    };

    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);

        const updatedMember = {
          name: update.email,
          role: "member",
          lat: update.latitude,
          lng: update.longitude,
          timestamp: update.timestamp,
        };

        setMembers((prev) => {
          const idx = prev.findIndex((m) => m.name === updatedMember.name);
          if (idx >= 0) {
            const newMembers = [...prev];
            newMembers[idx] = updatedMember;
            return newMembers;
          }
          return [...prev, updatedMember];
        });
      } catch (err) {
        console.error("❌ WS parse error:", err);
      }
    };

    ws.onclose = () => {
    };

    return () => ws.close();
  }, [group]);

  // Copy Group ID
  const handleCopy = () => {
    navigator.clipboard.writeText(group.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Remove member
  const handleRemove = async (index) => {
    const member = members[index];
    if (!member) return;

    setLoadingRemove(index);
    try {
      const res = await axios.delete(`${BACKEND_URL}/group/removeUser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          userId: member.name,
          groupId: group.name,
          removedBy: user.username,
        },
      });

      if (res.status === 200) {
        handleSelect(group);
      } else {
        alert(res.data?.message || "Failed to remove member");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error removing member");
    } finally {
      setLoadingRemove(null);
    }
  };

  // Add member
  const handleAddMember = async (name, role) => {
    setLoadingAdd(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/group/addUser`,
        {
          addedBy: user.username,
          userId: name,
          groupId: group.name,
          role: role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        handleSelect(group);
      } else {
        alert("Failed to add member");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoadingAdd(false);
    }
  };

  return (
    <div className={styles.container}>
      <div onClick={onBack} className={styles.backBox}>
        <button className="backBtn" style={{ border: "none", cursor: "pointer" }}>
          Back
        </button>
      </div>

      <h2>{group.name}</h2>
      <div className={styles.groupIdBox}>
        <span>ID: {group.id}</span>
        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            className={styles.copyBtn}
            onClick={handleCopy}
            title="Copy Group ID"
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            <Copy size={16} />
          </button>
          {copied && (
            <div
              style={{
                position: "absolute",
                bottom: "120%",
                left: "50%",
                transform: "translateX(-50%)",
                background: "black",
                color: "white",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "12px",
                whiteSpace: "nowrap",
              }}
            >
              Copied!
            </div>
          )}
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.mapSection}>
          <MapView members={members} />
        </div>

        <div className={styles.membersSection}>
          <h3>Members</h3>
          <div className={styles.membersBox}>
            {members.length > 0 ? (
              <ul className={styles.memberList}>
                {members.map((m, i) => (
                  <li key={i} className={styles.memberItem}>
                    <span>
                      {m.name} ({m.role}) – 📍 {m.lat}, {m.lng}
                    </span>
                    {m.timestamp && (
                      <small
                        style={{
                          marginLeft: "8px",
                          fontSize: "12px",
                          color: "#666",
                        }}
                      >
                        {new Date(m.timestamp).toLocaleString()}
                      </small>
                    )}
                    <button
                      onClick={() => handleRemove(i)}
                      className={styles.removeBtn}
                      disabled={loadingRemove === i}
                    >
                      {loadingRemove === i ? "Removing..." : "Remove"}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.noMembers}>No Members yet</div>
            )}
          </div>
          <br />
          <button onClick={() => setShowAdd(true)} className={styles.addBtn}>
            Add Member
          </button>
        </div>
      </div>

      {showAdd && (
        <AddMemberModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAddMember}
          loading={loadingAdd}
        />
      )}
    </div>
  );
}
