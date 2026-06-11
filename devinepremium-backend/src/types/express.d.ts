declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        email: string;
        role: string;
        fullName: string;
      };
      staffUser?: {
        id: string;
        fullName: string;
        email: string | null;
      };
    }
  }
}

export {};
