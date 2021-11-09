import React, { Component } from "react";
import { Modal, Form } from "react-bootstrap";
import Button from "./Button"

import "bootstrap/dist/css/bootstrap.min.css";

class NewStakingRequestForm extends Component {
  state = { amount: 0, profitShare: 0, escrow: 0, gameType: 0, apiId: "" };

  createStakingRequest = async () => {
    const { accounts, contract } = this.props;
    // TODO: sanity check the values
    if (this.state.escrow > 0) {
      await contract.methods.createRequest(this.state.amount, this.state.profitShare, this.state.escrow, this.state.gameType, this.state.apiId).send({ from: accounts[0], value: this.state.escrow });
    } else {
      await contract.methods.createRequest(this.state.amount, this.state.profitShare, this.state.escrow, this.state.gameType, this.state.apiId).send({ from: accounts[0] });
    }
  };

  handleAmountChange(event) {
    this.setState({amount: event.target.value});
  }

  handleProfitShareChange(event) {
    this.setState({profitShare: event.target.value});
  }

  handleEscrowChange(event) {
    this.setState({escrow: event.target.value});
  }

  handleApiIdChange(event) {
    this.setState({apiId: event.target.value});
  }

  render() {
    const gameTypes = [
      { name: "Single Game", value: 0 },
      { name: "Tournament", value: 1 }
    ]

    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Create New Staking Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Amount I'm looking for (in wei)</Form.Label>
              <Form.Control value={this.state.amount} onChange={(event) => this.handleAmountChange(event)} inputMode="numeric" placeholder="e.g. 100" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Profit Sharing Percentage (%) </Form.Label>
              <Form.Control value={this.state.profitShare} onChange={(event) => this.handleProfitShareChange(event)} inputMode="numeric" placeholder="e.g. 50" />
              <Form.Text className="text-muted">
                Exp: If the amount I'm looking for is £50, and profit sharing
                percentage is 50%, then I'll have to contribute £50 myself to
                make up £100. After the game, I'll return £50 + 50% of my
                winnings back to the investor.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Escrow Amount</Form.Label>
              <Form.Control value={this.state.escrow} onChange={(event) => this.handleEscrowChange(event)} inputMode="numeric" placeholder="e.g. 50" />
              <Form.Text className="text-muted">
                If you would like to provide some collateral to increase the trust involved in this transaction please specify the amount here.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Game Type</Form.Label>
              { gameTypes.map((gameType) => <Form.Check type="radio" key={gameType.name} label={gameType.name} checked={this.state.gameType === gameType.value} onChange={() => this.setState({ gameType: gameType.value })} />) }
              <Form.Text className="text-muted">
                Select the type of game you are playing in.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Game/Tournament ID</Form.Label>
              <Form.Control value={this.state.apiId} onChange={(event) => this.handleApiIdChange(event)} inputMode="string" placeholder="e.g. -MnVll18N3qLF-Z2bVoU" />
              <Form.Text className="text-muted">
                Please provide the unique identifier of the game you wish to be staked in
              </Form.Text>
            </Form.Group>

            <Button
              onClick={this.createStakingRequest}
              variant="primary"
              type="submit"
            >
              Submit
            </Button>
            
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default NewStakingRequestForm;
