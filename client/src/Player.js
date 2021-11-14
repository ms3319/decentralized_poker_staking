import { useParams, useHistory } from "react-router-dom";
import styles from "./Player.module.css"
import {Table} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import Button from "./Button";
import { CoinGeckoClient, weiToUsd, StakeStatus, numberWithCommas } from "./utils";
import EditPlayerForm from "./EditPlayerForm";

const ethereumUnits = (amountInWei) => {
  if (amountInWei < 1e7) {
    return { units: "wei", amount: amountInWei};
  } else if (1e7 <= amountInWei && amountInWei < 1e16) {
    return { units: "Gwei", amount: +(amountInWei / 1e9).toFixed(2)};
  } else {
    return { units: "Eth", amount: +(amountInWei / 1e18).toFixed(2)};
  }
}

function PlayerInfo({ player, accounts, contract }) { 

  const [showEditPlayerForm, setShowEditPlayerForm] = useState(false)

  const openEditPlayerForm = () => {
    setShowEditPlayerForm(true)
  }

  const closeEditPlayerForm = () => {
    setShowEditPlayerForm(false)
  }

  return (
    <div className={styles.playerInfoTile}>
      <div className={styles.imageContainer}>
        <img className={styles.profilePic} alt="Profile" src={player.profilePicPath} />
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
          <Button style={{margin: "10px 0px 0px 0px"}} onClick={openEditPlayerForm}>
            Edit Profile
          </Button>
        </div>
        <EditPlayerForm show={showEditPlayerForm} onHide={closeEditPlayerForm} accounts={accounts} contract={contract} player={player}/>
      </div>
    </div>
  )
}

function PlayerStats({ ethPriceUsd, games }) {
  const totalStakes = games.length
  const totalWins = games.filter(game => game.horseWon).length
  const stakesRequestedRaw = games.reduce((prev, curr) => prev + parseInt(curr.amount), 0)
  const stakesRequested = ethereumUnits(stakesRequestedRaw)
  const stakesRequestedUsd = weiToUsd(stakesRequestedRaw, ethPriceUsd)
  const profitReturnedRaw = games.reduce((prev, curr) => prev + (curr.profit * (curr.profitShare / 100)), 0)
  const profitReturned = ethereumUnits(profitReturnedRaw)
  const profitReturnedUsd = weiToUsd(profitReturnedRaw, ethPriceUsd)
  const profitPercent = stakesRequestedRaw > 0 ? +((profitReturnedRaw / stakesRequestedRaw) * 100).toFixed(2) : 0;


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
            {numberWithCommas(stakesRequested.amount) + " " + stakesRequested.units + " ($" + stakesRequestedUsd + ")"}
          </div>
        </div>

        <div>
          <div className={styles.label}>
            Total Profit
          </div>
          <div className={styles.value}>
            {numberWithCommas(profitReturned.amount) + " " + profitReturned.units + " ($" + profitReturnedUsd + ")"}
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


function PastStakes({ ethPriceUsd, returnProfits, stakes, isViewersAccount }) {

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
              <th>Profit</th>
              <th>Amount owed</th>
              <th>Pay Back</th>
            </tr>
          </thead>
          <tbody>
            {awaitingRepayment.map((stake, index) => <tr key={stake.id}>
              <td>{index + 1}</td>
              <td>{stake.backer}</td>
              <td>${weiToUsd(stake.amount, ethPriceUsd)}</td>
              <td>{stake.profitShare}</td>
              <td>${weiToUsd(stake.profit, ethPriceUsd)}</td>
              <td>${weiToUsd(parseInt(stake.amount) + ((parseInt(stake.profit) * parseInt(stake.profitShare)) / 100), ethPriceUsd)}</td>
              <td><Button onClick={() => returnProfits(stake.id, parseInt(stake.amount) + ((parseInt(stake.profit) * parseInt(stake.profitShare)) / 100))}>Pay Back</Button></td>
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
              <td>${weiToUsd(stake.amount, ethPriceUsd)}</td>
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
            <td>${weiToUsd(stake.amount, ethPriceUsd)}</td>
            <td>{stake.profitShare}</td>
            <td>${weiToUsd(stake.profit, ethPriceUsd)}</td>
            <td>{stake.horseWon ? "Yes" : "No"}</td>
            <td>{stake.status}</td>
          </tr>) :
          stakes.map((stake, index) => <tr key={index}>
            <td>{index + 1}</td>
            <td>{stake.backer}</td>
            <td>${weiToUsd(stake.amount, ethPriceUsd)}</td>
            <td>{stake.profitShare}</td>
            <td>${weiToUsd(stake.profit, ethPriceUsd)}</td>
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
  const [ethPriceUsd, setEthPriceUsd] = useState(0);
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
        for (const stakeId in player.stakeIds) {
          stakes.push(await contract.methods.getStake(stakeId).call())
        }
        setStakes(stakes)
      }
      updateStakes().catch()
    }
    CoinGeckoClient.simple.price({ids: ['ethereum'], vs_currencies: ['usd']}).then(resp => setEthPriceUsd(resp.data.ethereum.usd));
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
      {stakes && <PlayerStats ethPriceUsd={ethPriceUsd} games={stakes} />}
      {stakes && accounts && <PastStakes ethPriceUsd={ethPriceUsd} returnProfits={returnProfits} stakes={stakes} isViewersAccount={accounts[0] === playerAddress} />}
    </div>
  )
}