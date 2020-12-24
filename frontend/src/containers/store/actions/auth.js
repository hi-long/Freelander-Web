import serverAxios from '../../../axios-baseURL';
import axios from 'axios';
import * as actionTypes from './actionTypes';
import onThirdPartyAuth from '../../../services/firebase';

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    }
}

export const authCompToggle = () => {
    return {
        type: actionTypes.AUTH_COMP_TOGGLE
    }
}

export const authSuccess = (token, userId, userRole, name, cover) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        token: token,
        userId: userId,
        userRole: userRole,
        name: name,
        cover: cover
    }
}

export const authFail = err => {
    return {
        type: actionTypes.AUTH_FAIL,
        err: err
    }
}

export const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('cover');
    localStorage.removeItem('name');
    return {
        type: actionTypes.AUTH_LOGOUT
    }
}

export const checkAuthTimeout = expirationTime => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, expirationTime * 1000)
    }
}

export const auth = (email, password, mode) => {
    return async dispatch => {
        try {
            dispatch(authStart())
            const authData = {
                email,
                password,
                returnSecureToken: true
            }
            const authRoute = mode === 'SIGNUP' ?
                `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBS2b-UldpJ3Efw43dOG1yCk7VbTS0LTvE`
                : `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBS2b-UldpJ3Efw43dOG1yCk7VbTS0LTvE`
            const authResult = await axios.post(authRoute, authData);
            const userId = authResult.data.localId,
                token = authResult.data.idToken,
                expiresIn = authResult.data.expiresIn;
            if (mode === 'SIGNUP') {
                const newUserData = await serverAxios.post(`/signup`, { email, password, userId });
            }
            const userData = await serverAxios.get(`/${userId}/basic`);
            const cover = userData.data[0].cover, name = userData.data[0].name;

            const expirationDate = new Date(new Date().getTime() + expiresIn * 1000)
            localStorage.setItem('userId', userId);
            localStorage.setItem('token', token);
            localStorage.setItem('expirationDate', expirationDate);
            localStorage.setItem('userRole', 'Seller');
            localStorage.setItem('name', name);
            localStorage.setItem('cover', cover);

            dispatch(authSuccess(token, userId, 'Seller', name, cover));
            dispatch(checkAuthTimeout(expiresIn));
            dispatch(authCompToggle())
        } catch (err) {
            dispatch(authFail(err))
        }
    }
}

export const thirdPartyAuth = provider => {
    return async dispatch => {
        try {
            dispatch(authStart());
            let authData = await onThirdPartyAuth(provider);
            if (authData.user.userId) {
                const signUpUserIfNeeded = await serverAxios.post(`/signup`, authData.user);
            }
            const signedInUser = await serverAxios.get(`/${authData.user.userId}/basic`);
            const expirationDate = new Date(new Date().getTime() + 3600 * 1000)
            const token = authData.token;
            let { email, name, password, cover, userId } = authData.user;
            name = signedInUser.data[0].name;
            cover = signedInUser.data[0].cover;
            // (userId, token, expirationDate, userRole, name,cover)
            setLocalStorageItems(userId, token, expirationDate, 'Seller', name, cover);
            dispatch(authSuccess(token, userId, 'Seller', name, cover));
            dispatch(checkAuthTimeout(3600));
            dispatch(authCompToggle())
        } catch (err) {
            dispatch(authFail(err))
        }
    }
}

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('token');
        if (!token) {
            dispatch(logout());
        } else {
            const expirationDate = new Date(localStorage.getItem('expirationDate'));
            if (expirationDate <= new Date()) {
                dispatch(logout())
            } else {
                const userId = localStorage.getItem('userId');
                const userRole = localStorage.getItem('userRole');
                const name = localStorage.getItem('name');
                const cover = localStorage.getItem('cover');
                dispatch(authSuccess(token, userId, userRole, name, cover));
                dispatch(checkAuthTimeout((expirationDate.getTime() - new Date().getTime()) / 1000))
            }
        }
    }
}

// USER ROLE 
export const onUserRoleSwitch = () => {
    return {
        type: actionTypes.SWITCH_ROLE
    }
}

const setLocalStorageItems = (userId, token, expirationDate, userRole, name, cover) => {
    localStorage.setItem('userId', userId);
    localStorage.setItem('token', token);
    localStorage.setItem('expirationDate', expirationDate);
    localStorage.setItem('userRole', 'Seller');
    localStorage.setItem('name', name);
    localStorage.setItem('cover', cover);
}

export const setCover = cover => {
    return {
        type: actionTypes.SET_COVER,
        cover: cover
    }
}