import React from "react";
import { Modal } from "react-bootstrap";
import Button from "./Button"
import {Link} from "react-router-dom";
import { weiToUsd } from "./utils";

import "bootstrap/dist/css/bootstrap.min.css";

const StakingRequestDetails = ({ request, contract, accounts, onHide, show, ethPriceUsd }) => {

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
          Modal heading
        </Modal.Title>
      </Modal.Header>
      {request &&
      <Modal.Body>
        <h4>Invest in a Horse</h4>
        <p>
          You are going to invest ${weiToUsd(request.amount, ethPriceUsd)} in {request.horse} with a potential profit share
          of {request.profitShare}.
        </p>
        <Button
          onClick={() => contract.methods.stakeHorse(request.id).send({
            from: accounts[0],
            value: parseInt(request.amount)
          })}
          style={{
            marginRight: "10px",
          }}
        >
          Invest
        </Button>
        <Button
          style={{
            backgroundColor: "var(--safestake-off-black-lighter)",
            marginLeft: "10px",
            marginRight: "10px",
          }}
        >
          Wishlist
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
