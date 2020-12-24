import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000'
    // baseURL: 'https://freelander-web.herokuapp.com/'
});

export default instance;