import React from "react";
import { Component } from "react";
import { Modal } from "react-bootstrap";
import PlayerCardPopUp from "./PlayerCardPopUp.js";

export default class PlayerCardModalForm extends Component {

    constructor(props) {
        super(props);
    }
  render() {
      return (
        
            <>
              <Modal
                size="lg"
                show={this.props.show}
                aria-labelledby="example-modal-sizes-title-lg"
              >
                <Modal.Header closeButton>
                  <Modal.Title id="example-modal-sizes-title-lg">
                    Daniel Negreanu
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <PlayerCardPopUp />
                </Modal.Body>
              </Modal>
            </>
          
      );
  }
}
