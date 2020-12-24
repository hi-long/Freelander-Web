import * as actionTypes from '../actions/actionTypes.js';

const initialState = {
    onAuth: false,

    onSearching: false,

    onServiceDetails: false,

    isLoading: false
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.AUTH_ON:
            return {
                ...state,
                onAuth: action.onAuth
            }
        case actionTypes.LOADING:
            return {
                ...state,
                isLoading: true
            }
        case actionTypes.LOADED:
            return {
                ...state,
                isLoading: false
            }
        case actionTypes.ON_SEARCHING:
            return {
                ...state,
                onSearching: action.value
            }
        case actionTypes.ON_SERVICES_DETAILS:
            return {
                ...state,
                onServiceDetails: !state.onServiceDetails
            }
        default:
            return state;
    }
}

export default reducer;