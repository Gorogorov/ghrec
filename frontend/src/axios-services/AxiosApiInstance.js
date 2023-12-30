import axios from "axios";

export const API_URL = (process.env.REACT_APP_API_URL) ? process.env.REACT_APP_API_URL : "/api";

const AxiosApiInstance = axios.create({
    // baseURL: "http://django:8000/api",
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    })
  
    failedQueue = [];
}

AxiosApiInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalConfig = error.config;

        if (originalConfig.url !== "auth/token/" && 
                originalConfig.url !== "auth/token/refresh/" &&
                error.response &&
                error.response.status === 401) {
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({resolve, reject})
                }).then(() => {
                    localStorage.setItem("isAuthenticated", "true");
                    return AxiosApiInstance(originalConfig);
                }).catch(err => {
                    return Promise.reject(err);
                })
            }

            originalConfig._retry = true;
            isRefreshing = true;
            return new Promise(function (resolve, reject) {
                AxiosApiInstance.post("auth/token/refresh/"
                ).then(() => {
                    processQueue(null);
                    resolve(axios(originalConfig));
                 }).catch((err) => {
                    processQueue(err);
                    reject(err);
                 }).finally(() => { 
                    isRefreshing = false 
                });
            });
        }

        else {
            let errorMessage = {};
            const { request, response } = error;
            if (response) {
                const message = response.data;
                const status = response.status;
                errorMessage = { message, status };
            } 
            else if (request) {
                //request sent but no response received
                errorMessage = { message: "Server time out", status: 503 };
            }
            else {
                // Something happened in setting up the request that triggered an Error
                errorMessage = { message: "Opps! Something went wrong" };
            }

            return Promise.reject(errorMessage);
        }
    }
);

export default AxiosApiInstance;