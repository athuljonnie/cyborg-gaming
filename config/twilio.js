
dotenv.config();


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const client = require("twilio")(accountSid, authToken);
 

const twilioFunctions = {
    generateOTP: async (number) => {
      client,
        client.verify.v2
          .services(serviceSid)
          .verifications.create({ to: `+91${number}`, channel: "sms" })
          .then((service) => console.log(service.sid));
    },
  };