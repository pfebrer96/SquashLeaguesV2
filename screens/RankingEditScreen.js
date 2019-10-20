import React, { Component } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  Image,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import SortableList from 'react-native-sortable-list';
import { Button, Icon } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { translate } from '../assets/translations/translationManager';
import { w } from '../api/Dimensions';
import Settings from '../constants/Settings';

const window = Dimensions.get('window');


export default class RankingEditScreen extends Component {

    constructor(props){
        super(props)

        this.state = {
            deleteMode: false,
            ranking: ["Josep", "Ramón", "Gilbert", "Amadeu", "Francesc", "Josep", "Ramón", "Gilbert", "Amadeu", "Francesc"]
        }

    }

    updateRankingOrder = (keys) => {
        this.setState({ranking: keys.map( key => this.state.ranking[key])})

    }

    deleteItem = (key, marginHorizontal) => {

        Animated.timing( marginHorizontal, {
            toValue: w(100),
        } ).start(() => {
            this.setState({ranking: this.state.ranking.filter((_,i) => i !== key) })
        })
        
    }

    render() {
        return (
        <View style={styles.container}>
            <Text style={styles.title}>{translate("tabs.ranking")}</Text>
            <SortableList
            style={styles.list}
            contentContainerStyle={styles.contentContainer}
            onReleaseRow={(key, newOrder) => this.updateRankingOrder(newOrder)}
            onPressRow={(key) => this.setState({deleteMode: !this.state.deleteMode})}
            data={this.state.ranking}
            renderRow={this._renderRow} />
        </View>
    );
  }

  _renderRow = ({data, active, index}) => {
    return <Row 
            data={data} 
            active={active} 
            index={index}
            deletable={this.state.deleteMode}
            deleteItem={this.deleteItem}/>
  }
}

class Row extends Component {

  constructor(props) {
    super(props);

    this._active = new Animated.Value(0);
    this._marginHorizontal = new Animated.Value(0);

    this._style = {
      ...Platform.select({
        ios: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            }),
          }],
          shadowRadius: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10],
          }),
        },

        android: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.07],
            }),
          }],
          elevation: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      }),

    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this._active, {
        duration: 300,
        easing: Easing.bounce,
        toValue: Number(nextProps.active),
      }).start();
    }
  }

  renderDeleteButton = (deletable, index) => {
      return deletable ? <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={() => {this.props.deleteItem(index, this._marginHorizontal)}}>
                            <Icon name="close" style={styles.deleteIcon}/>
                        </TouchableOpacity> : null;
  }

  render() {
   const {data, index} = this.props;

    return (
      <Animated.View style={{
        ...styles.row,
        ...this._style,
        backgroundColor: Math.floor(index/Settings.groupSize) % 2 == 0 ? "#ccc" : "white",
        marginHorizontal: this._marginHorizontal
        }}>
        <View style={styles.rankView}>
            <Text style={styles.rank}>{index+1}</Text>
        </View>
        <View style={styles.playerNameView}> 
            <Text style={styles.playerName}>{data}</Text>
        </View>
        {this.renderDeleteButton(this.props.deletable, index)}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',

    ...Platform.select({
      ios: {
        paddingTop: 20,
      },
    }),
  },

  title: {
    fontSize: 20,
    paddingVertical: 20,
    color: '#999999',
  },

  list: {
    flex: 1,
  },

  contentContainer: {
    width: window.width,

    ...Platform.select({
      ios: {
        paddingHorizontal: 30,
      },

      android: {
        paddingHorizontal: 0,
      }
    })
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    flex: 1,
    marginTop: 7,
    marginBottom: 12,
    borderRadius: 4,


    ...Platform.select({
      ios: {
        width: window.width,
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOpacity: 1,
        shadowOffset: {height: 2, width: 2},
        shadowRadius: 2,
      },

      android: {
        width: window.width,
        elevation: 0,
      },
    })
  },

  rankView: {
    width: 40,
  },

  rank: {
    fontFamily: "bold",
    color: '#222222',
  },

  playerNameView: {
    flex:1,
  },

  playerName: {
    fontSize: 14,
    color: '#222222',
  },

  deleteButton: {
    paddingHorizontal: 5
  },

  deleteIcon: {
    color: "darkred"
  }
});