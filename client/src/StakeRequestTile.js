import tileStyles from './HorizontalTile.module.css'
import React, {useEffect, useState} from "react";
import {dateFromTimeStamp, numberWithCommas, timeUntilDate, units} from './utils';
import HorizontalTile from "./HorizontalTile";

export default function StakeRequestTile({ contract, request, handleShowRequestDetails }) {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (contract != null) {
      contract.methods.getPlayer(request.horse).call().then((player) => {setPlayer(player)})
    }
  }, [contract, request])

  const scheduledFor = dateFromTimeStamp(parseInt(request.stakeTimeStamp.scheduledForTimestamp))
  const timeLeft = timeUntilDate(scheduledFor)

  return (
    <HorizontalTile onClick={() => handleShowRequestDetails(request, player)}>
      <div>
        <span className={tileStyles.label}>User</span>
        <span className={tileStyles.value}>{player == null ? "null player" : player.name}</span>
      </div>
      <div>
        <span className={tileStyles.label}>Stake Remaining</span>
        <span className={tileStyles.value}>{numberWithCommas(units(request.amount - request.investmentDetails.filledAmount))}◈</span>
        <span className={tileStyles.smallUnderValue}>Filled: {(100 * request.investmentDetails.filledAmount / request.amount).toFixed(2)}%</span>
      </div>
      <div>
        <span className={tileStyles.label}>Escrow</span>
        <span className={tileStyles.value}>{numberWithCommas(units(request.escrow))} ◈</span>
      </div>
      <div>
        <span className={tileStyles.label}>Profit Share</span>
        <span className={tileStyles.value}>{request.profitShare}%</span>
      </div>
      <div>
        <span className={tileStyles.label}>Time left</span>
        <span className={tileStyles.value}>{timeLeft.days}d {timeLeft.hours}h</span>
      </div>
    </HorizontalTile>
  )
}