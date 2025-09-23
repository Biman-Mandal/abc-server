import axios from "axios";

export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendSms = async (
  phoneNumber: string,
  otp: string
): Promise<boolean> => {
  try {
    const apiKey = process.env.SMS_API_KEY;
    const senderId = process.env.SMS_SENDER;
    const route = process.env.SMS_ROUTE || "2";
    const templateId = process.env.SMS_TEMPLATE_ID;
    const message = `Your verification code is ${otp}. This code is valid for 10 minutes.`;

    if (!apiKey || !senderId || !templateId) {
      console.error(
        "SMS credentials (API Key, Sender, Template ID) are not configured."
      );
      return false;
    }

    const params = {
      key: apiKey,
      route: route,
      sender: senderId,
      number: phoneNumber,
      sms: encodeURIComponent(message),
      templateid: templateId,
    };

    const response = await axios.get("https://site.ping4sms.com/api/smsapi", {
      params,
    });
    console.log(`Ping4SMS Response for ${phoneNumber}:`, response.data);

    if (typeof response.data === "number" || !isNaN(parseInt(response.data))) {
      console.log(
        `SMS submitted successfully for ${phoneNumber} with Message ID: ${response.data}`
      );
      return true;
    } else {
      console.error(
        `SMS failed for ${phoneNumber}. Error Code: ${response.data}`
      );
      return false;
    }
  } catch (error) {
    console.error(`Axios error while sending SMS to ${phoneNumber}:`, error);
    return false;
  }
};
