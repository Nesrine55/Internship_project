import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileExt = extname(file.originalname);
    const key = `${folder}/${uuidv4()}${fileExt}`;

    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype,
    };

    const result = await this.s3.upload(params).promise();
    return result.Location; // Lien public de l'image
  }
}
