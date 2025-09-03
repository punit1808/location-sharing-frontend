import React, { useState ,useEffect } from "react";
import axios from "axios";
import AuthPage from "./components/AuthPage";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import GroupDetails from "./components/GroupDetails";
import AddGroupModal from "./components/Modals/AddGroupModal";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function App() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupDetails, setGroupDetails] = useState(null);
  const [loadingGroupDetails, setLoadingGroupDetails] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [loadingRemove, setLoadingRemove] = useState(null); 
  const [token,setToken] = useState(null);

  const [location, setLocation] = useState({ lat: null, lon: null });

  useEffect(() => {
    if (user && token) {
      handleFetch();
    }
  }, [user, token]); 


  useEffect(() => {
    if(!token) return;

    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setLocation(newLocation);

          // send to backend immediately
          axios.post(`${BACKEND_URL}/location/update`, {
            userId: user.username, 
            lat: newLocation.lat,
            lng: newLocation.lon,
          },{
            headers:{
              Authorization: `Bearer ${token}`
            }
          })
          .catch((err) => console.error("Error sending location data:", err));
        },
        (err) => {
          console.error("Geolocation error:", err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 100000,
          maximumAge: 0,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [token]);

  // Handle login/register success
  const handleAuth = async (data) => {
    const username = data?.username || data?.email || "guest";
    setUser({ username });
    setToken(data.token);
  };

  const handleSelect = async (group) => {
  setSelectedGroup(group.name);
  setLoadingGroupDetails(true);

  try {
    const res = await axios.get(
      `${BACKEND_URL}/location/${user.username}/${group.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const formattedGroup = {
      id: group.id,
      name: group.name,
      members: res.data.map((loc) => ({
        name: loc.email,
        role: "MEMBER",
        lat: loc.latitude,
        lng: loc.longitude,
        timestamp: loc.timestamp,
      })),
    };

    setGroupDetails(formattedGroup);
  } catch (err) {
    console.error("Failed to fetch group details:", err);
    // fallback: show basic group with no members
    setGroupDetails({ ...group, members: [] });
  } finally {
    setLoadingGroupDetails(false);
  }
};

 const handleFetch = async () => {

  // Fetch groups after login
    setLoadingGroups(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/group/${user.username}` ,{ 
        headers: {
          Authorization: `Bearer ${token}`,
        },
       });
      setGroups(res.data || []);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoadingGroups(false);
    }

 }


  const handleAddGroup = async (name) => {
    setCreatingGroup(true);
    setCreateError(null);

    try {
        const res = await axios.post(
          `${BACKEND_URL}/group/create`,
            {
              email: user.username,
              grpName: name,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );


      if (res.status === 200) {
        
        setShowAddGroup(false);
        setLoadingGroups(true);
        try {
          const res = await axios.get(`${BACKEND_URL}/group/${user.username}` ,{ 
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setGroups(res.data || []);
        } catch (err) {
          console.error("Failed to fetch groups:", err);
        } finally {
          setLoadingGroups(false);
        }
      } else {
        setCreateError("Unexpected response from server.");
      }
    } catch (err) {
      setCreateError(
        err.response?.data?.message || "Failed to create group. Try again."
      );
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleDeleteGroup = async (i,id, name) => {
    if (!user) return;
    if (!window.confirm(`${user.username} Are you sure you want to delete ${name} group?`)) return;

    setLoadingRemove(i);

    try {
      const resdel = await axios.delete(`${BACKEND_URL}/group/delete`, {
        data: {
          userId: user.username,
          groupId: name,  
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    if (resdel.status === 200) {
        setLoadingGroups(true);
      try {
        const res = await axios.get(`${BACKEND_URL}/group/${user.username}` ,{ 
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setGroups(res.data || []);
        } catch (err) {
          console.error("Failed to fetch groups:", err);
        } finally {
          setLoadingGroups(false);
        }
        } else {
          alert("Unexpected response while deleting group.");
        }
    } catch (err) {
      console.error("Failed to delete group:", err);
      alert(err.response?.data?.message || "Error deleting group.");
    } finally {
      setLoadingRemove(null);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setGroups([]);
    setToken(null);
    setSelectedGroup(null);
    setGroupDetails(null);
  };

  // If not logged in
  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  // If viewing a group
  if (selectedGroup) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        {loadingGroupDetails ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <h3>Loading group details...</h3>
          </div>
        ) : (
          <GroupDetails
            user = {user}
            token ={token}
            group={groupDetails}
            handleSelect={handleSelect}
            onBack={() => {
              setSelectedGroup(null);
              setGroupDetails(null);
            }}
          />
        )}
      </>
    );
  }

  // Default → Dashboard
  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      {loadingGroups ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h3>Loading your groups...</h3>
        </div>
      ) : (
        <Dashboard
          groups={groups}
          handleFetch={handleFetch}
          onSelect={handleSelect}
          handleDeleteGroup={handleDeleteGroup}
          onAdd={() => setShowAddGroup(true)}
          loadingRemove={loadingRemove} 
        />
      )}

      {showAddGroup && (
        <AddGroupModal
          onClose={() => setShowAddGroup(false)}
          onAdd={handleAddGroup}
          loading={creatingGroup}
          error={createError}
        />
      )}
    </>
  );
}
