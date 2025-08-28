declare module 'hpp' {
  import { Request, Response, NextFunction } from 'express';
  
  interface HppOptions {
    whitelist?: string[];
    checkBody?: boolean;
    checkBodyOnlyForContentType?: string[];
    checkQuery?: boolean;
  }

  function hpp(options?: HppOptions): (req: Request, res: Response, next: NextFunction) => void;
  
  export = hpp;
}