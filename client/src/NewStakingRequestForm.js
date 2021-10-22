import React, { Component } from "react";
import { Modal, Button, Form } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";

class NewStakingRequestForm extends Component {
  state = { amount: 0, profitShare: 0 };

  createStakingRequest = async () => {
    const { accounts, contract } = this.props;

    // TODO: sanity check the values
    await contract.methods.createRequest(this.state.amount, this.state.profitShare).send({ from: accounts[0] });

    // const newList = await contract.methods.getUsers().call();
    // this.setState({ userList: newList });
  };

  handleAmountChange(event) {
    this.setState({amount: event.target.value});
  }

  handleProfitShareChange(event) {
    this.setState({profitShare: event.target.value});
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

            <Button
              variant="primary"
              type="submit"
              onClick={this.createStakingRequest}
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
