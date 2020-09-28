interface Response {
  statusCode: number;
  body: string;
  headers: object;
}

export default function message(
  code: number,
  message: string,
  data?: object
): Response {
  return {
    statusCode: code,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    },
    body: JSON.stringify({ message: message, data }),
  };
}
