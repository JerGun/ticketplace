export const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://ticketplace.me"
    : "http://localhost:9000";
