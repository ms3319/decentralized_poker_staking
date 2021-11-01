import React, { Component } from 'react';
import PlayerCard from "./PlayerCard.js"
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

export default class Stable extends Component {
    constructor(props) {
        super(props);
        let playersAndVariants2 = playersAndVariants.concat(playersAndVariants);
        this.state = {players: playersAndVariants2};
    }
    render(){
        return(
           <div className = "Stable"> 
                <PlayerCard horses = {this.state.players}/>
                
           </div>             
        );
    }
}