import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.0.105:4000", // for Android Emulator
  // If testing on physical device, replace with your machine IP, e.g., http://192.168.1.100:4000
});

export default API;
