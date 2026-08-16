import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    ownerId: string,
    file: {
      filename: string;
      originalname: string;
      mimetype: string;
      size: number;
    },
  ) {
    return this.prisma.commentAttachment.create({
      data: {
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
        ownerId,
      },
    });
  }

  linkToComment(ids: string[], commentId: string) {
    return this.prisma.commentAttachment.updateMany({
      where: { id: { in: ids }, commentId: null },
      data: { commentId },
    });
  }
}
