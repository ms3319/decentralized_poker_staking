import React, { Component } from "react";
import { Modal, Form } from "react-bootstrap";
import Button from "./Button"

import "bootstrap/dist/css/bootstrap.min.css";

class EditPlayerForm extends Component {
    state = {name: this.props.player.name, sharkscopeLink: this.props.player.sharkscopeLink, profilePicPath: this.props.player.profilePicPath};

    saveProfileChanges = async () => {
        const { accounts, contract, onHide } = this.props;

        await contract.methods.editPlayer(this.state.name, this.state.sharkscopeLink, this.state.profilePicPath).send({ from: accounts[0] });
        onHide()
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
                        Edit Player Profile
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
                            <Form.Control value={this.state.sharkscopeLink} onChange={(event) => this.handleSharkscopeLinkChange(event)} inputMode="text"/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Profile Picture Path</Form.Label>
                            <Form.Control value={this.state.profilePicPath} onChange={(event) => this.handleProfilePicPathChange(event)} inputMode="text"/>
                        </Form.Group>

                        <Button
                            onClick={event => {event.preventDefault(); this.saveProfileChanges()}}
                            variant="primary"
                            type="submit"
                        >
                        Save Changes
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

export default EditPlayerForm;