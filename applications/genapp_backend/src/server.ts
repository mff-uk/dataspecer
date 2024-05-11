import express from "express";
import ldkitRouter from "./ldkitRouter";

const port = 5678;
const server = express();
server.use("/generators/ldkit", ldkitRouter);

server.get("/", (_: any, res: any) => {
  res.send("<div>Home page</div>");
});

server.listen(port, () => {
  console.log(`Started server on port: ${port}`);
});
