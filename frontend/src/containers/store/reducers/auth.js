import * as actionTypes from '../actions/actionTypes';

const initialState = {
    token: null,
    userId: null,
    cover: null,
    name: null,
    userRole: null,
    authCompToggle: false,
    error: null,
    loading: false
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_COVER:
            return {
                ...state,
                cover: action.cover
            }
        case actionTypes.AUTH_COMP_TOGGLE:
            return {
                ...state,
                loading: false,
                error: false,
                authCompToggle: !state.authCompToggle
            }
        case actionTypes.AUTH_START:
            return {
                ...state,
                error: null,
                loading: true
            }
        case actionTypes.AUTH_SUCCESS:
            return {
                ...state,
                loading: false,
                token: action.token,
                userId: action.userId,
                cover: action.cover,
                name: action.name,
                userRole: 'Seller',
                error: null
            }
        case actionTypes.AUTH_FAIL:
            return {
                ...state,
                error: action.err,
                loading: false
            }
        case actionTypes.AUTH_LOGOUT:
            return {
                ...state,
                token: null,
                userId: null,
                cover: null,
                name: null,
                userRole: null
            }
        case actionTypes.SWITCH_ROLE:
            const newRole = state.userRole === 'Seller' ? 'Buyer' : 'Seller';
            localStorage.setItem('userRole', newRole);
            return {
                ...state,
                userRole: newRole
            }
        default:
            return state;
    }
}

export default reducer;