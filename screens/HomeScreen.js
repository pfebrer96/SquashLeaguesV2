import React, {Component} from 'react';
import {
    StyleSheet,
    ScrollView,
    View
} from 'react-native';
import { Icon, Button } from 'native-base'

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentCompetition} from "../redux/actions"

import { USERSETTINGS } from "../constants/Settings"
import HeaderIcon from "../components/UX/HeaderIcon"

import PendingMatches from "../components/home/PendingMatches"
import Notifications from "../components/home/Notifications"
import Card from "../components/UX/Card"
import AdminSummary from "../components/home/AdminSummary"
import Courts from "../components/home/Courts"

import { elevation } from '../assets/utils/utilFuncs'

import Firebase from "../api/Firebase"

import _ from "lodash"
import { selectSuperChargedCompetitions } from '../redux/reducers';

class HomeScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false
        }
    }

    componentDidMount() {

        this.props.navigation.setParams({
            backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor,
            isAdmin: (this.props.currentUser.gymAdmin && this.props.currentUser.gymAdmin.length > 0) || this.props.currentUser.admin
        })

    }

    componentDidUpdate(prevProps){

        let currentbackCol = this.props.currentUser.settings["General appearance"].backgroundColor

        //Update the header color when the background color is updated :)
        if ( prevProps.currentUser.settings["General appearance"].backgroundColor !== currentbackCol){
            this.props.navigation.setParams({backgroundColor: currentbackCol})
        }

        if ( ! _.isEqual(prevProps.currentUser.gymAdmin, this.props.currentUser.gymAdmin)
            || ( prevProps.currentUser.admin != this.props.currentUser.admin) ) {

            this.props.navigation.setParams({
                isAdmin: (this.props.currentUser.gymAdmin && this.props.currentUser.gymAdmin.length > 0) || this.props.currentUser.admin
            })

        }
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerStyle: {
                ...elevation(2),
                backgroundColor: navigation.getParam("backgroundColor")
              },
            headerLeft: navigation.getParam("isAdmin", false) ? <HeaderIcon name="clipboard" onPress={() => {navigation.navigate("AdminScreen")}} /> : null,
            headerRight: <HeaderIcon name="settings" onPress={() => {navigation.navigate("SettingsScreen")}} />
        }
    };

    renderCompetitionStates = (activeCompetitions) =>{

        if (!activeCompetitions) {return null}
        return activeCompetitions.map(compID => {

            if (!this.props.competitions[compID]) return <Card loading/>
            
            return <CompetitionState
                key={compID}
                uid={this.props.currentUser.id} 
                competition={this.props.competitions[compID]}
                navigation={this.props.navigation}
                setCurrentCompetition={this.props.setCurrentCompetition}
                toggleLoading={() => {
                    this.setState({isLoading: !this.state.isLoading})
                }}/>
        })
    }

    render() {

        //return <CompetitionComponent what="main" competition={new KnockoutCompetition({})} navigation={this.props.navigation}/>

        return (
            <ScrollView 
                style={{...styles.container, backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}
                contentContainerStyle={{paddingVertical: 20}}>

                <Notifications/>

                {false ? <Courts/>: null}

                <PendingMatches navigation={this.props.navigation}/>

                <AdminSummary navigation={this.props.navigation}/>

                {this.renderCompetitionStates(this.props.currentUser.activeCompetitions)}

            </ScrollView>
        )
    }

}

class CompetitionState extends Component {

    constructor(props){
        super(props)

    }

    goToCompetition = (tab) => {

        //Set the current competition so that the competition screen can know what to render
        this.props.setCurrentCompetition(this.props.competition.id)

        this.props.navigation.navigate("CompetitionScreen", {competitionName: this.props.competition.name, tab})

    }

    goToCompChat = () => {

        this.props.setCurrentCompetition(this.props.competition.id)
        this.props.navigation.navigate("Chat")
    }

    render(){

        if (!this.props.competition) return null

        return (
            <Card
                titleIcon="trophy"
                title={this.props.competition.name}
                onHeaderPress={this.goToCompetition}
                actionIcon="add">
                    {this.props.competition.renderCompState(this.props)}
                    <View style={styles.competitionStateActions}>
                        <Icon name="chatbubbles" onPress={this.goToCompChat}/>
                        {/*<Icon name="stats" onPress={() => this.goToCompetition("stats")}/>*/}
                    </View>
            </Card>
        )

    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    competitions: selectSuperChargedCompetitions(state)
})

const mapDispatchToProps = {
    setCurrentCompetition
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingHorizontal: 10,
        backgroundColor: USERSETTINGS["General appearance"].backgroundColor.default
    },

    competitionStateActions: {
        flexDirection: "row",
        paddingTop: 20,
        justifyContent: "space-around",
        alignContent: "center"
    }

});