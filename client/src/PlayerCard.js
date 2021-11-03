import Card from "react-bootstrap/Card";
import {Row, Col,Container}  from "react-bootstrap";
import { Component } from "react";

export default class PlayerCard extends Component {
        render()  {
    return (
  
      <Container style={{position: 'absolute', left: '170px', backgroundImage:"../public/thumb-1920-449578.jpg"}} fluid = {true}>
        {
       this.props.horses.map((variant, idx) => (
            <Card
              bg={variant[0].toLowerCase()}
              key={idx}
              text={variant[0] ==='Dark' ? 'light' :'dark'}
              style={{ width: '22rem' , height: '14rem', float: 'left', margin:'15px', border: 'solid black 1px'}}
              className="mb-2"
              
            >

              
              <Card.Body>
             <Row>
                 <Col>
                 <div style={{fontSize: '20px', fontWeight:'bold'}}>
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
       )}
    
        </Container>
    );
          
        }
      }
