// errors/ApiError.ts
export class APIError extends Error {
    status: number
    errors?: string[]
  
    constructor(status: number, message: string, errors?: string[]) {
      super(message)
      this.status = status
      this.errors = errors
    }
  }