import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import Button from "./Button"
import {Link} from "react-router-dom";
import { weiToUsd, GameType } from "./utils";

import "bootstrap/dist/css/bootstrap.min.css";

const StakingRequestDetails = ({ request, contract, accounts, onHide, show, ethPriceUsd }) => {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (contract != null && request != null) {
      contract.methods.getPlayer(request.horse).call().then((player) => {setPlayer(player)})
    }
  }, [contract, request])

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
          Staking Request
        </Modal.Title>
      </Modal.Header>
      {request &&
      <Modal.Body>
        <p>
          <Link style={{color: "var(--safestake-gold)"}} to={`players/${request.horse}`}><strong>{player ? player.name : ""}</strong></Link> is requesting <strong>${weiToUsd(request.amount, ethPriceUsd)}</strong> to
          play in a {request.gameType === GameType.SingleGame ? "single game" : "tournament"} with id <strong>{request.apiId}</strong>, for a
          potential profit share of <strong>{request.profitShare}%</strong>
        </p>
        <p>The player is willing to put up an escrow of <strong>${weiToUsd(request.escrow, ethPriceUsd)}</strong>, meaning that if it is found that the player
        made a profit from their {request.gameType === GameType.SingleGame ? "game" : "tournament"}, and they do not return the appropriate share of the winnings,
        you will be transferred ${weiToUsd(request.escrow, ethPriceUsd)} to reduce your losses</p>
        <Button
          onClick={() => contract.methods.stakeHorse(request.id).send({
            from: accounts[0],
            value: parseInt(request.amount)
          }).then(() => onHide())}
          style={{
            marginRight: "10px",
          }}
        >
          Invest
        </Button>
        <Link to={`players/${request.horse}`}>
        {/* <Link to="players/test"> */}
          <Button 
            style={{
              marginLeft: "10px",
              marginRight: "10px"
            }}
          >
            
            Player Profile
          </Button>
        </Link>
      </Modal.Body>
      }
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StakingRequestDetails;
