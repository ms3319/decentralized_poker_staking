import React from "react";
import { Navbar, Container, Nav, Col } from "react-bootstrap";
import {Link} from "react-router-dom";
import {Component} from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
export default class CustomBar extends Component{
    constructor(props){
        super(props);
    }
render() {
    return (
        <Navbar expand="lg" style={{backgroundColor:"#080808", borderRadius:"0px 0px 10px 10px", marginBottom:"2rem", boxShadow: "0px 5px grey", height:"5rem"}}>
            <Container>
                <Col xs={9} style={{textAlign:"left"}}>
                <Navbar.Brand style = {{color:"white"}}>Group 24</Navbar.Brand>
                </Col>
                <Link to = "/myGames" style={{color:"#ff9800"}}>My Games</Link>
                <Link to = "/myStable" style={{color:"#ff9800"}} >My Stable</Link>
            </Container>
        </Navbar>
    );
}
}
