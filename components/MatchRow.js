import React from 'react';
import {StyleSheet, ScrollView, Text, View} from 'react-native';

import {convertDate} from "../assets/utils/utilFuncs"


export default class MatchRow extends React.PureComponent {

    render() {
        const match = this.props.match;
        let bottomBorder = this.props.noBottomBorder ? null : styles.bottomBorder
        let matchDate = this.props.isTotal ? match[0] : convertDate(match[0]);
        let addWinnerStyle = [styles.winnerText, null];
        if (match[2][1] == Math.max.apply(Math, match[2])) {
            addWinnerStyle.reverse();
        }
        return (
            <View style={{flex: 1}}>
                <View style={styles.dateView}>
                    <Text style={styles.dateText}>{matchDate}</Text>
                </View>
                <View style={[styles.matchRow, bottomBorder]}>
                    <View style={styles.playerView}>
                        <Text style={[styles.text, addWinnerStyle[0]]}>{match[1][0]}</Text>
                    </View>
                    <View style={styles.resultView}>
                        <Text style={[styles.text, addWinnerStyle[0]]}>{match[2][0]}</Text>
                        <Text style={styles.text}> - </Text>
                        <Text style={[styles.text, addWinnerStyle[1]]}>{match[2][1]}</Text>
                    </View>
                    <View style={styles.playerView}>
                        <Text style={[styles.text, addWinnerStyle[1]]}>{match[1][1]}</Text>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    dateView: {
        flex: 0.5,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 5,
    },
    dateText: {
        color: "black"
    },
    matchRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 5,
    },
    bottomBorder: {
        borderBottomColor: "black",
        borderBottomWidth: 1,
    },
    playerView: {
        flex: 3,
        alignItems: "center",
        justifyContent: "center",
    },
    resultView: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        color: "black"
    },
    winnerText: {
        fontFamily: "bold"
    }
});