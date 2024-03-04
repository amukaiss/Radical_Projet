import axios from "axios";
import config from "./config.json";
const axiosClient = axios.create();
// const apiURL = config.apiServer.url;
const apiURL = config.api.url;
axiosClient.defaults.baseURL = apiURL;

axiosClient.defaults.headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// All request will wait 2 seconds before timeout
// axiosClient.defaults.timeout = 2000;

// axiosClient.defaults.withCredentials = true;

function getRequest(URL) {
  return axiosClient.get(`${URL}`).then((response) => response);
}

function postRequest(URL, payload) {
  return axiosClient.post(`${URL}`, payload);
}

function deleteRequest(URL) {
  return axiosClient.delete(`${URL}`);
}

// function patchRequest(URL, payload) {
//   return axiosClient.patch(`/${URL}`, payload).then((response) => response);
// }

export default {
  axiosClient,
  getRequest,
  postRequest,
  deleteRequest,
  apiURL,
};

/**
 * Usage Example
 * 
 * MAKE API REQUEST

 import { getRequest } from 'axiosClient';
 async function fetchUser() {
 try {
 const user = await getRequest('users');
} catch(error) {
   //Log errors
  }
}
 * INTERCEPT RESPONSE
axios.interceptors.response.use(function (response) {
    //Dispatch any action on success
    return response;
  }, function (error) {
      if(error.response.status === 401) {
       //Add Logic to 
             //1. Redirect to login page or 
             //2. Request refresh token
      }
    return Promise.reject(error);
  });

  * INTERCEPT REQUEST
axios.interceptors.request.use(function (request) {
  request.headers['Content-Type'] = 'multipart/form-data';
  return request;
}, null, { synchronous: true });


 */
