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

export default function Stable(props) {
        console.log(props)
    
        // const [showPopUp, setShowPopUp] = useState(false);
        const [show, setShow] = useState(false);
        const handleClose = () => setShow(false);
        const handleShow = () => setShow(true);
       
        if(props.requests.length === 0) {
            return(
                <div>
                    Stable is empty
                    </div>
            );
        }
        let investor = props.accounts[0];

        return(
           <div className = "Stable" style = {{overflowY: 'scroll'}}>
               <Container style={{position: 'absolute', left: '170px', backgroundColor: "white"}} fluid = {true}>
               {
                        props.requests.filter(request => request.backer === investor).map((player,idx) => (
                            <button onClick={handleShow} style={{padding: 0, border:'none', background: 'none'}}>
                                   <PlayerCard horse={player.horse}
                                   bg={player[0].toLowerCase()}
                                   key={idx}
                                   text={player[0] ==='Dark' ? 'light' :'dark'}
                                   style={{ width: '22rem' , height: '14rem', float: 'left', margin:'15px', border: 'solid black 1px'}}
                                   className="mb-2"/> 
                                </button>
                        )

                        ) }
                   </Container> 
                   <PlayerCardModalForm show= {show} style={{position:'absolute', left:'170px'}} handleClose={handleClose}/>

           </div>             
        );
    
}