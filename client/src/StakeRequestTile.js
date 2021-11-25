import styles from './StakeRequestTile.module.css'
import rightArrow from './images/arrow-right.svg'
import React, {useEffect, useState} from "react";
import { numberWithCommas } from './utils';

export default function StakeRequestTile({ contract, request, onClick }) {
  const [player, setPlayer] = useState(null);
  const [escrow, setEscrow] = useState(NaN);
  const [stake, setStake] = useState(NaN);

  useEffect(() => {
    if (contract != null) {
      contract.methods.getPlayer(request.horse).call().then((player) => {setPlayer(player)})
    }
    // Wait until we get given the price
    if (!escrow) {
      setEscrow((request.escrow / 1e18).toFixed(2));
    }
    if (!stake) {
      setStake((request.amount / 1e18).toFixed(2));
    }
  }, [contract, request, escrow, stake])

  return (
    <div className={styles.stakeRequestTile} onClick={onClick}>
      <div className={styles.user}>
        <span className={styles.label}>User</span>
        <span className={styles.value}>{player == null ? "null player" : player.name}</span>
      </div>
      <div>
        <span className={styles.label}>Stake</span>
        <span className={styles.value}>{numberWithCommas(stake)} ◈</span>
      </div>
      <div>
        <span className={styles.label}>Escrow</span>
        <span className={styles.value}>{numberWithCommas(escrow)} ◈</span>
      </div>
      <div>
        <span className={styles.label}>Profit Share</span>
        <span className={styles.value}>{request.profitShare}%</span>
      </div>
      <img alt="Right arrow" className={styles.details} src={rightArrow} />
    </div>
  )
}