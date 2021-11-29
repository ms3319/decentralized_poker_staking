import tileStyles from './HorizontalTile.module.css'
import React, {useEffect, useState} from "react";
import { numberWithCommas } from './utils';
import HorizontalTile from "./HorizontalTile";

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
    <HorizontalTile onClick={onClick}>
      <div className={tileStyles.longer}>
        <span className={tileStyles.label}>User</span>
        <span className={tileStyles.value}>{player == null ? "null player" : player.name}</span>
      </div>
      <div>
        <span className={tileStyles.label}>Stake</span>
        <span className={tileStyles.value}>{numberWithCommas(stake)} ◈</span>
      </div>
      <div>
        <span className={tileStyles.label}>Escrow</span>
        <span className={tileStyles.value}>{numberWithCommas(escrow)} ◈</span>
      </div>
      <div>
        <span className={tileStyles.label}>Profit Share</span>
        <span className={tileStyles.value}>{request.profitShare}%</span>
      </div>
    </HorizontalTile>
  )
}