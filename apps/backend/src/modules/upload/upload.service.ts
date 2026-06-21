import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UploadService {
  private get cloudName(): string {
    return process.env.CLOUDINARY_CLOUD_NAME || '';
  }
  private get apiKey(): string {
    return process.env.CLOUDINARY_API_KEY || '';
  }
  private get uploadPreset(): string {
    return process.env.CLOUDINARY_UPLOAD_PRESET || '';
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/svg+xml',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: PNG, JPG, GIF, SVG, WEBP',
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size: 5MB');
    }

    if (!this.cloudName) {
      throw new BadRequestException('CLOUDINARY_CLOUD_NAME not configured');
    }

    if (!this.uploadPreset) {
      throw new BadRequestException('CLOUDINARY_UPLOAD_PRESET not configured');
    }

    const formData = new FormData();
    formData.append(
      'file',
      new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }),
      file.originalname,
    );
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', 'sbg-rec/badges');

    if (this.apiKey) {
      formData.append('api_key', this.apiKey);
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new BadRequestException(
        `Upload failed: ${result.error?.message || 'Unknown error'}`,
      );
    }

    return { url: result.secure_url };
  }
}
