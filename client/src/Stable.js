import React, { Component } from 'react';
import PlayerCard from "./PlayerCard.js";
import { Carousel} from 'react-bootstrap';
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

    
        const [showPopUp, setShowPopUp] = useState(false);
        
        return(
           <div className = "Stable" style = {{overflowY: 'scroll'}}>
               <Container style={{position: 'absolute', left: '170px'}} fluid = {true}>
               {
                        playersAndVariants.map((player,idx) => (
                            <button onClick={() => {setShowPopUp(true)}} style={{border:'none'}}>
                                   <PlayerCard horse={player}
                                   bg={player[0].toLowerCase()}
                                   key={idx}
                                   text={player[0] ==='Dark' ? 'light' :'dark'}
                                   style={{ width: '22rem' , height: '14rem', float: 'left', margin:'15px', border: 'solid black 1px'}}
                                   className="mb-2"/> 
                                </button>
                        )

                        ) }
    
                   </Container> 
                   <PlayerCardModalForm show= {showPopUp} style={{position:'absolute', left:'170px'}}/>

           </div>             
        );
    
}