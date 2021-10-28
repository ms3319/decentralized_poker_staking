import Card from "react-bootstrap/Card";
import {Row, Col, ListGroup}  from "react-bootstrap";
import { Component } from "react";

export default class PlayerCard extends Component {

        render()  {
    return (
  
      
        [
            ['Primary','Daniel Negreanu'],
            ['Secondary','Cary Katz'],
            ['Success','Mike Matusow'],
            ['Danger]','Anthony Zinno'],
            ['Warning','David Williams'],
            ['Info','Josh Arieh'],
            ['Light','Dylan Gang'],
            ['Dark','Jonathan Little']
          ].map((variant, idx) => (
            <Card
              bg={variant[0].toLowerCase()}
              key={idx}
              text={variant[0] ==='Dark' ? 'light' :'dark'}
              style={{ width: '22rem' , height: '14rem'}}
              className="mb-2"
            >
              
              <Card.Body>
             <Row>
                 <Col>
                 <div style={{fontSize: '20px'}}>
                     {variant[1]}
                     </div>
                 </Col>
                 <Col md="auto"> <img src="../charlie-chaplin-icon.png" class="rounded float-left" alt=".."></img> </Col>
                 </Row>
                 <Row>
                     <Col> Playing in</Col>
                     </Row>
                   <Row>
                       <Col>Poker Tournament X </Col>
                       </Row>  
              </Card.Body>
            </Card>
          )
         
    )
   
    );
  }
}
  