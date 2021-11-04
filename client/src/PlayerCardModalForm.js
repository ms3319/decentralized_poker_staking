import React from "react";
import { Component } from "react";
import { Modal } from "react-bootstrap";
import Button from "./Button.js";

export default class PlayerCardModalForm extends Component {

  claimEscrow = async () => {
    await this.props.contract.methods.requestEscrow(this.props.stake.id).send({from: this.props.accounts[0]});
  }

  render() {
    if (!this.props.stake) return null;

    // TODO: Make a file with the different status options in and check this logic for when the 
    // investor can request back their escrow
    const showRequestEscrow = this.props.stake.status === "4" && this.props.stake.escrow > 0;

    return (
      <>
        <Modal
          size="lg"
          show={this.props.show}
          onHide={this.props.handleClose}
          aria-labelledby="example-modal-sizes-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="example-modal-sizes-title-lg">
              {this.props.stake.horse}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Stake ID: {this.props.stake.id}
            <br/>
            You staked {this.props.stake.amount} for a profit share of {this.props.stake.profitShare}%.
            <br/>
            Stake status: {this.props.stake.status}
            <br/>
            {showRequestEscrow && 
            <Button onClick={this.claimEscrow}>
              Claim Escrow  
            </Button>}
          </Modal.Body>
        </Modal>
      </>
    );
  }
}
