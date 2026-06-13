import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { IApiResponse } from '@/common/interfaces/response.interface';

@Catch(PrismaClientKnownRequestError, PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: PrismaClientKnownRequestError | PrismaClientValidationError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof PrismaClientKnownRequestError) {
      this.handleKnownRequestError(exception, response);
    } else {
      this.handleValidationError(exception, response);
    }
  }

  private handleKnownRequestError(error: PrismaClientKnownRequestError, response: Response): void {
    let status = HttpStatus.BAD_REQUEST;
    let message = 'Database error';

    this.logger.warn(`Prisma error ${error.code}: ${error.message}`);

    switch (error.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const targets = (error.meta?.target as string[])?.join(', ');
        message = targets
          ? `A record with this ${targets} already exists`
          : 'A record with this value already exists';
        break;
      }
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Related record not found. Please check your input.';
        break;
      case 'P2004':
        status = HttpStatus.BAD_REQUEST;
        message = 'A database constraint violation occurred';
        break;
      case 'P2005':
        status = HttpStatus.BAD_REQUEST;
        message = 'An invalid value was provided';
        break;
      case 'P2006':
        status = HttpStatus.BAD_REQUEST;
        message = 'An invalid value was provided';
        break;
      case 'P2007':
        status = HttpStatus.BAD_REQUEST;
        message = 'Database input validation error';
        break;
      case 'P2008':
        status = HttpStatus.BAD_REQUEST;
        message = 'Failed to parse query';
        break;
      case 'P2009':
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid query arguments';
        break;
      case 'P2010':
        status = HttpStatus.BAD_REQUEST;
        message = 'Query failed';
        break;
      case 'P2011':
        status = HttpStatus.BAD_REQUEST;
        message = 'Null constraint violation';
        break;
      case 'P2012':
        status = HttpStatus.BAD_REQUEST;
        message = 'Missing required value';
        break;
      case 'P2013':
        status = HttpStatus.BAD_REQUEST;
        message = 'Missing required argument';
        break;
      case 'P2014':
        status = HttpStatus.BAD_REQUEST;
        message = 'Required relation violation';
        break;
      case 'P2015':
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;
      case 'P2016':
        status = HttpStatus.BAD_REQUEST;
        message = 'Query interpretation error';
        break;
      case 'P2017':
        status = HttpStatus.BAD_REQUEST;
        message = 'Records not connected';
        break;
      case 'P2018':
        status = HttpStatus.BAD_REQUEST;
        message = 'Required connected records not found';
        break;
      case 'P2019':
        status = HttpStatus.BAD_REQUEST;
        message = 'Input error';
        break;
      case 'P2020':
        status = HttpStatus.BAD_REQUEST;
        message = 'Value out of range for type';
        break;
      case 'P2021':
        status = HttpStatus.NOT_FOUND;
        message = 'Table does not exist';
        break;
      case 'P2022':
        status = HttpStatus.BAD_REQUEST;
        message = 'Column does not exist';
        break;
      case 'P2023':
        status = HttpStatus.BAD_REQUEST;
        message = 'Inconsistent column data';
        break;
      default:
        message = 'A database error occurred';
    }

    const errorResponse: IApiResponse = {
      success: false,
      message,
      statusCode: status,
    };

    response.status(status).json(errorResponse);
  }

  private handleValidationError(error: PrismaClientValidationError, response: Response): void {
    const status = HttpStatus.BAD_REQUEST;

    this.logger.warn(`Prisma validation error: ${error.message}`);

    const errorResponse: IApiResponse = {
      success: false,
      message: 'Invalid data provided',
      statusCode: status,
    };

    response.status(status).json(errorResponse);
  }
}
