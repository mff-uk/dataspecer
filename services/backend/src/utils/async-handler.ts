import express from "express";

export const asyncHandler = (fn: (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => Promise<void>) => async (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {
  try {
    await fn(request, response, next);
  } catch (error) {
    console.log(error);
    response.status(500).send({error: String(error)});
  }
};
