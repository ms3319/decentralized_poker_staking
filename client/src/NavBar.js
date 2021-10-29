import React from "react";
import { Navbar, Container, Nav, Col } from "react-bootstrap";

import 'bootstrap/dist/css/bootstrap.min.css';

const NavBar = () => {
    return (
        <Navbar expand="lg" style={{backgroundColor:"#080808", borderRadius:"0px 0px 10px 10px", marginBottom:"2rem", boxShadow: "0px 5px grey", height:"5rem"}}>
            <Container>
                <Col xs={9} style={{textAlign:"left"}}>
                <Navbar.Brand style = {{color:"white"}}>Group 24</Navbar.Brand>
                </Col>
                <Nav.Link href="" style={{color:"#ff9800"}}>My Games</Nav.Link>
                <Nav.Link href="" style={{color:"#ff9800"}}>My Stable</Nav.Link>
            </Container>
        </ Navbar>
    );
};

export default NavBar;