import axios from 'axios';

//
// Original   baseURL: 'http://localhost:3333',
//
const api = axios.create({
  baseURL: 'http://10.0.2.2:3333',
});

export default api;
