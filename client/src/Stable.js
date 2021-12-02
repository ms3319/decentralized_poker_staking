import React, { useState } from "react";
import { Container } from "react-bootstrap";
import styles from "./Stable.module.css"
import Button from "./Button";
import { Link } from "react-router-dom";
import { numberWithCommas, StakeStatus, units } from "./utils"
import { CurrentInvestments, PastInvestments, PendingInvestments } from "./InvestmentLists";
import StakeDetails from "./StakeDetails";

const Separator = () => <div className={styles.separator} />

const MarketPlaceRedirect = () => (
  <div className={styles.marketPlaceRedirect}>
    <h1>No Investment Activity</h1>
    <p>Visit the marketplace to make your first investments!</p>
    <Link to="/"><Button>Visit Marketplace</Button></Link>
  </div>
)

const Statistics = ({ investor, pendingInvestments, currentInvestments, pastInvestments }) => {
  const currentlyInvested = units(currentInvestments.reduce((prev, curr) => {
    const investorIdx = curr.investmentDetails.backers.findIndex(potentialInvestor => potentialInvestor === investor);
    return prev + parseInt(curr.investmentDetails.investments[investorIdx]);
  }, 0))
  const pastInvestmentsAmount = units(pastInvestments.reduce((prev, curr) => {
    const investorIdx = curr.investmentDetails.backers.findIndex(potentialInvestor => potentialInvestor === investor);
    return prev + parseInt(curr.investmentDetails.investments[investorIdx]);
  }, 0))
  const totalWinnings = units(pastInvestments.reduce((prev, curr) => {
    const investorIdx = curr.investmentDetails.backers.findIndex(potentialInvestor => potentialInvestor === investor);
    const investorProportion = curr.investmentDetails.investments[investorIdx] / curr.investmentDetails.filledAmount;
    return prev + (curr.status === StakeStatus.EscrowClaimed ? investorProportion * parseInt(curr.escrow) : parseInt(curr.investmentDetails.backerReturns[investorIdx]))
  }, 0))
  const pendingWinnngs = units(pendingInvestments.reduce((prev, curr) => {
    const investorIdx = curr.investmentDetails.backers.findIndex(potentialInvestor => potentialInvestor === investor);
    return prev + parseInt(curr.investmentDetails.backerReturns[investorIdx]);
  }, 0))
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
            {numberWithCommas(currentlyInvested)}◈
          </div>
        </div>

        <div>
          <div className={styles.label}>
            Total Past Investments
          </div>
          <div className={styles.value}>
            {numberWithCommas(pastInvestmentsAmount)}◈
          </div>
        </div>

        <div>
          <div className={styles.label}>
            Total Winnings
          </div>
          <div className={styles.value}>
            {numberWithCommas(totalWinnings)}◈
          </div>
          {pendingWinnngs !== 0 && (
            <div className={styles.underValue}>
              ({pendingWinnngs}◈ pending)
            </div>
          )}
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

export default function Stable({ reloadContractState, requests, accounts, contract, tokenContract }) {
  const [investmentInFocus, setInvestmentInFocus] = useState(null);
  const [timeUntilFocusedCanClaimEscrow, setTimeUntilFocusedCanClaimEscrow] = useState(null);
  const [showInvestmentDetails, setShowInvestmentDetails] = useState(false);

  const handleClose = () => {
    setShowInvestmentDetails(false);
    setInvestmentInFocus(null);
  }
  const handleShow = (namedInvestment, canClaimEscrow) => {
    setTimeUntilFocusedCanClaimEscrow(canClaimEscrow)
    setInvestmentInFocus(namedInvestment);
    setShowInvestmentDetails(true);
  }

  const claimEscrow = async (stakeId) => {
    await contract.methods.backerClaimEscrow(stakeId).send({from: accounts[0]});
  }

  if (
    accounts === null ||
    requests === null ||
    contract == null
  )
    return null;

  let investor = accounts[0];
  let investments = requests.filter(
    (request) => request.investmentDetails.backers.includes(investor)
  );

  const pendingInvestments = investments.filter(investment => investment.status === StakeStatus.AwaitingReturnPayment)
  const currentInvestments = investments.filter(investment => investment.status === StakeStatus.Filled || investment.status === StakeStatus.PartiallyFilled)
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
            <Statistics investor={investor} pendingInvestments={pendingInvestments} currentInvestments={currentInvestments} pastInvestments={pastInvestments} />
            {pendingInvestments.length > 0 && <PendingInvestments investor={investor} showDetails={handleShow} pendingInvestments={pendingInvestments} contract={contract} />}
            {currentInvestments.length > 0 && <CurrentInvestments investor={investor} showDetails={handleShow} currentInvestments={currentInvestments} contract={contract}/>}
            {pastInvestments.length > 0 && <PastInvestments investor={investor} showDetails={handleShow} pastInvestments={pastInvestments} contract={contract} />}
          </>
        }
      </Container>
      <StakeDetails namedInvestment={investmentInFocus} onHide={handleClose} show={showInvestmentDetails} timeUntilCanClaimEscrow={timeUntilFocusedCanClaimEscrow} claimEscrow={id => claimEscrow(id).then(reloadContractState())} viewerIsPlayer={false} viewerIsBacker={true} />
    </div>
  );
}
