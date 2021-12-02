import { useParams, useHistory } from "react-router-dom";
import styles from "./Player.module.css"
import React, {useEffect, useState} from "react";
import Button from "./Button";
import {StakeStatus, numberWithCommas, units, isNullAddress} from "./utils";
import EditPlayerForm from "./EditPlayerForm";
import defaultProfilePic from './images/default-profile-pic.png'
import {GameList} from "./GameLists";
import StakeDetails from "./StakeDetails";

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

function PlayerStats({ awaitingRepayment, requested, filled, completedGames, escrowClaimed }) {
  const totalStakes = awaitingRepayment.length + requested.length + filled.length + completedGames.length + escrowClaimed.length;
  const currentlyStakedFor = filled.reduce((prev, curr) => prev + parseInt(curr.investmentDetails.filledAmount), 0)
  const totalPnl = completedGames.concat(escrowClaimed).reduce((prev, curr) => prev + parseInt(curr.pnl), 0)
  const totalReturns = completedGames.reduce((prev, curr) => prev + parseInt(curr.backerReturns), 0) + escrowClaimed.reduce((prev, curr) => prev + parseInt(curr.escrow), 0)
  const totalPastStakedFor = completedGames.concat(escrowClaimed).reduce((prev, curr) => prev + parseInt(curr.investmentDetails.filledAmount), 0)
  const avgInvestorProfit = totalPastStakedFor !== 0 ? (100 * (totalReturns - totalPastStakedFor) / totalPastStakedFor).toFixed(2) : 0
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
            Currently Staked for
          </div>
          <div className={styles.value}>
            {numberWithCommas(units(currentlyStakedFor))}◈
          </div>
        </div>

        <div>
          <div className={styles.label}>
            Total Winnings Returned
          </div>
          <div className={styles.value}>
            {numberWithCommas(units(totalReturns))}◈
          </div>
        </div>

        <div>
          <div className={styles.label}>
            Net Pnl
          </div>
          <div className={styles.value}>
            {numberWithCommas(units(totalPnl))}◈
          </div>
        </div>

        <div>
          <div className={styles.label}>
            Average profit for investor
          </div>
          <div className={styles.value}>
            {numberWithCommas(avgInvestorProfit)}%
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Player({ contract, accounts, tokenContract, reloadContractState }) {
  const { playerAddress } = useParams()
  const [player, setPlayer] = useState(null)
  const [stakes, setStakes] = useState(null)
  const [focusedRequest, setFocusedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
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

  const handleClose = () => {
    setShowRequestDetails(false);
    setFocusedRequest(null);
  }
  const handleShow = (namedInvestment) => {
    setFocusedRequest([player, ...namedInvestment]);
    setShowRequestDetails(true);
  }

  if (contract === null || accounts === null) return null

  // Unknown Player
  if (player != null && isNullAddress(player.playerAddress)) {
    history.push("/")
    return null
  }

  const returnProfits = async (id, profits) => {
    // Add 1 cent transaction fee... and to protect from rounding errors :)
    const amountString = "0x" + (profits + 1e16).toString(16);
    await tokenContract.methods.approve(contract.options.address, amountString).send({from: accounts[0]});
    await contract.methods.returnProfits(id).send({ from: accounts[0] });
    reloadContractState();
  }

  const cancelStake = async (id) => {
    await contract.methods.cancelStakeAsHorse(id).send({from: accounts[0] });
    reloadContractState();
  }

  const fillStake = async (id, amount) => {
    const amountString = "0x" + parseInt(amount).toString(16);
    await tokenContract.methods.approve(contract.options.address, amountString).send({from: accounts[0]});
    await contract.methods.stakeHorse(id, amountString).send({ from: accounts[0] })
      .then(() => {reloadContractState()})
  }

  const viewerIsPlayer = accounts[0] === playerAddress

  const awaitingRepayment = stakes ? stakes.filter((stake) => stake.status === StakeStatus.AwaitingReturnPayment) : []
  const requested = stakes ? stakes.filter((stake) => stake.status === StakeStatus.Requested || stake.status === StakeStatus.PartiallyFilled) : []
  const filled = stakes ? stakes.filter((stake) => stake.status === StakeStatus.Filled) : []
  const completedGames = stakes ? stakes.filter((stake) => stake.status === StakeStatus.Completed) : []
  const escrowClaimed = stakes ? stakes.filter((stake) => stake.status === StakeStatus.EscrowClaimed) : []

  return (<>
    <div className={styles.playerPage}>
      {player && !player.canCreateStake && viewerIsPlayer && escrowClaimed.length > 0 &&
        <div className={styles.lockedOut}>An investor has claimed escrow on a stake where you made money and did not
          send back the investor's share of the winnings in time. You have been locked out until further notice.</div>
      }
      {player && !player.canCreateStake && viewerIsPlayer && awaitingRepayment.length > 0 &&
        <div className={styles.lockedOut}>You have completed games where you made money and have not paid back the investor's
          share of the winnings. You will not be able to create new staking requests until you do so.</div>
      }
      {player && <PlayerInfo player={player} accounts={accounts} contract={contract}/>}
      {stakes && <PlayerStats awaitingRepayment={awaitingRepayment} requested={requested} filled={filled} completedGames={completedGames} escrowClaimed={escrowClaimed} />}
      {/*{stakes && accounts && <PastStakes cancelStake={cancelStake} returnProfits={returnProfits} stakes={stakes} viewerIsPlayer={accounts[0] === playerAddress} />}*/}
      {awaitingRepayment.length > 0 && <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Awaiting Repayment</h2>
        <GameList showDetails={handleShow} activeRequests={awaitingRepayment} contract={contract} options={["amount", "winnings", "returns"]} />
      </div>}
      {(requested.length > 0 || filled.length > 0) && <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Active Requests</h2>
        {requested.length > 0 && <div>
          <h3 className={styles.sectionSubtitle}>Open Requests (can be invested in)</h3>
          {!viewerIsPlayer && <h6>You can select multiple stakes to invest in.</h6>} 
          <GameList showDetails={handleShow} activeRequests={requested} contract={contract} options={["amount", "escrow", "profitShare"]} canInvest={true && !viewerIsPlayer} playerName={player.name} tokenContract={tokenContract} backerAccount={accounts[0]} reloadContractState={reloadContractState}/>
        </div>}
        <br/>
        {filled.length > 0 && <div>
          <h3 className={styles.sectionSubtitle}>Filled Requests (can no longer be invested in)</h3>
          <GameList showDetails={handleShow} activeRequests={filled} contract={contract} options={["amount", "escrow", "profitShare"]} canInvest={false} tokenContract={tokenContract}/>
        </div>}
      </div>}
      {completedGames.length > 0 && <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Past Requests</h2>
        <GameList showDetails={handleShow} activeRequests={completedGames.concat(escrowClaimed)} contract={contract} options={["amount", "winnings", "returns"]} tokenContract={tokenContract}/>
      </div>}
    </div>
    {accounts && <StakeDetails namedInvestment={focusedRequest} onHide={handleClose} show={showRequestDetails} cancelStake={cancelStake} returnProfits={returnProfits} fillStake={fillStake} viewerIsPlayer={viewerIsPlayer} viewerIsBacker={focusedRequest && focusedRequest[2].investmentDetails.backers.includes(accounts[0])} />}
  </>)
}