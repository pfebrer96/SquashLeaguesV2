import Configurable from "../configurable"
import Firebase from "../../api/Firebase"

import React, {Component} from 'react';
import {ScrollView} from "react-native"
import MatchesDisplay from "../../components/competition/MatchesDisplay";

//This is the parent class of all competitions and contains general flows

export default class Competition extends Configurable {

    constructor(compDict){
        super()

        //Set all the attributes of the competition as they were provided
        Object.keys(compDict).forEach( key => {
            this[key] = compDict[key]
        })

    }

    renderName = (nameObject) => {
        /* Renders the name of a given user according to the competition's settings */ 

        let nameDisplaySettings = this.getSetting("nameDisplay")

        if (!nameObject){
            return translate("errors.no name")
        } if (nameDisplaySettings == "Name Lastname"){
            return [ nameObject.firstName, nameObject.lastName].join(" ")
        } else if (nameDisplaySettings == "Lastname, Name" ) {
            return [ nameObject.lastName, nameObject.firstName].join(", ")
        } else if (nameDisplaySettings == "Name") {
            return nameObject.firstName
        } else if (nameDisplaySettings == "free"){
            return nameObject.aka
        }
    }

    compMatchesListener = (setState) => Firebase.onCompPendingMatchesSnapshot(this.gymID, this.id, (matches) => setState({matches}))

    renderCompMatches = (state, props) => {

        if (!state.matches) return null
        
        return <MatchesDisplay 
            navigation={props.navigation} 
            matches={state.matches.map( match => ({...match, context: {...match.context, competition: this }}) )}/> 
    }

}
