import React from "react";
import { Navbar, Container, Nav, Col } from "react-bootstrap";
import { useWeb3React } from "@web3-react/core"

import 'bootstrap/dist/css/bootstrap.min.css';

const NavBar = () => {

  const { active } = useWeb3React()

  return (
    <Navbar expand="md" style={{backgroundColor:"#282828"}} variant={"dark"}>
      <Container>
        <Navbar.Brand href={"/"} style={{color:"white"}}>{active ? "Marketplace" : "Home"}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse className={"justify-content-end"}>
          <Nav>
            <Nav.Link href="" style={{color:"white"}}>About</Nav.Link>
            {active && <Nav.Link href="" style={{color:"white"}}>My Games</Nav.Link>}
            {active && <Nav.Link href="" style={{color:"white"}}>My Stable</Nav.Link>}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </ Navbar>
  );
};

export default NavBar;