import Card from "react-bootstrap/Card";
import {Row, Col}  from "react-bootstrap";
import { Component } from "react";

export default class TournamentCard extends Component {

        render()  {
    return (
  
        [
            ['Primary','Masters of Poker'],
            ['Secondary','UK Open Poker'],
            ['Success','Texas Holdem Champions'],
            ['Danger]','Omaha Champions League'],
            ['Warning','High Low Chicago Conference League'],
            ['Info','Badugi National League'],
            ['Light','Bluff or Nuff Cup'],
            ['Dark','Beginners International Knockouts']
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
                 </Row>
                 <Row>
                     <Col> Location</Col>
                     </Row>
                   <Row>
                       <Col>London, UK</Col>
                       </Row>  
              </Card.Body>
            </Card>
          )
         
    )
   
    );
  }
}
  