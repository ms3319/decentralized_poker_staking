import React, { Component } from "react";
import { Modal, Form } from "react-bootstrap";
import Button from "./Button"

import "bootstrap/dist/css/bootstrap.min.css";

class NewPlayerForm extends Component {
    state = {apiId: "", name: "", sharkscopeLink: "", profilePicPath: "", sanitary: true};

    createNewPlayer = async () => {
        const { accounts, contract } = this.props;
        this.checkPlayerIdExists()
        console.log("creating new player...")

        // TO-DO: perform form input validation (mainly just check for empty strings in both name & sharkscope link)

        await contract.methods.createPlayer(this.state.apiId, this.state.name, this.state.sharkscopeLink, this.state.profilePicPath).send({ from: accounts[0] });
    };

    checkPlayerIdExists(userId) {
        fetch(`http://127.0.0.1:8000/players/${userId}`,
        { method: "GET", mode: 'cors', headers: {'Content-Type': 'application/json'}})
        .then(response => response.json())
        .then(data => {if (!Object.keys(data).length) {
          this.setState({sanitary: false})
        }
        })
    }

    handleApiIdChange(event) {
        this.setState({apiId: event.target.value});
    }
    
    handleNameChange(event) {
        this.setState({name: event.target.value});
    }

    handleSharkscopeLinkChange(event) {
        this.setState({sharkscopeLink: event.target.value});
    }

    handleProfilePicPathChange(event) {
        this.setState({profilePicPath: event.target.value});
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
                            <Form.Label>Unique Identifier</Form.Label>
                            <Form.Control value={this.state.apiId} onChange={(event) => this.handleApiIdChange(event)} inputMode="text"/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Sharkscope Link</Form.Label>
                            <Form.Control value={this.state.sharkscopeLink} onChange={(event) => this.handleSharkscopeLinkChange(event)} inputMode="text"/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Profile Picture Path</Form.Label>
                            <Form.Control value={this.state.profilePicPath} onChange={(event) => this.handleProfilePicPathChange(event)} inputMode="text"/>
                        </Form.Group>

                        <Button
                            onClick={(event) => {event.preventDefault(); this.createNewPlayer()}}
                            variant="primary"
                            type="submit"
                        >
                        Submit
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                { !this.state.sanitary &&
                    <h2>
                        Make sure you enter a valid Tournament/Game ID!
                    </h2>
                }
                    <Button onClick={this.props.onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default NewPlayerForm;
