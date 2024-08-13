import axios, { Axios } from "axios";

const API_KEY = "44701856-32524574a38bab9185a253f90";
const apiUrl = `https://pixabay.com/api/?key=${API_KEY}`;

const formatUrl = (params) => {
  let url = apiUrl + "&per_page=10&safesearch=true&editors_choice=true";
  if (!params) return url;
  let paramKey = Object.keys(params);
  paramKey.map((key) => {
    let value = key === "q" ? encodeURIComponent(params[key]) : params[key];
    url += `&${key}=${value}`;
  });
  return url;
};

export const apiCall = async (params) => {
  try {
    const response = await axios.get(formatUrl(params));
    const { data } = response;
    return { success: true, data };
  } catch (error) {
    console.log("Error in api key ", error.message);
    return { success: false, message: error.message };
  }
};
