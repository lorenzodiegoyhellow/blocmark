import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

// Middleware to validate request data against a Zod schema
export const validate = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Create a schema that includes all potential request inputs
      const fullSchema = schema.extend({
        body: schema.shape.body || schema,
        query: schema.shape.query || schema,
        params: schema.shape.params || schema,
      });

      // Validate request data against schema
      await fullSchema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      return res.status(500).json({ 
        error: 'Validation failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };