import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import Button from "./Button"
import { Link } from "react-router-dom";
import styles from "./InvestmentDetails.module.css"
import {dateFromTimeStamp, GameType, StakeStatus, units} from "./utils";

import "bootstrap/dist/css/bootstrap.min.css";

const InvestmentDetails = ({ namedInvestment, onHide, show, timeUntilCanClaimEscrow, claimEscrow }) => {
  if (namedInvestment === null) return null;
  const [player, gameName, investment] = namedInvestment;
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
          <h2>Your investment in <Link style={{color: "var(--safestake-gold)"}} to={`/players/${player.playerAddress}`}>{player.name}</Link></h2>
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
              <div>
                <span className={styles.label}>Filled On</span>
                <span className={styles.value}>{dateFromTimeStamp(investment.stakeTimeStamp.filledTimestamp).toLocaleDateString()}</span>
              </div>
              {investment.status !== StakeStatus.Filled && (
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
                <span className={styles.label}>Stake (Dai)</span>
                <span className={styles.value}>{units(investment.amount)}◈</span>
              </div>
              <div>
                <span className={styles.label}>Escrow (Dai)</span>
                <span className={styles.value}>{units(investment.escrow)}◈</span>
              </div>
              <div>
                <span className={styles.label}>Profit Share</span>
                <span className={styles.value}>{investment.profitShare}%</span>
              </div>
            </div>
          </div>
          {(investment.status === StakeStatus.AwaitingReturnPayment || investment.status === StakeStatus.Completed) && (
            <div className={styles.section}>
              <div className={styles.tripleContainer}>
                <div>
                  <span className={styles.label}>Player Pnl</span>
                  <span className={styles.value}>{units(investment.pnl)}◈</span>
                </div>
                <div>
                  <span className={styles.label}>Your Returns</span>
                  <span className={styles.value}>{units(investment.backerReturns)}◈</span>
                </div>
              </div>
            </div>
          )}
          {investment.status === StakeStatus.AwaitingReturnPayment && timeUntilCanClaimEscrow === null && (
            <div className={styles.section}>
              <span className={styles.normal}>The time threshold for <strong>{player.name}</strong> to return your share of the winnings has been passed,
              and you are now able to claim back the {units(investment.escrow)}◈ of escrow. Note that you may continue to wait
              for the player to pay back the winnings if you wish.</span>
              <Button style={{marginTop: "20px"}} onClick={() => claimEscrow(investment.id)}>Claim Escrow</Button>
            </div>
          )}
          {investment.status === StakeStatus.AwaitingReturnPayment && timeUntilCanClaimEscrow !== null && (
            <div className={styles.section}>
              <span className={styles.label}>Time until escrow can be claimed</span>
              <span className={styles.value}>{timeUntilCanClaimEscrow.days} day{timeUntilCanClaimEscrow.days === 1 ? "" : "s"}, {timeUntilCanClaimEscrow.hours} hour{timeUntilCanClaimEscrow.hours === 1 ? "" : "s"}</span>
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

export default InvestmentDetails;