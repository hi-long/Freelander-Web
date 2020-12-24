import * as actionTypes from './actionTypes';

// AUTH
export const onAuth = (onAuth) => {
    return {
        type: actionTypes.AUTH_ON,
        onAuth: onAuth
    }
}

// LOADING
export const loading = () => {
    return {
        type: actionTypes.LOADING
    }
}

export const loaded = () => {
    return {
        type: actionTypes.LOADED
    }
}

// SEARCHING
export const onSearching = (value) => {
    return {
        type: actionTypes.ON_SEARCHING,
        value: value
    }
}

// SERVICE DETAILS
export const onServiceDetails = () => {
    return {
        type: actionTypes.ON_SERVICES_DETAILS
    }
}