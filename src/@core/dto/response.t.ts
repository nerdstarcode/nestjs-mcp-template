import { Logger } from "@nestjs/common";
import { Response } from "express";
const logger = new Logger('Response Tratative');
export interface ResponseSuccesDto<T> {
  status: number;
  success: true;
  data: {
    data: T;
    meta?: T
  };
}

export interface ResponseErrorDto<T> {
  status: number;
  success: false;
  message: {
    typeError?: string;
    message: string;
    details?: T;
  };
}

export type ResponseDto<T> = ResponseSuccesDto<T> | ResponseErrorDto<T>;

export function createSuccessResponse<T>({ data, meta, status = 200 }: { data: T, meta?: T, status?: number }): ResponseSuccesDto<T> {
  return {
    status,
    success: true,
    data: {
      data,
      meta,
    },
  };
}

export function createErrorResponse<T>({ message, typeError, details, status = 500 }: { message: string, typeError?: string, details?: T, status?: number }): ResponseErrorDto<T> {
  return {
    status,
    success: false,
    message: {
      typeError,
      message,
      details,
    },
  };
}

export function tratativeResponse<T>(res: Response, response: ResponseSuccesDto<T> | ResponseErrorDto<T>): Response<T> {
  if (response.success) {
    try {
      return res.status(response.status).json(response?.data);
    } catch (error) {
      logger.error('Error tratative success Response:', error);
      return res.status(500).json(createErrorResponse({ message: 'Internal Server Error', typeError: 'ResponseTratativeError', details: error }));
    }
  }
  try {
    return res.status(response?.status).json(response.message);
  } catch (error) {
    logger.error('Error tratative error Response:', error);
    return res.status(500).json(createErrorResponse({ message: 'Internal Server Error', typeError: 'ResponseTratativeError', details: error }));
  }
}