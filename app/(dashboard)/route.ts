export function GET(req: Request) {
  // export any http method as a handler for the request
  // trying to construct the url by itself
  // you need to help it with a full path + "/dm"
  // below is a dynamic variable to work locally and in production
  const url = new URL("/dm", req.url); //retrieve the rest of the url from the host 'req.url'
  return Response.redirect(url);
}
