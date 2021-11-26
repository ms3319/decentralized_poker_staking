import { useParams, useHistory } from "react-router-dom";
import styles from "./Player.module.css"
import {Table} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import Button from "./Button";
import { StakeStatus, numberWithCommas, units } from "./utils";
import EditPlayerForm from "./EditPlayerForm";
import defaultProfilePic from './images/default-profile-pic.png'

function PlayerInfo({ player, accounts, contract }) { 

  const [showEditPlayerForm, setShowEditPlayerForm] = useState(false)

  const openEditPlayerForm = () => {
    setShowEditPlayerForm(true)
  }

  const closeEditPlayerForm = () => {
    setShowEditPlayerForm(false)
  }

  // a flag to only display the Edit Profile button if the current profile is mine
  const isMyProfile = accounts[0] === player.playerAddress;

  return (
    <div className={styles.playerInfoTile}>
      <div className={styles.imageContainer}>
        <img className={styles.profilePic} alt="Profile" src={player.profilePicPath} 
          onError={event => {
            event.target.src = defaultProfilePic
            event.onerror = null
          }}/>
      </div>
      <div className={styles.details}>
        <div className={styles.playerName}>
          <span>{player.name}</span>
        </div>
        <div>
          <div className={styles.label}>Wallet Address </div><div className={styles.value}>{player.playerAddress}</div>
        </div>
        <div>
          <div className={styles.label}>Sharkscope Link</div><div className={styles.value}><a href={"http://".concat(player.sharkscopeLink)}>{player.sharkscopeLink}</a></div>
        </div>
        <div>
          {isMyProfile &&
            <Button style={{margin: "10px 0px 0px 0px"}} onClick={openEditPlayerForm}>
              Edit Profile
            </Button>
          }
        </div>
        <EditPlayerForm show={showEditPlayerForm} onHide={closeEditPlayerForm} accounts={accounts} contract={contract} player={player}/>
      </div>
    </div>
  )
}

function PlayerStats({ games }) {
  const totalStakes = games.length
  const totalWins = games.filter(game => game.horseWon).length
  const stakesRequestedRaw = games.reduce((prev, curr) => prev + parseInt(curr.amount), 0)
  const stakesRequested = units(stakesRequestedRaw)
  const totalPnlRaw = games.reduce((prev, curr) => prev + parseInt(curr.pnl), 0)
  const totalPnl = units(totalPnlRaw)
  const profitPercent = stakesRequestedRaw > 0 ? +((totalPnlRaw / stakesRequestedRaw) * 100).toFixed(2) : 0;


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
            {numberWithCommas(stakesRequested)} ◈
          </div>
        </div>

        <div>
          <div className={styles.label}>
            Net Pnl
          </div>
          <div className={styles.value}>
            {numberWithCommas(totalPnl)} ◈
          </div>
        </div>

        <div>
          <div className={styles.label}>
            Profit %
          </div>
          <div className={styles.value}>
            {numberWithCommas(profitPercent)}%
          </div>
        </div>
      </div>
    </div>
  )
}


function PastStakes({ returnProfits, stakes, isViewersAccount }) {

  const awaitingRepayment = stakes.filter((stake) => stake.status === StakeStatus.AwaitingReturnPayment)
  const inProgress = stakes.filter((stake) => stake.status === StakeStatus.Requested || stake.status === StakeStatus.Filled)
  const pastStakes = stakes.filter((stake) => stake.status === StakeStatus.Completed || stake.status === StakeStatus.EscrowReturned)

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
              <th>Pnl</th>
              <th>Amount owed</th>
              <th>Pay Back</th>
            </tr>
          </thead>
          <tbody>
            {awaitingRepayment.map((stake, index) => <tr key={stake.id}>
              <td>{index + 1}</td>
              <td>{stake.backer}</td>
              <td>{units(stake.amount)} ◈</td>
              <td>{stake.profitShare}%</td>
              <td>{units(parseInt(stake.pnl))} ◈</td>
              <td>{units(parseInt(stake.backerReturns))} ◈</td>
              <td><Button onClick={() => returnProfits(stake.id, parseInt(stake.backerReturns))}>Pay Back</Button></td>
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
              <td>{units(stake.amount)} ◈</td>
              <td>{stake.profitShare}%</td>
              <td>{Object.keys(StakeStatus)[parseInt(stake.status)]}</td>
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
            <th>Pnl</th>
            <th>Won?</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {isViewersAccount ? pastStakes.map((stake, index) => <tr key={index}>
            <td>{index + 1}</td>
            <td>{stake.backer}</td>
            <td>{units(stake.amount)} ◈</td>
            <td>{stake.profitShare}%</td>
            <td>{units(stake.pnl)} ◈</td>
            <td>{stake.horseWon ? "Yes" : "No"}</td>
            <td>{Object.keys(StakeStatus)[parseInt(stake.status)]}</td>
          </tr>) :
          stakes.map((stake, index) => <tr key={index}>
            <td>{index + 1}</td>
            <td>{stake.backer}</td>
            <td>{units(stake.amount)} ◈</td>
            <td>{stake.profitShare}%</td>
            <td>{units(stake.pnl)} ◈</td>
            <td>{stake.horseWon ? "Yes" : "No"}</td>
            <td>{Object.keys(StakeStatus)[parseInt(stake.status)]}</td>
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
  const history = useHistory();
  
  useEffect(() => {
    if (contract != null) {
      contract.methods.getPlayer(playerAddress).call().then((player) => {setPlayer(player)})
    }
  }, [contract, playerAddress])

  useEffect(() => {
    if (player != null) {
      const updateStakes = async () => {
        let stakes = []
        for (const stakeId of player.stakeIds) {
          stakes.push(await contract.methods.getStake(stakeId).call())
        }
        setStakes(stakes)
      }
      updateStakes().catch()
    }
  }, [player, contract])

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
      {player && <PlayerInfo player={player} accounts={accounts} contract={contract}/>}
      {stakes && <PlayerStats games={stakes} />}
      {stakes && accounts && <PastStakes returnProfits={returnProfits} stakes={stakes} isViewersAccount={accounts[0] === playerAddress} />}
    </div>
  )
}