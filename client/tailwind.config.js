module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      height: {
        18: "72px",
        69: "17.25rem",
        "1/12": "8.33%",
        "2/12": "16.67%",
        "3/12": "25%",
        "4/12": "33.33%",
        "5/12": "41.67%",
        "6/12": "50%",
        "7/12": "58.33%",
        "8/12": "66.67%",
        "9/12": "75%",
        "10/12": "83.33%",
        "10.5/12": "87.5%",
        "11/12": "91.67%",
      },
      padding: {
        18: "72px",
      },
      colors: {
        primary: "#4ED0F5",
        background: "#212428",
        input: "#353840",
        hover: "#48494F",
        "hover-light": "#5A5A5C",
        modal: "#1F2124",
        "modal-button": "#333538",
        text: "#C0C3C6",
        "sub-text": "#89919A",
        alert: "#F54E4E",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
