import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, ZodTypeAny, z } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const notFound = (what = 'Dữ liệu') => new HttpError(404, `${what} không tồn tại`);

export const wrap = (fn: (req: Request, res: Response) => Promise<any>): RequestHandler =>
  (req, res, next) => fn(req, res).catch(next);

export const parse = <S extends ZodTypeAny>(schema: S, data: unknown): z.infer<S> => schema.parse(data);

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) return res.status(err.status).json({ message: err.message });
  if (err instanceof ZodError)
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })) });
  if (err?.code === '23505') return res.status(409).json({ message: 'Dữ liệu bị trùng (đã tồn tại)' });
  if (err?.code === '23503') return res.status(409).json({ message: 'Dữ liệu đang được sử dụng ở nơi khác, không thể xóa' });
  if (err?.code === '23514') return res.status(400).json({ message: 'Dữ liệu vi phạm ràng buộc (ví dụ giờ bắt đầu phải nhỏ hơn giờ kết thúc)' });
  if (err?.code === '22P02') return res.status(400).json({ message: 'Định dạng id không hợp lệ' });
  console.error(err);
  res.status(500).json({ message: 'Lỗi máy chủ' });
}
