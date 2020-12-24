import * as firebase from 'firebase';
import 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
}

if (firebase.apps.length !== 0) {
    firebase.initializeApp({});
} else {
    firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();
const facebookProvider = new firebase.auth.FacebookAuthProvider();
const githubProvider = new firebase.auth.GithubAuthProvider()

const onThirdPartyAuth = async provider => {
    try {
        let authData;
        switch (provider) {
            case 'google':
                authData = await auth.signInWithPopup(googleProvider);
                break;
            case 'facebook':
                authData = await auth.signInWithPopup(facebookProvider);
                break;
            case 'github':
                authData = await auth.signInWithPopup(githubProvider);
                break;
            default:
                return;
        }
        return {
            token: authData.credential.accessToken,
            user: {
                email: authData.user.email,
                name: authData.user.displayName,
                password: 'a default one',
                cover: authData.user.photoURL,
                userId: authData.user.uid
            }
        }
    } catch (err) {
        console.log(err)
    }
}

export default onThirdPartyAuth;