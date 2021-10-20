import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

import 'bootstrap/dist/css/bootstrap.min.css';

const NewStakingRequestForm = (props) => {
    return (
        <Modal
        {...props}
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
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Amount I'm looking for (in £)</Form.Label>
                    <Form.Control placeholder="Password" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Profit Sharing Percentage (%) </Form.Label>
                    <Form.Control placeholder="Password" />
                    <Form.Text className="text-muted">
                        Exp: If the amount I'm looking for is £50, and profit sharing percentage is 50%, then I'll have to contribute £50 myself to make up £100.
                        After the game, I'll return £50 + 50% of my winnings back to the investor.
                    </Form.Text>
                </Form.Group>

                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
        </Modal>
    );
};

export default NewStakingRequestForm;