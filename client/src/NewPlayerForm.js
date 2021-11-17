import React, { Component } from "react";
import { Modal, Form } from "react-bootstrap";
import Button from "./Button";
import validator from 'validator'
import { Col } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";

class NewPlayerForm extends Component {
    state = {apiId: "", name: "", sharkscopeLink: "", profilePicPath: "", sanitaryId: true, sanitaryName: true, sanitarySharkscope: true};

    createNewPlayer = async () => {
        const { accounts, contract } = this.props

        const apiIdExists = await this.checkPlayerIdExists()
        const nameCheck = this.checkName()
        const sharkscopeCheck = this.checkSharkscope()

        this.setState({ sanitaryId: apiIdExists, sanitaryName: nameCheck, sanitarySharkscope: sharkscopeCheck })
        if (apiIdExists || nameCheck || sharkscopeCheck) {
            await contract.methods.createPlayer(this.state.apiId, this.state.name, this.state.sharkscopeLink, this.state.profilePicPath).send({ from: accounts[0] });
        }    
    };

    async checkPlayerIdExists() {
        fetch(`http://127.0.0.1:8000/players/${this.state.apiId}`,
        { method: "GET", mode: 'cors', headers: {'Content-Type': 'application/json'}})
        .then(response => response.json())
        .then(data => Object.keys(data).length !== 0)
    }

    checkName() {
        return (this.state.name.length !== 0)
    }

    checkSharkscope() {
        return validator.isURL(this.state.name);
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
                            { !this.state.sanitaryName &&
                             <p style={{color: "red", marginTop:"-0.5em"}}>
                                Make sure you enter a valid Name!
                            </p>
                            }
                            <Form.Control value={this.state.name} onChange={(event) => this.handleNameChange(event)} inputMode="text"/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Unique Identifier</Form.Label>
                            { !this.state.sanitaryName &&
                             <p style={{color: "red", marginTop:"-0.5em"}}>
                                Make sure you enter a valid Unique Identifier!
                            </p>
                            }
                            <Form.Control value={this.state.apiId} onChange={(event) => this.handleApiIdChange(event)} inputMode="text"/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Sharkscope Link</Form.Label>
                            { !this.state.sanitarySharkscope &&
                             <p style={{color: "red", marginTop:"-0.5em"}}>
                                Make sure you enter a valid Sharkscope Link!
                            </p>
                            }
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
                <Col>
                { !(this.state.sanitaryId || this.state.sanitaryName || this.state.sanitarySharkscope) &&
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