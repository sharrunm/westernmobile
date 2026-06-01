import axios from 'axios';

const api = axios.create({
    baseURL: 'https://westernmobile.onrender.com/api',
});

export default api;