export const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://ticketplace-server.herokuapp.com"
    : "http://localhost:9000";
