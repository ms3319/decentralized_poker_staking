import { useParams, useHistory } from "react-router-dom";
import styles from "./Player.module.css"
import {Table} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import Button from "./Button";

const numberWithCommas = (x) => {
  return x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

function PlayerInfo({ player }) { 

  return (
    <div className={styles.playerInfoTile}>
      <div className={styles.imageContainer}>
        <img className={styles.profilePic} alt="Profile picture" src={player.profilePicPath} />
      </div>
      <div className={styles.details}>
        <div className={styles.playerName}>
          <span>{player.name}</span>
        </div>
        <div>
          <div className={styles.label}>Wallet Address </div><div className={styles.value}>{player.playerAddress}</div>
        </div>
        <div>
          <div className={styles.label}>Sharkscope Link</div><div className={styles.value}>{<a href={player.sharkscopeLink}>{player.sharkscopeLink}</a>}</div>
        </div>
      </div>
    </div>
  )
}

function PlayerStats({ games }) {
  const totalStakes = games.length
  const totalWins = games.filter(game => game.horseWon).length
  const stakesRequested = games.reduce((prev, curr) => prev + parseInt(curr.amount), 0)
  const profitReturned = games.reduce((prev, curr) => prev + (curr.profit * (curr.profitShare / 100)), 0)
  const profitPercent = (profitReturned / stakesRequested) * 100

  return (
    <div className={styles.statsTile}>
      <h2 className={styles.sectionTitle}>Statistics</h2>
      <div className={styles.stats}>
        <div>
          <div className={styles.label}>
            Total Staking Requests
          </div>
          <div className={styles.value}>
            {totalStakes}
          </div>
        </div>

        <div>
          <div className={styles.label}>
            Total Wins
          </div>
          <div className={styles.value}>
            {totalWins}
          </div>
        </div>

        <div>
          <div className={styles.label}>
            Total Stakes Requested
          </div>
          <div className={styles.value}>
            {numberWithCommas(+stakesRequested.toFixed(2))}
          </div>
        </div>

        <div>
          <div className={styles.label}>
            Total Profit
          </div>
          <div className={styles.value}>
            {numberWithCommas(+profitReturned.toFixed(2))}
          </div>
        </div>

        <div>
          <div className={styles.label}>
            Profit %
          </div>
          <div className={styles.value}>
            {+profitPercent.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  )
}

const StakeStatus = {
  Requested: "0",
  Filled: "1",
  Expired: "2",
  Cancelled: "3",
  AwaitingReturnPayment: "4",
  Completed: "5",
  EscrowReturned: "6"
};

function PastStakes({ returnProfits, stakes, isViewersAccount }) {

  const awaitingRepayment = stakes.filter((stake) => stake.status === StakeStatus.AwaitingReturnPayment)
  const inProgress = stakes.filter((stake) => stake.status === StakeStatus.Requested || stake.status === StakeStatus.Filled)
  const pastStakes = stakes.filter((stake) => stake.status === StakeStatus.Completed || stake.status === StakeStatus.EscrowReturned)

  console.log(awaitingRepayment)
  console.log(inProgress)
  console.log(pastStakes)

  return (
    <div className={styles.pastStakesTile}>
      { isViewersAccount && awaitingRepayment.length > 0 && (<>
        <h2 className={styles.sectionTitle}>Awaiting Repayment</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Investor Address</th>
              <th>Amount Requested</th>
              <th>Profit Share</th>
              <th>Profit</th>
              <th>Amount owed</th>
              <th>Pay Back</th>
            </tr>
          </thead>
          <tbody>
            {awaitingRepayment.map((stake, index) => <tr key={stake.id}>
              <td>{index + 1}</td>
              <td>{stake.backer}</td>
              <td>{stake.amount}</td>
              <td>{stake.profitShare}</td>
              <td>{stake.profit}</td>
              <td>{stake.amount + stake.profit * (stake.profitShare / 100)}</td>
              <td><Button onClick={() => returnProfits(stake.id, stake.amount + stake.profit * (stake.profitShare / 100))}>Pay Back</Button></td>
            </tr>)}
          </tbody>
        </Table>
        </>
      )}
      { isViewersAccount && inProgress.length > 0 && (<>
          <h2 className={styles.sectionTitle}>Active Staking Requests</h2>
          <Table striped bordered hover>
            <thead>
            <tr>
              <th>#</th>
              <th>Investor Address</th>
              <th>Amount Requested</th>
              <th>Profit Share</th>
              <th>Status</th>
            </tr>
            </thead>
            <tbody>
            {inProgress.map((stake, index) => <tr key={stake.id}>
              <td>{index + 1}</td>
              <td>{stake.backer}</td>
              <td>{stake.amount}</td>
              <td>{stake.profitShare}</td>
              <td>{stake.status}</td>
            </tr>)}
            </tbody>
          </Table>
        </>
      )}
      <h2 className={styles.sectionTitle}>Past Stakes</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Investor Address</th>
            <th>Amount Requested</th>
            <th>Profit Share</th>
            <th>Profit</th>
            <th>Won?</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {isViewersAccount ? pastStakes.map((stake, index) => <tr key={index}>
            <td>{index + 1}</td>
            <td>{stake.backer}</td>
            <td>{stake.amount}</td>
            <td>{stake.profitShare}</td>
            <td>{stake.profit}</td>
            <td>{stake.horseWon ? "Yes" : "No"}</td>
            <td>{stake.status}</td>
          </tr>) :
          stakes.map((stake, index) => <tr key={index}>
            <td>{index + 1}</td>
            <td>{stake.backer}</td>
            <td>{stake.amount}</td>
            <td>{stake.profitShare}</td>
            <td>{stake.profit}</td>
            <td>{stake.horseWon ? "Yes" : "No"}</td>
            <td>{stake.status}</td>
          </tr>)}
        </tbody>
      </Table>
    </div>
  );
}

export default function Player({ contract, accounts }) {
  const { playerAddress } = useParams()
  const [player, setPlayer] = useState(null)
  const [stakes, setStakes] = useState(null)
  const history = useHistory()

  useEffect(() => {
    if (contract != null) {
      contract.methods.getPlayer(playerAddress).call().then((player) => {setPlayer(player)})
    }
  }, [contract])

  useEffect(() => {
    if (player != null) {
      const updateStakes = async () => {
        let stakes = []
        for (const stakeId in player.stakeIds) {
          stakes.push(await contract.methods.getStake(stakeId).call())
        }
        setStakes(stakes)
      }
      updateStakes().catch()
    }
  }, [player])

  if (contract == null) return null

  const returnProfits = async (id, profits) => {
    await contract.methods.returnProfits(id).send({ from: accounts[0], value: profits + 10 });
  }

  // Unknown Player
  if (player != null && player.playerAddress === "0x0000000000000000000000000000000000000000") {
    history.push("/")
    return null
  }

  return (
    <div className={styles.playerPage}>
      {player && <PlayerInfo player={player}/>}
      {stakes && <PlayerStats games={stakes} />}
      {stakes && accounts && <PastStakes returnProfits={returnProfits} stakes={stakes} isViewersAccount={accounts[0] === playerAddress} />}
    </div>
  )
}