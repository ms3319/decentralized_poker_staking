import React, { Component } from 'react';
import PlayerCard from "./PlayerCard.js";
import './Stable.css';
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
    ['Dark','Jonathan Little']
  ];

export default class Stable extends Component {
    constructor(props) {
        super(props);
        this.state = {players: playersAndVariants};
    }
    render(){
   
        
        return(
           <div className = "Stable"> 
                <PlayerCard horses={playersAndVariants}/>
                
           </div>             
        );
    }
}