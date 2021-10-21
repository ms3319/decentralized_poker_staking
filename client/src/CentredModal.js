import React from "react";
import { Modal, Button } from "react-bootstrap";

import 'bootstrap/dist/css/bootstrap.min.css';

const CentredModal = (props) => {
    return (
        <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        >
        <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
            Modal heading
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <h4>Centered Modal</h4>
            <p>
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
            dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
            consectetur ac, vestibulum at eros. 123
            </p>
            <Button style={{backgroundColor:"#008b02", borderColor:"black", color:"black", marginRight:"10px"}}>
              Invest 
            </Button>
            <Button style={{backgroundColor:"#fccb00", borderColor:"black", color:"black", marginLeft:"10px", marginRight:"10px"}}>
              Wishlist 
            </Button>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
        </Modal>
    );
};

export default CentredModal;

