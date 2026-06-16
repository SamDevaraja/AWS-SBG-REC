import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@ApiTags('Uploads')
@Controller('upload')
export class UploadController {
  @Post()
  @ApiOperation({ summary: 'Upload flag SVG' })
  @UseInterceptors(
    FileInterceptor('flag', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          // Resolve root uploads/flags directory robustly
          let uploadPath = join(process.cwd(), 'uploads', 'flags');
          // If cwd is apps/backend instead of workspace root
          if (process.cwd().endsWith('backend')) {
            uploadPath = join(process.cwd(), '..', '..', 'uploads', 'flags');
          }
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only SVG, PNG, JPG, and WEBP image files are allowed.'), false);
        }
      },
    }),
  )
  uploadFlag(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    // Return relative URL that will match what the frontend expects
    return { url: `/uploads/flags/${file.filename}` };
  }
}
