import { NextFunction, Request, Response } from "express";
import log from "../utils/logger";
import config from "../config";
class HttpError extends Error {
  status_code: number;
  success: boolean = false;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.status_code = statusCode;
  }
}

class BadRequest extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}

class ResourceNotFound extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

class Unauthenticated extends HttpError {
  constructor(message: string) {
    super(401, message);
  }
}

class Unauthorised extends HttpError {
  constructor(message: string) {
    super(403, message);
  }
}

class Conflict extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}

class InvalidInput extends HttpError {
  constructor(message: string) {
    super(422, message);
  }
}

class Expired extends HttpError {
  constructor(message: string) {
    super(410, message);
  }
}

class ServerError extends HttpError {
  constructor(message: string) {
    super(500, message);
  }
}

const routeNotFound = (req: Request, res: Response, next: NextFunction) => {
  const message = `Route not found: ${req.originalUrl}`;
  res.status(404).json({ success: false, status: 404, message });
};

const errorHandler = (
  err: HttpError | any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  log.error(err);
  const success = err.success !== undefined ? err.success : false;
  const status_code = err.status_code || 500;
  const message = err.message || "An unexpected error occurred";
  const cleanedMessage = message.replace(/"/g, "");

  if (config.NODE_ENV === "development") {
    log.error("Error", err);
  }
  res.status(status_code).json({
    success,
    status_code,
    message: cleanedMessage,
  });
};

export {
  BadRequest,
  Conflict,
  errorHandler,
  Unauthorised,
  HttpError,
  InvalidInput,
  ResourceNotFound,
  routeNotFound,
  ServerError,
  Unauthenticated,
  Expired,
};
