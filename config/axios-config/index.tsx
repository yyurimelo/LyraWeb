import axios, { type AxiosInstance, isAxiosError } from "axios";

let http: AxiosInstance;

const createHttp = (baseURL: string) => {
  http = axios.create({ baseURL });
};

export { createHttp, http, isAxiosError };
