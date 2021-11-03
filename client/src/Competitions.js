import React, { Component } from 'react';
import TournamentCard from "./TournamentCard"
import {Container} from 'react-bootstrap';

const tournamentsPerPage = 16;
const tournamentsAndVariants =  [
    ['Primary', 'Masters of Poker'],
    ['Secondary', 'UK Open Poker'],
    ['Success','Texas Holdem Champions'],
    ['Danger]','Omaha Champions League'],
    ['Warning','High Low Chicago Conference League'],
    ['Info','Badugi National League'],
    ['Light','Bluff or Nuff Cup'],
    ['Dark','Beginners International Knockouts']
  ];

const variants = [
    'Primary',
    'Secondary',
    'Success',
    'Danger',
    'Warning',
    'Info',
    'Light',
    'Dark'
];

export default function Competitions() {
    
    // const [showPopUp, setShowPopUp] = useState(false);
    // const [show, setShow] = useState(false);
    // const handleClose = () => setShow(false);
    // const handleShow = () => setShow(true);
    
    return(
       <div className = "Competitions" style = {{overflowY: 'scroll'}}>
           <Container style={{position: 'absolute', left: '170px', backgroundColor: "white"}} fluid = {true}>
           {
                    tournamentsAndVariants.map((tournament,idx) => (
                        
                               <TournamentCard tournament={tournament}
                               bg={tournament[0].toLowerCase()}
                               key={idx}
                               text={tournament[0] ==='Dark' ? 'light' :'dark'}
                               style={{ width: '22rem' , height: '14rem', float: 'left', margin:'15px', border: 'solid black 1px'}}
                               className="mb-2"/> 
                            
                    )

                    ) }
               </Container> 
               

       </div>             
    );

}