import axios from "axios";

const AxiosApiInstance = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
});

AxiosApiInstance.interceptors.response.use(
  (response) => {
      return response;
  },
  async (error) => {
    const originalConfig = error.config;

    if (originalConfig.url !== "auth/token/" && 
            originalConfig.url !== "auth/token/refresh" &&
            error.response &&
            error.response.status === 401) {
        if (!originalConfig._retry) {
            originalConfig._retry = true;
            AxiosApiInstance.get("auth/token/refresh").then((result)=>{
                localStorage.setItem("isAuthenticated", "true");
            });
            return AxiosApiInstance(originalConfig);
        }
        else {
            localStorage.setItem("isAuthenticated", "false");
        }
    }

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
);

export default AxiosApiInstance;