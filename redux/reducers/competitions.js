import { UPDATE_COMPETITIONS, UPDATE_COMPETITION, SET_CURRENTCOMPETITION} from '../actions/actionTypes'
import GroupsCompetition from '../../Useful objects/competitions/groups'
import _ from 'lodash'

const competitions = (state = {}, action) => {
    switch (action.type) {
        case UPDATE_COMPETITIONS:

            let currentComp = _.find(state, 'isCurrent')

            var newState = {
                ...state,
                ...action.newCompetitions,
            }

            //Preserve the current competition
            if (currentComp && newState[currentComp.id]) {newState[currentComp.id].isCurrent = true}

            return newState
        case UPDATE_COMPETITION:

            if (state[action.id]){
                var newState = {
                    ...state,
                    [action.id]: {
                        ...state[action.id],
                        ...action.updates
                    },
                }
            } else {
                var newState = {
                    ...state,
                    [action.id]: action.updates
                }
            }

            return newState

        case SET_CURRENTCOMPETITION:

            var newState = Object.keys(state).reduce((newState, compID) => {
                newState[compID] = { ...state[compID], isCurrent: compID == action.id}
                return newState
            }, {} )

            return newState

        default:
            return state
        
    }
}

//SELECTORS
const compClasses = {
    groups: GroupsCompetition,
}

const superChargeComp = (comp) => new compClasses[comp.type](comp)

export const selectCurrentCompetition = (competitions) => {
    let currentComp = _.find(competitions, 'isCurrent')

    if(currentComp) return superChargeComp(currentComp)
    else return null
}

export const selectAdminCompetitions = (competitions) => {
    return Object.keys(competitions).reduce((superCharged, compID) => {
        if (competitions[compID].isAdmin){
            superCharged[compID] = superChargeComp(competitions[compID])
        }
        return superCharged
    }, {})
}

export const selectSuperChargedCompetitions = (competitions) => {
    return Object.keys(competitions).reduce((superCharged, compID) => {
        superCharged[compID] = superChargeComp(competitions[compID])
        return superCharged
    }, {})
}

export default competitions