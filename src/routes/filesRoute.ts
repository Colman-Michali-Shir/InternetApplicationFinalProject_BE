import { Router, Request, Response } from 'express';
import status from 'http-status';
import multer from 'multer';

const router = Router();

const base = process.env.DOMAIN_BASE + '/';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'storage/');
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').filter(Boolean).slice(1).join('.');
    cb(null, Date.now() + '.' + ext);
  },
});
const upload = multer({ storage });

router.post('/', upload.single('file'), (req: Request, res: Response) =>
  res.status(status.OK).send({ url: base + req.file?.path }),
);

export default router;
