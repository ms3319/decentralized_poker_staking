import { useParams, useHistory } from "react-router-dom";
import styles from "./Player.module.css"
import * as PropTypes from "prop-types";
import {Table} from "react-bootstrap";

// For example purposed - delete this later!

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

const stakeStatus = [
  "Requested",
  "Filled",
  "Expired",
  "Cancelled",
  "AwaitingReturnPayment",
  "Completed"
]

let stakes = []
for (let i = 0; i < 15; i++) {
  const won = getRndInteger(0,5) === 0; // 50% chance of winning
  stakes.push({
    backer: "0xa98d6af87a6fh9",
    amount: getRndInteger(500, 10000),
    escrow: getRndInteger(0, 20000),
    profitShare: getRndInteger(20, 80),
    profit: won ? getRndInteger(10000, 50000) : 0, // 50% chance of making no profit
    horseWon: won, // 33% of winning
    status: stakeStatus[getRndInteger(0, stakeStatus.length)]
  })
}

const player = {
  profilePic: "https://i.redd.it/v0caqchbtn741.jpg",
  name: "John Smith",
  link: "https://www.sharkscope.com/",
  stakes: stakes
}

const playerMap = new Map([
  ["test", player]
])

// End example code

const numberWithCommas = (x) => {
  return x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

function PlayerInfo({ playerAddress }) {
  const player = playerMap.get(playerAddress)

  return (
    <div className={styles.playerInfoTile}>
      <div className={styles.imageContainer}>
        <img className={styles.profilePic} alt="Profile picture" src={player.profilePic} />
      </div>
      <div className={styles.details}>
        <div className={styles.playerName}>
          <span>{player.name}</span>
        </div>
        <div>
          <div className={styles.label}>Wallet Address </div><div className={styles.value}>{playerAddress}</div>
        </div>
        <div>
          <div className={styles.label}>Sharkscope Link</div><div className={styles.value}>{<a href={player.link}>{player.link}</a>}</div>
        </div>
      </div>
    </div>
  )
}

function PlayerStats({ games }) {
  const totalStakes = games.length
  const totalWins = games.filter(game => game.horseWon).length
  const stakesRequested = games.reduce((prev, curr) => prev + curr.amount, 0)
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

function PastStakes({ stakes }) {
  return (
    <div className={styles.pastStakesTile}>
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
          {stakes.map((stake, index) => <tr key={index}>
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

export default function Player() {
  const { playerAddress } = useParams()
  const history = useHistory()

  if (!playerMap.has(playerAddress)) {
    history.push("/")
    return null
  }
  console.log(playerAddress)
  return (
    <div className={styles.playerPage}>
      <PlayerInfo playerAddress={playerAddress} />
      <PlayerStats games={playerMap.get(playerAddress).stakes} />
      <PastStakes stakes={playerMap.get(playerAddress).stakes} />
    </div>
  )
}