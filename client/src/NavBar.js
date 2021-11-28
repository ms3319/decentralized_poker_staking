import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import {Link} from "react-router-dom";
import { useWeb3React } from "@web3-react/core"

import 'bootstrap/dist/css/bootstrap.min.css';
import ConnectionStatus from "./ConnectionStatus";

const NavBar = ({ hasPlayerAccount }) => {

  const { active, account } = useWeb3React()

  return (
    <Navbar expand="md" style={{backgroundColor:"#282828", fontSize: "1.25rem", padding: "20px 0"}} variant={"dark"}>
      <Container>
        <Link to={"/"} style={{color:"white", textDecoration: "none", marginRight: "30px"}}>{active ? "Marketplace" : "Home"}</Link>
        <ConnectionStatus />
        <Navbar.Toggle aria-controls="basic-navbar-nav" style={{border: "none"}} />
        <Navbar.Collapse className={"justify-content-end"}>
          <Nav>
            <Link to="/about" style={{color:"white", textDecoration: "none", marginLeft: "30px"}}>About</Link>
            {active && hasPlayerAccount && <Link to={"/players/" + account} style={{color:"white", textDecoration: "none", marginLeft: "30px"}}>My Profile</Link>}
            {active && <Link to="/my-stable" style={{color:"white", textDecoration: "none", marginLeft: "30px"}}>My Stable</Link>}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </ Navbar>
  );
};

export default NavBar;