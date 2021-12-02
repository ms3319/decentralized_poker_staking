import rightArrow from "./images/arrow-right.svg";
import React from "react";
import styles from "./HorizontalTile.module.css"

export default function HorizontalTile({ children, onClick, canInvest }) {
  return (
    <div className={styles.tile} onClick={onClick}>
      {children}
      {!canInvest && <img alt="Right arrow" className={styles.details} src={rightArrow} />} 
    </div>
    )
}