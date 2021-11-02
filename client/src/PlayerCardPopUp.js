import React from "react";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { Button, Accordion,  Card } from "react-bootstrap";

export default function PlayerCardPopUp() {
    return (
        <Accordion>
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant="light" eventKey="0">
                   PLAYER INFO
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="0">
              <Card.Body>
                  <ListGroup>
                      <ListGroupItem> Current Residence: Las Vegas, NV, USA </ListGroupItem>
                      <ListGroupItem> Born: July 26, 1974 </ListGroupItem>
                      <ListGroupItem> Birth place: Ontario, Canada </ListGroupItem>
                      <ListGroupItem> Total winnings: $41.857.383 </ListGroupItem>
                  </ListGroup>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant="light" eventKey="1">
                   PLAYER SCORE
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="1">
              <Card.Body>
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
              </Card.Body>
            </Accordion.Collapse>
          </Card>
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant="light" eventKey="2">
                PLAYER TRIVIA
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="2">
              <Card.Body>
                  Information about the player.
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      );
}