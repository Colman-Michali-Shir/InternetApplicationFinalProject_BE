import { Router, Request, Response } from 'express';
import status from 'http-status';
import multer from 'multer';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: The Files API
 */

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

/**
 * @swagger
 * /files:
 *   post:
 *     summary: Upload a single file
 *     description: Uploads a file and returns its URL.
 *     tags:
 *       - Files
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "http://yourdomain.com/file.jpg"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  upload.single('file'),
  (req: Request & { file?: Express.Multer.File }, res: Response) => {
    if (req.file) res.status(status.OK).send({ url: base + req.file?.path });
  }
);
export default router;
