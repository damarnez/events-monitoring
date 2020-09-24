import { Handler } from "aws-lambda";
// https://aws.amazon.com/premiumsupport/knowledge-center/lambda-send-email-ses/
export const send = (event: any) => {
  console.log(event);
};
