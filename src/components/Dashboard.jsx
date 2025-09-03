import React, { useState,useEffect } from "react";
import GroupCard from "./GroupCard";
import styles from "./Dashboard.module.css";

export default function Dashboard({ groups, handleFetch, onSelect, handleDeleteGroup, onAdd, loadingRemove }) {
  const [fetchDone,setFetchDone] =useState(false);

  useEffect(()=>{
    if(groups.length===0 && !fetchDone) handleFetch();
    setFetchDone(true);
  },[]);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Your Groups</h2>

      <div className={styles.grid}>
        {groups.map((g, i) => (
          <GroupCard
            key={g.id}
            group={g}
            onClick={() => onSelect(g)}
            handleDeleteGroup={handleDeleteGroup}   // pass index back to parent
            loadingRemove={loadingRemove}      // pass loading state
            i={i}                              // pass index to card
          />
        ))}

        {/* Add New Group button */}
        <div className={styles.addCard} onClick={onAdd}>
          <span className={styles.plus}>＋</span>
          <p>Add Group</p>
        </div>

      </div>
    </div>
  );
}
