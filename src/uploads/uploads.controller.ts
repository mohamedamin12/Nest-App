import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('/api/upload')
export class UploadController {
  
  //* Post ~/api/upload
  @Post()
  @UseInterceptors(
    FileInterceptor('file'),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File not provided');
    console.log(file);
    return { message: 'File uploaded successfully' };
  }

  //* Get ~/api/upload/:image
  @Get(':image')
  async getImage(@Param('image') image: string , @Res() res : Response) {
    return res.sendFile(image , {root : 'images'});
  }
}
