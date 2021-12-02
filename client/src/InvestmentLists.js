import React, {useEffect} from "react";
import styles from "./Stable.module.css";
import {addDaysToDate, dateFromTimeStamp, GameType, numberWithCommas, StakeStatus, timeUntilDate, units} from "./utils";
import HorizontalTile from "./HorizontalTile";
import tileStyles from "./HorizontalTile.module.css";
import {Link} from "react-router-dom";

const groupAndNameInvestments = async (investments, contract) => {
  const investmentsByPlayerRaw = Array.from(investments.reduce(
    (entryMap, investment) => entryMap.set(investment.horse, [...entryMap.get(investment.horse)||[], investment]),
    new Map()
  ).entries());

  return await Promise.all(investmentsByPlayerRaw.map(async playerInvestment => {
    const [player, investments] = playerInvestment
    const playerName = await contract.methods.getPlayer(player).call()
    const investmentsWithNames = await Promise.all(investments.map(async investment => {
      const gameOrTournamentFromApi = (parseInt(investment.gameType) === GameType.SingleGame) ?
        (await fetch(`https://safe-stake-mock-api.herokuapp.com/games/${investment.apiId}`)
          .then(response => response.json())
          .catch(() => ({name: "Couldn't get tournament name"}))) :
        (await fetch(`https://safe-stake-mock-api.herokuapp.com/tournaments/${investment.apiId}`)
          .then(response => response.json())
          .catch(() => ({name: "Couldn't get tournament name"})))
      return [gameOrTournamentFromApi.name, investment];
    }))
    return [playerName, investmentsWithNames]
  }))
}

export const PendingInvestments = ({ investor, showDetails, pendingInvestments, contract }) => {
  const [investmentsByPlayer, setInvestmentsByPlayer] = React.useState([])

  useEffect(() => {
    groupAndNameInvestments(pendingInvestments, contract)
      .then(groupedAndNamedInvestments => setInvestmentsByPlayer(groupedAndNamedInvestments))
  }, [contract, pendingInvestments])

  return (
    <div className={styles.investmentSection}>
      <h1>Pending Investments</h1>
      {investmentsByPlayer.map(playerInvestments => {
        const [player, investments] = playerInvestments
        return (
          <div className={styles.currentInvestment} key={player.name}>
            <Link style={{color: "var(--safestake-gold)"}} to={`/players/${player.playerAddress}`}><span className={styles.investmentPlayerName}>{player.name}</span></Link>
            {investments.map(namedInvestment => {
              const [name, investment] = namedInvestment
              const escrowCanBeClaimedOn = addDaysToDate(dateFromTimeStamp(parseInt(investment.stakeTimeStamp.gamePlayedTimestamp)), 10);
              const timeUntilEscrowCanBeClaimed = escrowCanBeClaimedOn > new Date() ?
                timeUntilDate(escrowCanBeClaimedOn) : null
              const investorIdx = investment.investmentDetails.backers.findIndex(potentialInvestor => potentialInvestor === investor);
              return (
                <HorizontalTile onClick={() => showDetails([player, name, investment], timeUntilEscrowCanBeClaimed)} key={investment.id}>
                  <div className={tileStyles.left} style={{fontSize: "0.8em"}}>
                    <span className={tileStyles.value}>{name}</span>
                    <span className={tileStyles.underValue}>{dateFromTimeStamp(investment.stakeTimeStamp.gamePlayedTimestamp).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className={tileStyles.label}>You Staked</span>
                    <span className={tileStyles.value}>{numberWithCommas(units(investment.investmentDetails.investments[investorIdx]))}◈</span>
                  </div>
                  <div>
                    <span className={tileStyles.label}>Amount Owed</span>
                    <span className={tileStyles.value}>{numberWithCommas(units(investment.investmentDetails.backerReturns[investorIdx]))}◈</span>
                  </div>
                  {timeUntilEscrowCanBeClaimed !== null ? (
                    <div>
                      <span className={tileStyles.label}>Escrow can be claimed in</span>
                      <span className={tileStyles.value}>{`${timeUntilEscrowCanBeClaimed.days}d ${timeUntilEscrowCanBeClaimed.hours}h ${timeUntilEscrowCanBeClaimed.minutes}m`}</span>
                    </div>
                  ) : (
                    <div>
                      <span className={`${tileStyles.label} ${styles.red}`}>Expired!</span>
                      <span className={`${tileStyles.value} ${styles.red}`}>Claim Escrow Now</span>
                    </div>
                  )}
                </HorizontalTile>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export const CurrentInvestments = ({ investor, showDetails, currentInvestments, contract }) => {
  const [investmentsByPlayer, setInvestmentsByPlayer] = React.useState([])

  useEffect(() => {
    groupAndNameInvestments(currentInvestments, contract)
      .then(groupedAndNamedInvestments => setInvestmentsByPlayer(groupedAndNamedInvestments))
  }, [contract, currentInvestments])

  return (
    <div className={styles.investmentSection}>
      <h1>Current Investments</h1>
      {investmentsByPlayer.map(playerInvestments => {
        const [player, investments] = playerInvestments
        return (
          <div className={styles.currentInvestment} key={player}>
            <Link style={{color: "var(--safestake-gold)"}} to={`/players/${player.playerAddress}`}><span className={styles.investmentPlayerName}>{player.name}</span></Link>
            {investments.map(namedInvestment => {
              const [name, investment] = namedInvestment
              const scheduledFor = dateFromTimeStamp(parseInt(investment.stakeTimeStamp.scheduledForTimestamp))
              const timeLeft = timeUntilDate(scheduledFor)
              const investorIdx = investment.investmentDetails.backers.findIndex(potentialInvestor => potentialInvestor === investor);
              return (
                <HorizontalTile onClick={() => showDetails([player, name, investment], null)} key={investment.id}>
                  <div className={tileStyles.left} style={{fontSize: "0.8em"}}>
                    <span className={tileStyles.value}>{name}</span>
                  </div>
                  <div>
                    <span className={tileStyles.label}>Your Stake (Dai)</span>
                    <span className={tileStyles.value}>{numberWithCommas(units(investment.investmentDetails.investments[investorIdx]))}◈</span>
                  </div>
                  <div>
                    <span className={tileStyles.label}>Profit Share (%)</span>
                    <span className={tileStyles.value}>{investment.profitShare}</span>
                  </div>
                  <div>
                    <span className={tileStyles.label}>Time left</span>
                    <span className={tileStyles.value}>{`${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`}</span>
                  </div>
                </HorizontalTile>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export const PastInvestments = ({ investor, showDetails, pastInvestments, contract }) => {
  const [investmentsByPlayer, setInvestmentsByPlayer] = React.useState([])

  useEffect(() => {
    groupAndNameInvestments(pastInvestments, contract)
      .then(groupedAndNamedInvestments => setInvestmentsByPlayer(groupedAndNamedInvestments))
  }, [contract, pastInvestments])

  return (
    <div className={styles.investmentSection}>
      <h1>Past Investments</h1>
      {investmentsByPlayer.map(playerInvestments => {
        const [player, investments] = playerInvestments
        return (
          <div className={styles.currentInvestment} key={player}>
            <Link style={{color: "var(--safestake-gold)"}} to={`/players/${player.playerAddress}`}><span className={styles.investmentPlayerName}>{player.name}</span></Link>
            {investments.map(namedInvestment => {
              const [name, investment] = namedInvestment
              const investorIdx = investment.investmentDetails.backers.findIndex(potentialInvestor => potentialInvestor === investor);
              const investedAmount = investment.investmentDetails.investments[investorIdx];
              const investorProportion = investment.investmentDetails.investments[investorIdx] / investment.investmentDetails.filledAmount
              const returns = investment.status === StakeStatus.Completed ? units(investment.investmentDetails.backerReturns[investorIdx]) : units(investorProportion * investment.escrow)
              return (
                <HorizontalTile onClick={() => showDetails([player, name, investment], null)} key={investment.id}>
                  <div className={tileStyles.left} style={{fontSize: "0.8em"}}>
                    <span className={tileStyles.value}>{name}</span>
                    <span className={tileStyles.underValue}>{dateFromTimeStamp(investment.stakeTimeStamp.gamePlayedTimestamp).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className={tileStyles.label}>Your Stake</span>
                    <span className={tileStyles.value}>{numberWithCommas(units(investedAmount))}◈</span>
                  </div>
                  <div>
                    <span className={tileStyles.label + (investment.status === StakeStatus.EscrowClaimed ? (" " + styles.red) : "")}>{investment.status === StakeStatus.Completed ? "Winnings Returned" : "Escrow Claimed"}</span>
                    <span className={tileStyles.value}>{numberWithCommas(returns)}◈</span>
                  </div>
                  <div>
                    <span className={tileStyles.label}>Pnl</span>
                    <span
                      className={`${tileStyles.value} ${returns >= parseInt(units(investedAmount)) ? styles.green : styles.red}`}
                    >
                      {((100 * (returns - units(investedAmount))) / units(investedAmount)).toFixed(2)}%
                    </span>
                  </div>
                </HorizontalTile>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}