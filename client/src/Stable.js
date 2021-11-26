import React, {useEffect, useState} from "react";
import PlayerCard from "./PlayerCard.js";
import { Container } from "react-bootstrap";
import PlayerCardModalForm from "./PlayerCardModalForm.js";
import styles from "./Stable.module.css"
import Button from "./Button";
import {Link} from "react-router-dom";
import {numberWithCommas, StakeStatus, units, dateFromTimeStamp, timeUntilDate, GameType, addDaysToDate} from "./utils"
import HorizontalTile from "./HorizontalTile";
import tileStyles from "./HorizontalTile.module.css";

const Separator = () => <div className={styles.separator} />

const MarketPlaceRedirect = () => (
  <div className={styles.marketPlaceRedirect}>
    <h1>No Investment Activity</h1>
    <p>Visit the marketplace to make your first investments!</p>
    <Link to="/"><Button>Visit Marketplace</Button></Link>
  </div>
)

const Statistics = ({ currentInvestments, pastInvestments }) => {
  const currentlyInvested = units(currentInvestments.reduce((prev, curr) => prev + parseInt(curr.amount), 0))
  const pastInvestmentsAmount = units(pastInvestments.reduce((prev, curr) => prev + parseInt(curr.amount), 0))
  const totalWinnings = units(currentInvestments.reduce((prev, curr) => prev + parseInt(curr.backerReturns), 0))
  const profit = (totalWinnings - pastInvestmentsAmount).toFixed(2)

  return (
    <div className={styles.statsTile}>
      <div className={styles.background} />
      <h2>My Stats</h2>
      <div className={styles.stats}>
        <div>
          <div className={styles.label}>
            Currently Invested
          </div>
          <div className={styles.value}>
            {numberWithCommas(currentlyInvested)} ◈
          </div>
        </div>

        <div>
          <div className={styles.label}>
            Total Past Investments
          </div>
          <div className={styles.value}>
            {numberWithCommas(pastInvestmentsAmount)} ◈
          </div>
        </div>

        <div>
          <div className={styles.label}>
            Total Winnings
          </div>
          <div className={styles.value}>
            {numberWithCommas(totalWinnings)} ◈
          </div>
        </div>

        <div className={profit >= 0 ? styles.green : styles.red}>
          <div className={styles.label}>
            Net PnL
          </div>
          <div className={styles.value}>
            {pastInvestmentsAmount !== 0 ? ((profit * 100) / pastInvestmentsAmount).toFixed(2) : 0}%
          </div>
          <div className={styles.underValue}>
            ({profit} ◈)
          </div>
        </div>
      </div>
    </div>
  )
}

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

const PendingInvestments = ({ pendingInvestments, contract }) => {
  const [investmentsByPlayer, setInvestmentsByPlayer] = React.useState([])

  useEffect(() => {
    groupAndNameInvestments(pendingInvestments, contract)
      .then(groupedAndNamedInvestments => setInvestmentsByPlayer(groupedAndNamedInvestments))
  }, [])

  return (
    <div className={styles.investmentSection}>
      <h1>Pending Investments</h1>
      {investmentsByPlayer.map(playerInvestments => {
        const [player, investments] = playerInvestments
        return (
          <div className={styles.currentInvestment} key={player.name}>
            <span className={styles.investmentPlayerName}>{player.name}</span>
            {investments.map(namedInvestment => {
              const [name, investment] = namedInvestment
              const escrowCanBeClaimedOn = addDaysToDate(dateFromTimeStamp(parseInt(investment.stakeTimeStamp.gamePlayedTimestamp)), 10);
              const timeUntilEscrowCanBeClaimed = escrowCanBeClaimedOn > new Date() ?
                timeUntilDate(escrowCanBeClaimedOn) :
                {days: 0, hours: 0, minutes: 0, seconds: 0}
              return (
                <HorizontalTile key={investment.id}>
                  <div className={tileStyles.left} style={{fontSize: "0.8em"}}>
                    <span className={tileStyles.value}>{name}</span>
                  </div>
                  <div>
                    <span className={tileStyles.label}>Original Stake</span>
                    <span className={tileStyles.value}>{units(investment.amount)}◈</span>
                  </div>
                  <div>
                    <span className={tileStyles.label}>Amount Owed</span>
                    <span className={tileStyles.value}>{units(investment.backerReturns)}◈</span>
                  </div>
                  <div>
                    <span className={tileStyles.label}>Escrow can be claimed in</span>
                    <span className={tileStyles.value}>{`${timeUntilEscrowCanBeClaimed.days}d ${timeUntilEscrowCanBeClaimed.hours}h ${timeUntilEscrowCanBeClaimed.minutes}m`}</span>
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

const CurrentInvestments = ({ currentInvestments, contract }) => {
  const [investmentsByPlayer, setInvestmentsByPlayer] = React.useState([])

  useEffect(() => {
    groupAndNameInvestments(currentInvestments, contract)
      .then(groupedAndNamedInvestments => setInvestmentsByPlayer(groupedAndNamedInvestments))
  }, [])

  return (
    <div className={styles.investmentSection}>
      <h1>Current Investments</h1>
      {investmentsByPlayer.map(playerInvestments => {
        const [player, investments] = playerInvestments
        return (
          <div className={styles.currentInvestment} key={player}>
            <span className={styles.investmentPlayerName}>{player.name}</span>
            {investments.map(namedInvestment => {
              const [name, investment] = namedInvestment
              const scheduledFor = dateFromTimeStamp(parseInt(investment.stakeTimeStamp.scheduledForTimestamp))
              const timeLeft = timeUntilDate(scheduledFor)
              return (
                <HorizontalTile key={investment.id}>
                  <div className={tileStyles.left} style={{fontSize: "0.8em"}}>
                    <span className={tileStyles.value}>{name}</span>
                  </div>
                  <div>
                    <span className={tileStyles.label}>Stake (Dai)</span>
                    <span className={tileStyles.value}>{units(investment.amount)}◈</span>
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

const PastInvestments = ({ pastInvestments }) => {
  return null
}

export default function Stable({ requests, accounts, contract, tokenContract }) {
  const [stakeInFocus, setStakeInFocus] = useState(null);
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
    setStakeInFocus(null);
  }
  const handleShow = (stake) => {
    setStakeInFocus(stake);
    setShow(true);
  }

  if (
    accounts === null ||
    requests === null ||
    contract == null
  )
    return null;

  let investor = accounts[0];
  let investments = requests.filter(
    (request) => request.backer === investor
  );

  const pendingInvestments = investments.filter(investment => investment.status === StakeStatus.AwaitingReturnPayment)
  const currentInvestments = investments.filter(investment => investment.status === StakeStatus.Filled)
  const pastInvestments = investments.filter(investment => investment.status === StakeStatus.Completed || investment.status === StakeStatus.EscrowClaimed)

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.header}>
          <h1>My Stable</h1>
          <p className={styles.pageDescription}>View the status of your current and past investments. If a player is overdue on their repayment, you will also be able to claim the escrow from this page.</p>
        </div>
        <Separator />
        {investments.length === 0 ?
          <MarketPlaceRedirect />
        :
          <>
            <Statistics currentInvestments={currentInvestments} pastInvestments={pastInvestments} />
            {pendingInvestments.length > 0 && <PendingInvestments pendingInvestments={pendingInvestments} contract={contract} />}
            {currentInvestments.length > 0 && <CurrentInvestments currentInvestments={currentInvestments} contract={contract}/>}
            {pastInvestments.length > 0 && <PastInvestments pastInvestments={pastInvestments} />}
          </>
        }
      </Container>
      {/* TODO: give this a better name */}
      <PlayerCardModalForm
        contract={contract}
        accounts={accounts}
        stake={stakeInFocus}
        show={show}
        style={{ position: "absolute", left: "170px" }}
        handleClose={handleClose}
      />
    </div>
  );
}
