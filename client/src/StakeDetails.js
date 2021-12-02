import React, {useState} from "react";
import { Modal } from "react-bootstrap";
import Button from "./Button"
import { Link } from "react-router-dom";
import styles from "./InvestmentDetails.module.css"
import {dateFromTimeStamp, GameType, numberWithCommas, StakeStatus, units} from "./utils";

import "bootstrap/dist/css/bootstrap.min.css";

const StakeDetails = ({ namedInvestment, onHide, show, timeUntilCanClaimEscrow, claimEscrow, fillStake, cancelStake, returnProfits, viewerIsPlayer, viewerIsBacker }) => {
  const [stakeAmount, setStakeAmount] = useState(0);
  const [sanitaryAmount, setSanitaryAmount] = useState(true);

  const handleAmountChanged = (event) => {
    setSanitaryAmount(true)
    setStakeAmount(event.target.value);
  }

  if (namedInvestment === null) return null;
  const [player, gameName, investment] = namedInvestment;

  const validInvestmentAmount = amount => {
    return amount > 0 && amount <= units(investment.amount - investment.investmentDetails.filledAmount);
  }

  const checkAndFillStake = (id, amount) => {
    const daiAmount = amount * 1e18
    if (validInvestmentAmount(amount)) {
      fillStake(id, daiAmount).then(() => onHide())
    } else {
      setSanitaryAmount(false);
    }
  }

  if (player === null || investment === null) return null;
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <h2><Link style={{color: "var(--safestake-gold)"}} to={`/players/${player.playerAddress}`}>{player.name}</Link>'s staking request</h2>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.detailsBody}>
          <div className={styles.header}>
            <span className={styles.label}>{Object.keys(GameType)[parseInt(investment.gameType)]}</span>
            <h1>{gameName}</h1>
            <span className={styles.grey}>{investment.apiId}</span>
            <span className={styles.gold}>{dateFromTimeStamp(investment.stakeTimeStamp.scheduledForTimestamp).toLocaleDateString()}</span>
          </div>
          {investment.investmentDetails.backers.length > 0 && <div className={styles.section}>
            <span className={styles.label}>Investors</span>
            {investment.investmentDetails.backers.map((backer, i) => <span key={backer}>{backer}: {numberWithCommas(units(investment.investmentDetails.investments[i]))}◈</span>)}
          </div>}
          <div className={styles.section}>
            <span className={styles.label}>Status</span>
            <span className={styles.value}>{Object.keys(StakeStatus)[parseInt(investment.status)]}</span>
          </div>
          <div className={styles.section}>
            <div className={styles.tripleContainer}>
              <div>
                <span className={styles.label}>Request Created</span>
                <span className={styles.value}>{dateFromTimeStamp(investment.stakeTimeStamp.createdTimestamp).toLocaleDateString()}</span>
              </div>
              {parseInt(investment.stakeTimeStamp.lastFilledTimestamp) !== 0 &&
                <div>
                  <span className={styles.label}>Last Filled On</span>
                  <span className={styles.value}>{dateFromTimeStamp(investment.stakeTimeStamp.lastFilledTimestamp).toLocaleDateString()}</span>
                </div>
              }
              {parseInt(investment.stakeTimeStamp.gamePlayedTimestamp) !== 0 && (
                <div>
                  <span className={styles.label}>Game Played On</span>
                  <span className={styles.value}>{dateFromTimeStamp(investment.stakeTimeStamp.gamePlayedTimestamp).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.tripleContainer}>
              <div>
                <span className={styles.label}>Stake Requested (Dai)</span>
                <span className={styles.value}>{numberWithCommas(units(investment.amount))}◈</span>
              </div>
              <div>
                <span className={styles.label}>Currently Filled for</span>
                <span className={styles.value}>{numberWithCommas(units(investment.investmentDetails.filledAmount))}◈</span>
                <span>({(100 * investment.investmentDetails.filledAmount / investment.amount).toFixed(2)}%)</span>
              </div>
              <div>
                <span className={styles.label}>Play Threshold</span>
                <span className={styles.value}>{numberWithCommas(units(investment.investmentDetails.playThreshold))}◈</span>
              </div>
              <div>
                <span className={styles.label}>Escrow (Dai)</span>
                <span className={styles.value}>{numberWithCommas(units(investment.escrow))}◈</span>
              </div>
              <div>
                <span className={styles.label}>Profit Share</span>
                <span className={styles.value}>{investment.profitShare}%</span>
              </div>
            </div>
          </div>
          {(investment.status === StakeStatus.AwaitingReturnPayment || investment.status === StakeStatus.Completed || investment.status === StakeStatus.EscrowClaimed) && (
            <div className={styles.section}>
              <div className={styles.tripleContainer}>
                <div>
                  <span className={styles.label}>Player Pnl</span>
                  <span className={styles.value}>{units(investment.pnl)}◈</span>
                </div>
                <div>
                  <span className={styles.label}>Investor Returns</span>
                  <span className={styles.value}>{numberWithCommas(units(investment.backerReturns))}◈</span>
                </div>
              </div>
            </div>
          )}
          {((investment.status === StakeStatus.Requested || investment.status === StakeStatus.PartiallyFilled) && !viewerIsPlayer) && (
            <div className={styles.section}>
              <span className={styles.normal}>An investment into {player.name} would yield a potential return
                of proportion invested * ({units(investment.amount)} + ({investment.profitShare / 100} * (player's net profit))) dai.
                If {player.name} does not return your share of the winnings, you will be sent your proportion of the
                escrow, {units(investment.escrow)}◈, to help cover your losses.</span>
              <div style={{marginTop: "10px"}}>
                <span className={styles.label}>Investment Amount (Dai)</span>
                <input type="number" style={{margin: "5px 0"}} value={stakeAmount} onChange={handleAmountChanged} />
                {stakeAmount !== 0 && (
                  <span style={{fontSize: "1.5em", color: validInvestmentAmount(stakeAmount) ? "black" : "red"}}>
                    {(100 * stakeAmount / units(investment.amount)).toFixed(2)}%
                  </span>
                )}
              </div>
              <Button style={{marginTop: "20px"}} onClick={() => checkAndFillStake(investment.id, stakeAmount)}>Invest</Button>
              {!sanitaryAmount && <span style={{color: "red", marginTop: "20px"}}>Invalid investment amount</span>}
            </div>
          )}
          {(investment.status === StakeStatus.Requested && viewerIsPlayer) && (
            <div className={styles.section}>
              <Button style={{marginTop: "20px"}} onClick={() => cancelStake(investment.id).then(() => onHide())}>Cancel Stake</Button>
            </div>
          )}
          {investment.status === StakeStatus.AwaitingReturnPayment && timeUntilCanClaimEscrow !== undefined && timeUntilCanClaimEscrow === null && claimEscrow !== null && viewerIsBacker && (
            <div className={styles.section}>
              <span className={styles.normal}>The time threshold for <strong>{player.name}</strong> to return your share of the winnings has been passed,
              and you are now able to claim back the {units(investment.escrow)} ◈ of escrow. Note that you may continue to wait
              for the player to pay back the winnings if you wish.</span>
              <Button style={{marginTop: "20px"}} onClick={() => claimEscrow(investment.id)}>Claim Escrow</Button>
            </div>
          )}
          {investment.status === StakeStatus.AwaitingReturnPayment && timeUntilCanClaimEscrow !== undefined && timeUntilCanClaimEscrow !== null && viewerIsBacker && (
            <div className={styles.section}>
              <span className={styles.label}>Time until escrow can be claimed</span>
              <span className={styles.value}>{timeUntilCanClaimEscrow.days} day{timeUntilCanClaimEscrow.days === 1 ? "" : "s"}, {timeUntilCanClaimEscrow.hours} hour{timeUntilCanClaimEscrow.hours === 1 ? "" : "s"}</span>
            </div>
          )}
          {investment.status === StakeStatus.AwaitingReturnPayment && viewerIsPlayer && (
            <div className={styles.section}>
              <span className={styles.normal}>The game has completed, and you made a profit of {units(investment.pnl)}◈,
              meaning you must now return {units(investment.backerReturns)}◈ to your backers.</span>
              {investment.investmentDetails.backers.map((backer, i) => <span key={backer}>{backer}: {numberWithCommas(units(investment.investmentDetails.backerReturns[i]))}◈</span>)}
              <Button style={{marginTop: "20px"}} onClick={() => returnProfits(investment.id, parseInt(investment.backerReturns))}>Return Winnings</Button>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StakeDetails;