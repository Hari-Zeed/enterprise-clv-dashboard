import { prisma } from '@/lib/prisma';

export const datasetRepository = {
  async create(data: {
    name: string;
    userId: string;
    fileName: string;
    fileSize: number;
    rowCount: number;
    columnCount: number;
    csvData: string;
    columns: string[];
    dataTypes: string[];
  }) {
    return prisma.dataset.create({
      data: {
        ...data,
      },
    });
  },

  async findById(id: string) {
    return prisma.dataset.findUnique({ where: { id } });
  },

  async findByUserId(userId: string) {
    return prisma.dataset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        fileName: true,
        fileSize: true,
        rowCount: true,
        columnCount: true,
        columns: true,
        status: true,
        errorMessage: true,
        trainR2: true,
        trainRmse: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async updateStatus(id: string, status: string, errorMessage?: string) {
    return prisma.dataset.update({
      where: { id },
      data: { status, errorMessage: errorMessage ?? null },
    });
  },

  async updateTrainingMetrics(
    id: string,
    metrics: { trainR2: number; trainRmse: number; trainMae: number }
  ) {
    return prisma.dataset.update({
      where: { id },
      data: {
        status: 'success',
        trainR2: metrics.trainR2,
        trainRmse: metrics.trainRmse,
        trainMae: metrics.trainMae,
      },
    });
  },
};
