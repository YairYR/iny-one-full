export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string[]>;
  type: string;

  constructor(
    code: string,
    message: string,
    options: {
      type?: string;
      status?: number;
      fields?: Record<string, string[]>;
    } = {},
  ) {
    super(message);
    this.code = code;
    this.message = message;
    this.status = options.status || 400;
    this.type = options.type || 'api_error';
    this.fields = options.fields;
  }
}