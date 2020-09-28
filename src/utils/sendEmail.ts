import * as AWS from "aws-sdk";
import * as Mustache from "mustache";

const ses = new AWS.SES();

const URL = "https://ijj5xljd05.execute-api.eu-central-1.amazonaws.com";

export enum Templates {
  REGISTER = "REGISTER",
  VALIDATED = "VALIDATED",
  UNSUBSCRIBE = "UNSUBSCRIBE",
  CONDITION = "CONDITION",
}

const bodyText = {
  [Templates.REGISTER]:
    '<br>Please, validate you email to start watch your event from the contract <b> {{address.S}} </b> </br><br><a href="{{URL}}/dev/email/validate/{{email.S}}/{{token.S}}">Validate</a>',
  [Templates.VALIDATED]:
    '<br>Thanks for validate you email</br><br>Now we start to watch the event <b>{{event.M.name.S}}</b> each <b>{{event.M.counter.N}}</b> on <b>{{address.S}}</b></br><br><a href="{{URL}}/dev/email/unsubscribe/{{email.S}}/{{token.S}}">Unsubscribe</a>',
  [Templates.UNSUBSCRIBE]:
    "<br><b>Thank you </b>. You are successfully remove from the subscribed list.</br>",
  [Templates.CONDITION]:
    "<br>Condition YourEvent({{signature.S}}) === {{condition.N}}</br><br>triggered ons block {{BlockNumber.N}} at {{timestamp.N}}</br>",
};

const subectText = {
  [Templates.REGISTER]:
    "Validate your email to watch the event {{event.M.name.S}}",
  [Templates.VALIDATED]: "Wellcome",
  [Templates.UNSUBSCRIBE]:
    "Successfully unsubscribed from event {{event.M.name.S}}",
  [Templates.CONDITION]: "New condition triggered",
};

export const sendEmail = (type: Templates, data: any) => {
  return new Promise((resolve, reject) => {
    console.log("CONFIG:", ses.config, ses);
    var params = {
      Destination: {
        ToAddresses: [data.email.S],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: Mustache.render(bodyText[type], { ...data, URL }),
          },
        },

        Subject: {
          Data: Mustache.render(subectText[type], { ...data, URL }),
        },
      },
      Source: "noreply@refractive.xyz",
    };
    console.log("EMAIL TIPO ", params, params.Message.Body.Html.Data);
    ses.sendEmail(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      }
      // an error occurred
      console.log("RESP : ", data); // successful response
      resolve(data);
    });
  });
};
