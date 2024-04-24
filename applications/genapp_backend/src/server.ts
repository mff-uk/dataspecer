import express from "express";
import ldkitRouter from "./ldkitRouter";

const server = express();
server.use("/generators/ldkit", ldkitRouter);

server.get("/", (_: any, res: any) => {
  res.send("<div>Home page</div>");
});

server.listen(process.env.PORT, () => {
  console.log(`Started server on port: ${process.env.PORT}`);
});
