declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        email: string;
        role: string;
        fullName: string;
      };
    }
  }
}

export {};
