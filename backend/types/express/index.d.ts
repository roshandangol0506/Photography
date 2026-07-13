declare namespace Express {
  export interface Request {
    user?: {
      id?: string;
      role?: string;
      organization_id?: string;
    };
  }
}
