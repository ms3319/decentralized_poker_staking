import React from "react";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { Accordion } from "react-bootstrap";

export default function PlayerCardPopUp() {
  return (
    <Accordion>
      <Accordion.Item eventKey="0">
        <Accordion.Header>PLAYER INFO</Accordion.Header>
        <Accordion.Body>
          <ListGroup>
          <ListGroupItem> Current Residence: Las Vegas, NV, USA </ListGroupItem>
            <ListGroupItem> Born: July 26, 1974 </ListGroupItem>
            <ListGroupItem> Birth place: Ontario, Canada </ListGroupItem>
            <ListGroupItem> Total winnings: $41.857.383 </ListGroupItem>
          </ListGroup>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>PLAYER SCORE</Accordion.Header>
        <Accordion.Body>
          <ListGroup>
          <ListGroupItem> Aggressiveness: 7 </ListGroupItem>
            <ListGroupItem> Looseness: 7 </ListGroupItem>
            <ListGroupItem> Limit: 8 </ListGroupItem>
            <ListGroupItem> No-limit: 8 </ListGroupItem>
            <ListGroupItem> Side Games: 7 </ListGroupItem>
            <ListGroupItem> Steam Control: 7 </ListGroupItem>
            <ListGroupItem> Against Strong Players: 7 </ListGroupItem>
            <ListGroupItem> Against Weak Players: 8 </ListGroupItem>
            <ListGroupItem> Tournaments: 9 </ListGroupItem>
            <ListGroupItem> Short-Handed: 8 </ListGroupItem>
          </ListGroup>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2">
        <Accordion.Header>PLAYER TRIVIA</Accordion.Header>
        <Accordion.Body>
          Information about the player.
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}