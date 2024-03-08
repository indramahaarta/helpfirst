import axios from "axios";

const serverAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CONTAINER_BACKEND,
});
const clientAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CONTAINER_FRONTEND,
});
export { serverAxios, clientAxios };
