interface Response {
  statusCode: number;
  body: string;
}

export default function message(
  code: number,
  message: string,
  data?: object
): Response {
  return {
    statusCode: code,
    body: JSON.stringify(
      {
        message: message,
        data,
      },
      null,
      2
    ),
  };
}
