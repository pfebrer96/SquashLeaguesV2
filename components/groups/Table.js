import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import { getTotals, iLeaderLoser } from "../../assets/utils/utilFuncs"
import { translate } from '../../assets/translations/translationManager';
import { w } from '../../api/Dimensions';

export default class Table extends Component {

    renderScoreCells = (scores, iRow, rowTextStyles) => {

        
        return scores.map((score, i) => {

            if (i == iRow) {

                return (
                    <View
                        key={i}
                        style={{...styles.tableCell, ...styles.samePlayerCell}} >
                        <Text style={rowTextStyles}></Text>
                    </View>
                )

            } else {

                return (
                    <TouchableOpacity
                        key={i}
                        style={{...styles.tableCell, ...styles.pointsCell}} 
                        onPress={() => {this.props.goToMatchOverview(toSendOnPress)}}>
                        <Text style={rowTextStyles}>{score}</Text>
                    </TouchableOpacity>
                )

            }
            
        });
    }

    renderTable = (groupResults) => {

        const totals = groupResults.map(({total}) => total)
        let [iLeader, iLoser] = iLeaderLoser(totals)
        let rowStyles, rowTextStyles;

        return groupResults.map( (resultsRow, iRow) => {

            if (iRow == iLoser){
                rowStyles = {...styles.tableRow, ...styles.lastPlayerRow}
                rowTextStyles = {...styles.tableText, ...styles.lastPlayerRowText}
            } else if (iRow == iLeader) {
                rowStyles = {...styles.tableRow, ...styles.leaderRow}
                rowTextStyles = {...styles.tableText, ...styles.leaderRowText}
            } else {
                rowStyles = {...styles.tableRow}
                rowTextStyles = {...styles.tableText}
            }

            return (
                <View key={iRow} style={rowStyles}>
                    <View style={{...styles.tableCell, ...styles.positionCell}}>
                        <Text style={rowTextStyles}>{resultsRow.rank}</Text>
                    </View>
                    <TouchableOpacity 
                        style={{...styles.tableCell, ...styles.playerCell}} 
                        onPress={() => this.props.goToUserProfile(resultsRow.playerID)}>
                        <Text style={rowTextStyles}>{resultsRow.name}</Text>
                    </TouchableOpacity>
                    {this.renderScoreCells(resultsRow.scores, iRow, rowTextStyles)}
                    <View style={{...styles.tableCell, ...styles.totalCell}}>
                        <Text style={rowTextStyles}>{resultsRow.total}</Text>
                    </View>
                </View>
            )

        })
        //Totals
        /*let totals = getTotals(groupResults, nGroup);;
        let leaderLoser = iLeaderLoser(totals) ;

        
        for (let i = 0; i <= nGroup; i++) {
            let rowContent = [];
            let addRowStyles = null;
            let addStatusStyles = null;
            //Determinem si és la fila del que va primer o últim
            if (totals && leaderLoser[0] == i - 1) {
                addStatusStyles = styles.leaderRowText
                addRowStyles = styles.leaderRow
            } else if (totals && leaderLoser[1] == i - 1) {
                addStatusStyles = styles.lastPlayerRowText
                addRowStyles = styles.lastPlayerRow
            }
            for (let j = 0; j < nGroup + 3; j++) {
                let addStyles = "";
                let addTextStyle = null;
                let content = "";
                let typeOfCell = "";
                let matchPlayers = [];
                let toSendOnPress = {};
                let resultsPositions;
                if (j == 0) { // Columna de les posicions
                    addStyles = styles.positionCell;
                    if (i > 0) {
                        content = group[i - 1][0];
                        typeOfCell = "positionCell"
                    }
                } else if (j == 1) { //Columna dels noms
                    addStyles = styles.playerCell;
                    if (i > 0) {
                        content = group[i - 1][1];
                        typeOfCell = "playerNameCell"
                        toSendOnPress = {content, typeOfCell, iGroup}
                    } else {
                        content = translate("auth.name")
                    }
                } else if (j > 1 && j < nGroup + 2) { //Columnes de les puntuacions

                    if (i - 1 != j - 2) {
                        addStyles = styles.pointsCell;
                        typeOfCell = "pointsCell";
                        addTextStyle = styles.pointsText;
                        matchPlayers = [group[i - 1], group[j - 2]];
                        resultsPositions = [nGroup * (i - 1) + j - 2, nGroup * (j - 2) + i - 1] //Posició de la cel·la i de la complementaria

                    } else {
                        addStyles = styles.samePlayerCell;
                    }
                    //Puntuació que va a la casella
                    if (i == 0) {
                        content = group[j - 2][0]
                        typeOfCell = "";
                        addTextStyle = null;
                    } else if (groupResults && groupResults[nGroup * (i - 1) + j - 2]) {
                        content = groupResults[nGroup * (i - 1) + j - 2];
                    }
                    toSendOnPress = {content, typeOfCell, matchPlayers, iGroup, resultsPositions};
                } else if (j == nGroup + 2) {
                    addStyles = styles.totalCell;
                    if (i == 0) {
                        content = translate("vocabulary.total")
                    } else {
                        content = totals[i - 1] || ""
                    }
                }
                // Afegim una view o touchableOpacity depenent del tipus de cel·la
                if (typeOfCell == "playerNameCell" || typeOfCell == "pointsCell") {
                    rowContent.push(
                        <TouchableOpacity key={String(iGroup) + String(i) + String(j)}
                                          style={[styles.tableCell, addStyles]} onPress={() => {
                            this.props.handlePress(toSendOnPress)
                        }}>
                            <Text style={[styles.tableText, addTextStyle, addStatusStyles]}>{content}</Text>
                        </TouchableOpacity>
                    );
                } else {
                    rowContent.push(
                        <View key={String(iGroup) + String(i) + String(j)} style={[styles.tableCell, addStyles]}>
                            <Text style={[styles.tableText, addStatusStyles]}>{content}</Text>
                        </View>
                    );
                }
            }
            if (i == 0) {
                addRowStyles = styles.headerRow
            }

            table.push(<View key={"Row" + String(i)} style={[styles.tableRow, addRowStyles]}>{rowContent}</View>);
        }
        return table;*/
    }

    render() {
        const {iGroup, groupResults} = this.props

        const ranks = groupResults.map(resultsRow => resultsRow.rank)

        return (
            <View style={styles.groupContainer}>
                <View style={styles.tableTitle}>
                    <Text style={styles.tableTitleText}> {(translate("vocabulary.group") + " " + iGroup).toUpperCase()}</Text>
                </View>
                <View style={styles.tableContainer}>
                    <Header ranks={ranks}/>
                    {this.renderTable(groupResults)}
                </View>
            </View>
        )
        
            
    }
}

class Header extends Component {

    renderRankCells = (ranks) => {

        return ranks.map((rank, i) => {

            return <View
                        key={i}
                        style={{...styles.tableCell, ...styles.pointsCell}} >
                        <Text style={[styles.tableText]}>{rank}</Text>
                    </View>
        });

    }

    render(){

        return <View style={{...styles.tableRow}}>
                    <View style={{...styles.tableCell, ...styles.positionCell}}>
                        <Text style={{...styles.tableText}}></Text>
                    </View>
                    <TouchableOpacity 
                        style={{...styles.tableCell, ...styles.playerCell}} 
                        onPress={() => {this.props.handlePress(toSendOnPress)}}>
                        <Text style={{...styles.tableText}}>{translate("auth.name")}</Text>
                    </TouchableOpacity>
                    {this.renderRankCells(this.props.ranks)}
                    <View style={{...styles.tableCell, ...styles.totalCell}}>
                        <Text style={{...styles.tableText}}>{translate("vocabulary.total")}</Text>
                    </View>
                </View>
    }
}

const styles = StyleSheet.create({

    groupContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50,
        flex:1,
    },

    tableContainer: {
        borderRadius: 5,
        borderColor: "black",
        borderWidth: 1,
        overflow: "hidden",
        flex:1,
        width: w(90)
    },

    tableTitle: {
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 10
    },
    tableTitleText: {
        color: "black",
        fontSize: 25
    },
    tableRow: {
        alignSelf: "stretch",
        flexDirection: 'row',
        height: 30,
        flex: 1,
    },
    headerRow: {
        height: 25
    },

    leaderRow: {
        backgroundColor: "#c6e17b",
    },

    leaderRowText: {
        fontFamily: "bold",
        color: "#2d652b"
    },

    lastPlayerRow: {
        backgroundColor: "#e1947b"
    },

    lastPlayerRowText: {
        fontFamily: "bold",
        color: "darkred"
    },
    tableCell: {
        alignSelf: 'stretch',
        justifyContent: "center",
        alignItems: "center",
        borderColor: "black",
        borderWidth: 1
    },
    tableText: {
        color: "black"
    },
    positionCell: {
        flex: 1.5,
    },
    playerCell: {
        flex: 10,
    },
    pointsCell: {
        flex: 2,
    },
    pointsText: {
        fontFamily: "bold",
        fontSize: 17,
    },
    samePlayerCell: {
        flex: 2,
        backgroundColor: "lightgray"
    },
    totalCell: {
        flex: 3,
    },
});