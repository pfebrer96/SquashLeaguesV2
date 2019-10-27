import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, BackHandler, Alert} from 'react-native';
import Firebase from "../api/Firebase";

import { translate } from '../assets/translations/translationManager';
import { w, totalSize, h } from '../api/Dimensions';

import { USERSETTINGS } from "../constants/Settings"
import { connect } from 'react-redux'
import { List, ListItem, Body, Right, Icon, Text, Button} from 'native-base';
import { ColorPicker , fromHsv} from 'react-native-color-picker'

import HeaderIcon from "../components/header/HeaderIcon"
import NumericInput from "../components/settings/NumericInput"

import { withNavigationFocus } from 'react-navigation';

import {deepClone} from "../assets/utils/utilFuncs"
 
const Picker = (props) => (
    <View style={{flex: 1, paddingHorizontal: 50, paddingVertical: 80}}>
        <ColorPicker
            oldColor={props.currentValue}
            onColorChange={props.onColorChange}
            style={{flex: 1, paddingHorizontal: 50, paddingVertical: 80}}
        />
        <View>
            <Text></Text>
        </View>

    </View>
)


class SettingsScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state ={
            modalComponent: undefined,
            settings: deepClone(this.props.currentUser.settings)
        }

        //Auxiliary variable to store future changes in settings
        this.temp = null

    }

    static navigationOptions = ({navigation}) => {
        return {
            title: translate("tabs.settings"),
            headerLeft: <HeaderIcon name="arrow-back" onPress={navigation.getParam("goBack")}/>,
            headerRight: <View style={{flexDirection: "row"}}>
                            <HeaderIcon name="refresh" onPress={navigation.getParam("restoreDefaults")}/>
                            <HeaderIcon name="checkmark" onPress={navigation.getParam("submitSettings")}/>
                        </View>
        }
    };

    componentDidUpdate(prevProps) {

        //When the screen is focused change the state
        if ( this.props.isFocused && !prevProps.isFocused ) {
          this.setState({settings: deepClone(this.props.currentUser.settings)})
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({submitSettings: this.submitSettings, goBack: this.goBack, restoreDefaults: this.restoreDefaults})

        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.goBack );
    }

    componentWillUnmount() {
        this.backHandler.remove()
    }

    restoreDefaults = () => {

        reallyRestore = () => {
            Firebase.restoreDefaultUserSettings(this.props.currentUser.id, () => {
                this.setState({
                    settings: deepClone(this.props.currentUser.settings)
                })
            })
        }

        // Works on both iOS and Android
        Alert.alert(
            translate("vocabulary.attention"),
            translate("settings.you are about to restore default settings"),
            [
            {
                text: translate('vocabulary.cancel'),
                style: 'cancel',
            },
            {text: translate('vocabulary.OK'), onPress: reallyRestore},
            ],
            {cancelable: true},
        );
    }

    updateStateSettings = (type, key, newValue) => {

        let newSettings = deepClone(this.state.settings)

        newSettings[type][key] = newValue

        this.setState({
            modalComponent: undefined,
            settings: newSettings
        })
    }

    updateUserSettings = (newSettings, uid, callback) => {

        Firebase.userRef(uid).update({settings: newSettings}).then(() => {
            if (callback) {callback()}
        })
        .catch((err) => alert(err))
    }

    goBack = () => {

        if(this.state.modalComponent){

            this.setState({modalComponent: undefined})

            return true

        } else {

            //this.setState({settings: deepClone(this.props.currentUser.settings)})
            this.props.navigation.goBack()

            return true
            
        }
    }

    submitSettings = () => {

        if(this.state.modalComponent){

            if (this.temp){

                this.updateStateSettings(this.temp.settingType, this.temp.settingKey, this.temp.value)

                this.temp = null
            } else {

                this.goBack()
            }
            
        } else {

            Firebase.updateUserSettings(this.props.currentUser.id, this.state.settings, this.props.navigation.goBack)

        }

    }

    renderSettingFields = (settings, values, settingsType) => {

        return Object.keys(settings).map( key => {
            
            let setting = settings[key]

            let rightContent = this.getRightContent(setting.control, values[key], settingsType, key)

            return (
                <ListItem key={key}>
                    <Body>
                        <Text>{translate(setting.name)}</Text>
                        <Text note>{translate(setting.description)}</Text>
                    </Body>
                    <Right style={styles.rightView}>
                        {rightContent}
                    </Right>
                </ListItem>
            )
        })
    }

    getRightContent = (settingControl, currentValue, settingType, settingKey) => {

        if (settingControl.type == "colorWheel") {

            return <TouchableOpacity 
                        style={{width: 30, height: 30, backgroundColor: currentValue, elevation: 5}} 
                        onPress={() => this.setState( 
                            {
                                modalComponent: Picker({
                                    currentValue,
                                    onColorChange: (color) => {this.temp = {value: fromHsv(color), settingType, settingKey}}
                                }),
                                headerTitle: translate("settings."+ settingKey)
                            })}>
                    </TouchableOpacity>

        } else {

            return <NumericInput 
                    control={settingControl} 
                    value={currentValue} 
                    onValueChange={(value) => this.updateStateSettings(settingType, settingKey, value)}/>
        }
    }

    renderSettings = (settingsObject, currentValues) => {

        let list = []

        Object.keys(settingsObject).forEach( settingsType => {

            list.push(
                <ListItem key={settingsType} itemDivider>
                    <Text>{translate("settings." + settingsType)}</Text>
                </ListItem>
            )

            this.renderSettingFields(settingsObject[settingsType], currentValues[settingsType], settingsType).forEach(
                listitem => list.push( listitem )
            )
            
        })

        return list
        
    }

    settingControlModal = (component, headerTitle) => {

        

        if (component) {

            return <View style={{...StyleSheet.absoluteFill, backgroundColor: "white"}}>
                    {component}
                </View>

        } else {
            
            return null
        }

        
    }

    render() {

        return (
            <View style={styles.container}>
                <ScrollView style={styles.scrollView} contentContainerStyle={{justifyContent: "center",alignItems: "center"}}>
                    <List style={styles.settingsList}>
                        {this.renderSettings(USERSETTINGS, this.state.settings)}
                    </List>
                    <TouchableOpacity 
                        onPress={Firebase.signOut} 
                        transparent 
                        style={styles.signOutButton}>
                        <Text style={styles.signOutText}> {translate("auth.sign out")}</Text>
                    </TouchableOpacity>
                </ScrollView>
                {this.settingControlModal(this.state.modalComponent, this.state.headerTitle)}
            </View>
            
        );
    }

    /*Option to change password if log in by mail:
    <TouchableOpacity 
        onPress={Firebase.signOut} 
        transparent 
        style={styles.signOutButton}>
        <Text style={styles.signOutText}> {translate("auth.change password")}</Text>
    </TouchableOpacity> */
}

const mapStateToProps = state => ({
    currentUser: state.currentUser
})

export default connect(mapStateToProps)(withNavigationFocus(SettingsScreen));

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",  
    },

    scrollView: {
        flex: 1,
    },

    settingsList: {
        width: w(100),
    },

    rightView: {
        flexDirection: "row",
        justifyContent: "flex-end"
    },

    signOutButton: {
        paddingVertical: 20
    },

    /*signOutButton: {
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
        width: w(60),
        height: h(6),
        borderRadius: h(3),
        marginTop: 20,
        elevation: 5
    },*/

    signOutText: {
        color: "darkred",
        fontSize: totalSize(1.7),
        fontFamily: "bold"
    },
});