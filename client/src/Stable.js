import React, { Component } from 'react';
import PlayerCard from "./PlayerCard.js";
import { Carousel, Button } from 'react-bootstrap';
import {Container} from 'react-bootstrap';
import {useState} from 'react';
import './Stable.css';
import PlayerCardModalForm from './PlayerCardModalForm.js';

const playersPerPage = 16;
const playersAndVariants =  [
    ['Primary','Daniel Negreanu'],
    ['Secondary','Cary Katz'],
    ['Success','Mike Matusow'],
    ['Danger','Anthony Zinno'],
    ['Warning','David Williams'],
    ['Info','Josh Arieh'],
    ['Light','Dylan Gang'],
    ['Dark','Jonathan Little'],
    ['Primary','Daniel Negreanu'],
    ['Secondary','Cary Katz'],
    ['Success','Mike Matusow'],
    ['Danger','Anthony Zinno'],
    ['Warning','David Williams'],
    ['Info','Josh Arieh'],
    ['Light','Dylan Gang'],
    ['Dark','Jonathan Little'],
   ['Primary','Daniel Negreanu'],
    ['Secondary','Cary Katz'],
    ['Success','Mike Matusow'],
    ['Danger','Anthony Zinno'],
    ['Warning','David Williams'],
    ['Info','Josh Arieh'],
    ['Light','Dylan Gang'],
    ['Dark','Jonathan Little'],
    ['Primary','Daniel Negreanu'],
    ['Secondary','Cary Katz'],
    ['Success','Mike Matusow'],
    ['Danger','Anthony Zinno'],
    ['Warning','David Williams'],
    ['Info','Josh Arieh'],
    ['Light','Dylan Gang'],
    ['Dark','Jonathan Little'],
    ['Primary','Daniel Negreanu'],
    ['Secondary','Cary Katz'],
    ['Success','Mike Matusow'],
    ['Danger','Anthony Zinno'],
    ['Warning','David Williams'],
    ['Info','Josh Arieh'],
    ['Light','Dylan Gang'],
    ['Dark','Jonathan Little'],
    ['Primary','Daniel Negreanu'],
    ['Secondary','Cary Katz'],
    ['Success','Mike Matusow'],
    ['Danger','Anthony Zinno'],
    ['Warning','David Williams'],
    ['Info','Josh Arieh'],
    ['Light','Dylan Gang'],
    ['Dark','Jonathan Little']
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

export default function Stable() {

    
        // const [showPopUp, setShowPopUp] = useState(false);
        const [show, setShow] = useState(false);
        const handleClose = () => setShow(false);
        const handleShow = () => setShow(true);
        
        return(
           <div className = "Stable" style = {{overflowY: 'scroll'}}>
               <Container style={{position: 'absolute', left: '170px', backgroundColor: "red"}} fluid = {true}>
               {
                        playersAndVariants.map((player,idx) => (
                            <Button onClick={handleShow} style={{border:'none'}}>
                                   <PlayerCard horse={player}
                                   bg={player[0].toLowerCase()}
                                   key={idx}
                                   text={player[0] ==='Dark' ? 'light' :'dark'}
                                   style={{ width: '22rem' , height: '14rem', float: 'left', margin:'15px', border: 'solid black 1px'}}
                                   className="mb-2"/> 
                                </Button>
                        )

                        ) }
                   </Container> 
                   <PlayerCardModalForm show= {show} style={{position:'absolute', left:'170px'}} handleClose={handleClose}/>

           </div>             
        );
    
}