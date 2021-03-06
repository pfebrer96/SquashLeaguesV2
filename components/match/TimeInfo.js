import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'
import moment from "moment"

import Card from '../UX/Card'

import { translate } from '../../assets/translations/translationWorkers'
import {convertDate} from "../../assets/utils/utilFuncs"

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"

import { totalSize } from '../../api/Dimensions'
import { addEventToCalendar } from '../../api/Calendar'
import * as Localization from 'expo-localization'

import UpdatableCard from '../UX/UpdatableCard'
import { Text, Button, Icon, Toast} from 'native-base'
import InputField from "../configs/inputs"

import _ from "lodash"
import { TouchableOpacity } from 'react-native-gesture-handler'


class TimeInfo extends Component {

    constructor(props){
        super(props)
        this.state = {
            pendingUpdate: false
        }

        this.datePickerFormat = "DD-MM HH:mm"
    }

    DateLimit = ({limitDate, textStyles }) => {

        let momentLimit = moment(limitDate)

        let daysLeft = momentLimit.diff( moment(), "days")

        textStyles = {
            color: daysLeft > 7 ? "green" : daysLeft > 3 ? "yellow" : "darkred",
            ...textStyles 
        }

        return (
            <View>
                <View style={{paddingTop:10, flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                    <Text style={{textAlign: "center"}}>{translate("info.limit to play") + ":" }</Text>
                    <Text style={{ ...textStyles, textAlign: "center"}}>{moment(limitDate).fromNow()}</Text>
                </View>
                <Text note style={{ textAlign: "center"}}>{"(" + moment(limitDate).calendar() + ")"}</Text>
            </View>
        )
    }

    updateAndCommitSchedule = (newDate) => {
        this.updateScheduledTime(newDate);

        //A promise would be better but I don't understand what is going on (redux state is not changed if you call the function immediately)
        setTimeout(this.commitScheduleToDB, 500)

    }

    updateScheduledTime = (newDate) => {

        if (newDate){
            newDate = moment(newDate, this.datePickerFormat ).toDate()
        }

        this.props.setCurrentMatch({ scheduled: {...this.props.match.scheduled, time: newDate} }, {merge: true})

        this.setState({pendingUpdate: true})
    }

    addToCalendar = () => {

        let match = this.props.match
        let scheduled = match.scheduled && match.scheduled.time

        let notes = scheduled ? match.playersIDs.map( uid => match.context.competition.renderName(this.props.relevantUsers[uid].names)).join(" - ") : ""
        let title =  scheduled ? match.context.competition.name : match.context.competition.name + " ("+ translate("vocabulary.limit") + ")"
        let startDate = scheduled ? match.scheduled.time : match.due
        let endDate = scheduled ? moment(startDate).add(30, "m").toDate() : moment(startDate).add(1, "s").toDate()
        let alarms = scheduled ? [{relativeOffset: -60}] : [{relativeOffset: -60*24*3}]

        addEventToCalendar({
            title,
            notes: notes,
            location: match.context.competition.getSetting("location"),
            startDate,
            endDate,
            timeZone: Localization.timezone,
        },{
            alarms
        }).then(() => {
            Toast.show({
                text: translate("info.added to calendar") ,
                type: "success",
                duration: 2000
            })
        }).catch((err) => {
            Toast.show({
            text: translate("errors.failed to add to calendar") + "\nError: " + err ,
            type: "danger",
            duration: 4000})
        })
    }

    commitScheduleToDB = () => this.props.updateDBMatchParams(["scheduled"], () => this.setState({pendingUpdate: false}) )

    render() {

        let cardProps = {
            titleIcon: "calendar",
            title: !this.props.match.context.pending ? translate("cardTitles.match date") : translate("cardTitles.match schedule"),
            actionIcon: this.props.match.scheduled && this.props.match.scheduled.time ? "backspace" : null,
            actionIconStyles: {color: "darkred"},
            onHeaderPress: this.props.match.scheduled && this.props.match.scheduled.time ? () => this.updateAndCommitSchedule(null) : null,
            contentContainerStyles: {justifyContent:"center", alignItems: "center"},
            cardContainerStyles: this.props.style
        }

        if ( !this.props.match.context.pending) {

            return (
                <Card {...cardProps}>
                    <Text style={{textAlign: "center", fontFamily: "bold", fontSize: totalSize(2) }}>{[translate("vocabulary.played"), moment(this.props.match.playedOn).fromNow()].join(" ")}</Text>
                    <Text note style={{textAlign: "center"}}>{"(" + moment(this.props.match.playedOn).calendar() + ")"}</Text>
                </Card>
            )

        } else {

            let timeLimit = this.props.match.due ? (

                <this.DateLimit 
                        limitDate={this.props.match.due}
                        textStyles={{textAlign: "center", ...styles.dateLimit}}/>
                
            ) : (
                <View style={{paddingTop:10}}>
                    <Text style={{textAlign: "center"}}>{translate("info.no date limit to play match")}</Text>
                </View>
            )

            return (
                <Card
                    {...cardProps}>
                    <InputField
                        type="datetime"
                        minimumDate={new Date()}
                        maximumDate={this.props.match.due}
                        value={this.props.match.scheduled && this.props.match.scheduled.time ? this.props.match.scheduled.time : null}
                        onValueChange={(date) => this.updateAndCommitSchedule(date)}
                        containerStyle={{flexDirection: "row", padding: 30, justifyContent: "center", alignItems: "center"}}
                        />
                    {timeLimit}
                    <TouchableOpacity onPress={this.addToCalendar} style={styles.addCalendarButton}>
                        <Text style={{paddingRight: 20, color: "indigo",textDecorationLine: 'underline'}}>{translate("actions.add to your calendar")}</Text>
                    </TouchableOpacity>
                </Card>
            )

        }

    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    relevantUsers: state.relevantUsers
})

const mapDispatchToProps = { 
    setCurrentMatch
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeInfo);

const styles = StyleSheet.create({

    dateLimit: {
        fontFamily: "bold",
        paddingLeft: 10,
        fontSize: totalSize(2)
    },

    addCalendarButton: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    }
})
