import initAuth from "./components/auth.js";
// import weather from "./components/weather.js";
// import forecast from "./components/forecast.js";
import generateFooter from "./components/_footer.js";

document.addEventListener("DOMContentLoaded", () => {
  initAuth();
  // weather();
  // forecast();
  generateFooter();
});
