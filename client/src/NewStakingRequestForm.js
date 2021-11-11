import React, { Component } from "react";
import { Modal, Form } from "react-bootstrap";
import Button from "./Button"
import { CoinGeckoClient, usdToWei } from "./utils";

import "bootstrap/dist/css/bootstrap.min.css";


class NewStakingRequestForm extends Component {
  state = { amount: 0, profitShare: 0, escrow: 0, ethPriceUsd: 0, weiAmount: 0, weiEscrow: 0 };

  createStakingRequest = async () => {
    const { accounts, contract } = this.props;
    // TODO: sanity check the values
    if (this.state.escrow > 0) {
      await contract.methods.createRequest(this.state.weiAmount.toString(), this.state.profitShare, this.state.weiEscrow.toString())
        .send({ from: accounts[0], value: this.state.weiEscrow }, function (error, transactionHash) {
          console.log(error);
          console.log(transactionHash);
        });
    } else {
      try {
        await contract.methods.createRequest(this.state.weiAmount.toString(), this.state.profitShare, this.state.weiEscrow.toString())
          .send({ from: accounts[0] });
      } catch (error) {
        const response = JSON.parse(error.message.split("'")[1]);
        console.log(response.value);
        console.log(response.value.data.data);
      }
    }
  };

  componentDidMount() {
    CoinGeckoClient.simple.price({ids: ['ethereum'], vs_currencies: ['usd']}).then(resp => this.setState({ethPriceUsd: resp.data.ethereum.usd}));
  }

  handleAmountChange(event) {
    this.setState({weiAmount: usdToWei(event.target.value, this.state.ethPriceUsd)});
    this.setState({amount: event.target.value});
  }

  handleProfitShareChange(event) {
    this.setState({profitShare: event.target.value});
  }

  handleEscrowChange(event) {
    this.setState({escrow: event.target.value});
    this.setState({weiEscrow: usdToWei(event.target.value, this.state.ethPriceUsd)});
  }

  render() {
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
              <Form.Label>Amount I'm looking for ($)</Form.Label>
              <Form.Control value={this.state.amount} onChange={(event) => this.handleAmountChange(event)} inputMode="numeric" placeholder="e.g. 100" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Profit Sharing Percentage (%) </Form.Label>
              <Form.Control value={this.state.profitShare} onChange={(event) => this.handleProfitShareChange(event)} inputMode="numeric" placeholder="e.g. 50" />
              <Form.Text className="text-muted">
                If the amount I'm looking for is $50, and profit sharing
                percentage is 50% and I make $50 in profit. I must return to the 
                investor $75 ($50 original investment + $50 profit * 0.5) 
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Escrow Amount ($)</Form.Label>
              <Form.Control value={this.state.escrow} onChange={(event) => this.handleEscrowChange(event)} inputMode="numeric" placeholder="e.g. 50" />
              <Form.Text className="text-muted">
                If you would like to provide some collateral to increase the trust involved in this transaction please specify the amount here.
              </Form.Text>
            </Form.Group>

            <Button
              onClick={(event) => {event.preventDefault(); this.createStakingRequest();}}
              variant="primary"
              // type="submit"
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
