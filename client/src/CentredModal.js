import React from "react";
import { Modal, Button } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";

const CentredModal = (props) => {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Modal heading
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Invest in a Horse</h4>
        <p>
            You are going to invest in {props.request.horse} for {props.request.amount} gwei with a potential profit share of {props.request.profitShare}.
        </p>
        <Button
          onClick={() => props.contract.methods.stakeHorse(0).send({from: props.accounts[0]})} 
          style={{
            backgroundColor: "#008b02",
            borderColor: "black",
            color: "black",
            marginRight: "10px",
          }}
        >
          Invest
        </Button>
        <Button
          style={{
            backgroundColor: "#fccb00",
            borderColor: "black",
            color: "black",
            marginLeft: "10px",
            marginRight: "10px",
          }}
        >
          Wishlist
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CentredModal;
