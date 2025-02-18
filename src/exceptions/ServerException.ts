import httpStatus from 'http-status';

export class ServerException extends Error {
  status: number;

  constructor() {
    super('Server error');
    this.status = httpStatus.INTERNAL_SERVER_ERROR;
    Object.setPrototypeOf(this, ServerException.prototype);
  }
}
