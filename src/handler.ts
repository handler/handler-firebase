import { Request, Response } from 'firebase-functions';

export type Handler = (req: Request, res: Response) => void;
