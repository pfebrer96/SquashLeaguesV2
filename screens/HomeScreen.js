import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    View, 
    Text,
    Animated,
    ScrollView
} from 'react-native';

import { Icon} from 'native-base';

import Firebase from "../api/Firebase"

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentCompetition} from "../redux/actions"

import { totalSize, w, h } from '../api/Dimensions';
import { translate } from '../assets/translations/translationManager';
import Table from '../components/groups/Table';
import { USERSETTINGS } from "../constants/Settings"
import HeaderIcon from "../components/header/HeaderIcon"

class HomeScreen extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        this.props.navigation.setParams({backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor})

    }

    componentDidUpdate(prevProps){

        let currentbackCol = this.props.currentUser.settings["General appearance"].backgroundColor

        //Update the header color when the background color is updated :)
        if ( prevProps.currentUser.settings["General appearance"].backgroundColor !== currentbackCol){
            this.props.navigation.setParams({backgroundColor: currentbackCol})
        }
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerStyle: {
                elevation: 2,
                backgroundColor: navigation.getParam("backgroundColor")
              },
            headerRight: <HeaderIcon name="settings" onPress={() => {navigation.navigate("SettingsScreen")}} />
        }
    };

    renderCompetitionStates = (activeCompetitions) =>{
        return activeCompetitions.map(comp => (
            <CompetitionState
                key={comp.competitionID}
                uid={this.props.currentUser.id} 
                competition={comp}
                navigation={this.props.navigation}
                setCurrentCompetition={this.props.setCurrentCompetition}/>
        ))
    }

    render() {

        return (
            <ScrollView style={{...styles.container, backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}>
                <View style={styles.gridRow}>
                    <Notifications/>
                </View>
                <View style={styles.gridRow}>
                    <PendingMatches/>
                </View>
                {this.renderCompetitionStates(this.props.currentUser.activeCompetitions)}
            </ScrollView>
        )
    }

}

class Notifications extends Component {

    render(){

        return <Animated.View style={{...styles.gridItem, ...styles.notifications, flex: 1}}>
                    <View style={styles.itemTitleView}>
                        <Icon name="notifications" style={{...styles.titleIcon,color: "green"}}/>
                        <Text style={{...styles.titleText, color: "green", fontFamily: "bold"}}>{translate("vocabulary.notifications")}</Text>
                    </View>
                    <Text>Et reclamen com a jugador de la lliga del nick!</Text>

                </Animated.View>
    }
}

class PendingMatches extends Component {

    render(){

        return <Animated.View style={{...styles.gridItem, flex: 1}}>
                    <View style={styles.itemTitleView}>
                        <Icon name="time" style={styles.titleIcon}/>
                        <Text style={styles.titleText}>{translate("vocabulary.pending matches")}</Text>
                    </View>
                    <Text>No tens cap partit pendent. Pots relaxar-te :)</Text>
                </Animated.View>
    }
}

class CompetitionState extends Component {

    constructor(props){
        super(props)

        this.state = {
        }
    }

    componentDidMount(){

        const {competition} = this.props
        const {gymID, competitionID} = competition

        if (competition.type == "groups"){

            this.listener = Firebase.onPlayerGroupSnapshot(gymID, competitionID, this.props.uid,
                group => this.setState({compStateInfo: group})
            );

        }
        
    }

    componentWillUnmount(){
        if (this.listener){this.listener()}
    }

    renderCompetitionState = (typeOfComp, compStateInfo) => {

        if (!compStateInfo){ return null}

        if (typeOfComp == "groups"){
            return <Table
                        ranks={compStateInfo.ranks}
                        players={compStateInfo.players}
                        scores={compStateInfo.results}
                        playersIDs={compStateInfo.playersRef}
                        goToUserProfile={this.props.goToUserProfile} 
                    />
        }
    }

    goToCompetition = () => {

        //Set the current competition so that the competition screen can know what to render
        const {gymID, competitionID, name, type} = this.props.competition
        this.props.setCurrentCompetition(gymID, competitionID, name, type)

        this.props.navigation.navigate("CompetitionScreen")
    }

    render(){

        return (
            <View style={styles.gridRow}>           
                <Animated.View style={{...styles.gridItem, flex: 1}}>
                    <View style={{flex: 1}}>
                        <TouchableOpacity style={{...styles.itemTitleView}} onPress={this.goToCompetition}>
                            <Icon name="trophy" style={styles.titleIcon}/>
                            <Text style={styles.titleText}>{this.props.competition.name}</Text>
                            <View style={styles.goToCompView}>
                                <Icon name="add" style={{...styles.goToCompIcon}}/>
                            </View>
                        </TouchableOpacity>
                        {this.renderCompetitionState(this.props.competition.type, this.state.compStateInfo)}
                        <View>
                        </View>
                    </View>
                </Animated.View>
            </View>
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
})

const mapDispatchToProps = dispatch => ({
    setCurrentCompetition: (gymID, competitionID, compName, typeOfComp) => dispatch(setCurrentCompetition(gymID, competitionID, compName, typeOfComp))
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 20,
        backgroundColor: USERSETTINGS["General appearance"].backgroundColor.default
    },

    gridRow: {
        flexDirection: "row",
        marginVertical: 10
    },

    gridItem : {
        elevation: 5,
        marginHorizontal: 10,
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: "white",
        overflow: "hidden"
    },

    notifications: {
        backgroundColor: "lightgreen"
    },

    itemTitleView : {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingBottom: 20,
    },

    titleIcon: {
        paddingRight: 15,
        color: "gray"
    },

    goToCompView: {
        flex: 1,
        alignItems: "flex-end",
    },
    
    goToCompIcon: {
        color: "gray"
    },

    titleText: {
        fontSize: totalSize(1.8),
        color: "gray"
    },

});