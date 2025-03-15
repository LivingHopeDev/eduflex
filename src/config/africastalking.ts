import Africastalking from "africastalking";
const africastalking = Africastalking({
  apiKey: process.env.AT_API_KEY || "",
  username: process.env.AT_USERNAME || "",
});

module.exports = africastalking;
