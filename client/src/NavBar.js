import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import {Link} from "react-router-dom";
import { useWeb3React } from "@web3-react/core"

import 'bootstrap/dist/css/bootstrap.min.css';

const NavBar = () => {

  const { active } = useWeb3React()

  return (
    <Navbar expand="md" style={{backgroundColor:"#282828", fontSize: "1.25rem", padding: "20px 0"}} variant={"dark"}>
      <Container>
        <Link to={"/"} style={{color:"white", textDecoration: "none"}}>{active ? "Marketplace" : "Home"}</Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" style={{border: "none"}} />
        <Navbar.Collapse className={"justify-content-end"}>
          <Nav>
            <Link to="" style={{color:"white", textDecoration: "none", marginLeft: "30px"}}>About</Link>
            {active && <Link to="/my-games" style={{color:"white", textDecoration: "none", marginLeft: "30px"}}>My Games</Link>}
            {active && <Link to="/my-stable" style={{color:"white", textDecoration: "none", marginLeft: "30px"}}>My Stable</Link>}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </ Navbar>
  );
};

export default NavBar;