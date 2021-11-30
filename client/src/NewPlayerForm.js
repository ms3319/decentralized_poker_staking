import React, { Component } from "react";
import { Modal, Form } from "react-bootstrap";
import Button from "./Button";
import validator from 'validator'
import { Col } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";

class NewPlayerForm extends Component {
    state = {apiId: "", name: "", sharkscopeLink: "", profilePicPath: "", sanitaryId: true, sanitaryName: true, sanitarySharkscope: true};

    createNewPlayer = async () => {
        const { accounts, contract, onHide } = this.props;

        const apiIdExists = await this.checkPlayerIdExists()
        const nameCheck = this.checkName()
        const sharkscopeCheck = this.checkSharkscope()

        this.setState({ sanitaryId: apiIdExists, sanitaryName: nameCheck, sanitarySharkscope: sharkscopeCheck })
        if (apiIdExists && nameCheck && sharkscopeCheck) {
            await contract.methods.createPlayer(this.state.apiId, this.state.name, this.state.sharkscopeLink, this.state.profilePicPath).send({ from: accounts[0] });
            this.props.reloadContractState();
            onHide()
        }
    };

    async checkPlayerIdExists() {
        if (this.state.apiId === "") return false;
        return await fetch(`https://safe-stake-mock-api.herokuapp.com/players/${this.state.apiId}`,
        { method: "GET", mode: 'cors', headers: {'Content-Type': 'application/json'}})
            .then(response => response.json())
            .then(data => Object.keys(data).length !== 0)
    }

    checkName() {
        return (this.state.name.length !== 0)
    }

    checkSharkscope() {
        return validator.isURL(this.state.sharkscopeLink);
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
                show={this.props.show}
                onHide={this.props.onHide}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Sign up as a player
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Create a player account, which will be linked to your wallet address. This will allow you to create staking requests, so that you can receive funds from potential investors, in return for a share of your winnings.</p>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Display Name</Form.Label>
                            { !this.state.sanitaryName &&
                             <p style={{color: "red", marginTop:"-0.5em"}}>
                                Make sure you enter a valid Name!
                            </p>
                            }
                            <Form.Control placeholder="johnsmith123" value={this.state.name} onChange={(event) => this.handleNameChange(event)} inputMode="text"/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Player ID</Form.Label>
                            { !this.state.sanitaryId &&
                             <p style={{color: "red", marginTop:"-0.5em"}}>
                                Make sure you enter a valid Unique Identifier!
                            </p>
                            }
                            <Form.Control placeholder="-MnWmBbGYTHAXIWAZ9HA" value={this.state.apiId} onChange={(event) => this.handleApiIdChange(event)} inputMode="text"/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Link to poker stats</Form.Label>
                            { !this.state.sanitarySharkscope &&
                             <p style={{color: "red", marginTop:"-0.5em"}}>
                                Make sure you enter a valid Sharkscope Link!
                            </p>
                            }
                            <Form.Control placeholder="www.sharkscope.com/#Player-Statistics//networks/PokerStars/players/JohnSmith" value={this.state.sharkscopeLink} onChange={(event) => this.handleSharkscopeLinkChange(event)} inputMode="text"/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Link to Profile Picture</Form.Label>
                            <Form.Control placeholder="i.imgur.com/AD3MbBi.jpeg" value={this.state.profilePicPath} onChange={(event) => this.handleProfilePicPathChange(event)} inputMode="text"/>
                        </Form.Group>

                        <Button
                            onClick={event => {event.preventDefault(); this.createNewPlayer()}}
                            variant="primary"
                            type="submit"
                        >
                        Submit
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                <Col>
                { !(this.state.sanitaryId && this.state.sanitaryName && this.state.sanitarySharkscope) &&
                    <p style={{color: "red", marginTop:"-0.5em"}}>
                        Make sure you all your entries are valid!
                    </p>
                }
                </Col>
                <Col>
                    <Button onClick={this.props.onHide} style={{float: "right"}}>Close</Button>
                </Col>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default NewPlayerForm;


/*
function isValidHttpUrl(string) {
  let url;
  
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}
*/