import React from "react";
import { Navbar, Container, Nav, Col } from "react-bootstrap";

import 'bootstrap/dist/css/bootstrap.min.css';

const CustomBar = () => {
    return (
        <Navbar expand="lg" style={{backgroundColor:"#5f9ea0", borderRadius:"0px 0px 10px 10px", marginBottom:"2rem", boxShadow: "0px 5px grey", height:"5rem"}}>
            <Container>
                <Col xs={9} style={{textAlign:"left"}}>
                <Navbar.Brand>Group 24</Navbar.Brand>
                </Col>
                <Nav.Link href="" style={{color:"black"}}>My Games</Nav.Link>
                <Nav.Link href="" style={{color:"black"}}>My Stable</Nav.Link>
            </Container>
        </ Navbar>
    );
};

export default CustomBar;