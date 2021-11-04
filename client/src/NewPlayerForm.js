import React, { Component } from "react";
import { Modal, Form } from "react-bootstrap";
import Button from "./Button"

import "bootstrap/dist/css/bootstrap.min.css";

class NewPlayerForm extends Component {
    state = {name: "", sharkscopeLink: ""};

    createNewPlayer = async () => {
        const { accounts, contract } = this.props;
        console.log("creating new player...")

        // TO-DO: perform form input validation (mainly just check for empty strings in both name & sharkscope link)

        await contract.methods.createPlayer(this.state.name, this.state.sharkscopeLink).send({ from: accounts[0] });
      };
    
    handleNameChange(event) {
        this.setState({name: event.target.value});
    }

    handleSharkscopeLinkChange(event) {
        this.setState({sharkscopeLink: event.target.value});
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
                        Create New Player
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control value={this.state.name} onChange={(event) => this.handleNameChange(event)} inputMode="text"/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Sharkscope Link</Form.Label>
                            <Form.Control value={this.state.escrow} onChange={(event) => this.handleSharkscopeLinkChange(event)} inputMode="text"/>
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            onClick={this.createNewPlayer}
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

export default NewPlayerForm;
