import { prisma } from '@/lib/prisma';

export const modelRepository = {
  async getActiveByUserId(userId: string) {
    return prisma.modelMetadata.findFirst({
      where: { userId, status: 'active' },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async create(data: {
    userId: string;
    datasetId?: string;
    name: string;
    modelType?: string;
    features?: string[];
    accuracy?: number;
    rmse?: number;
    mae?: number;
    cvScore?: number;
    modelPath?: string;
  }) {
    return prisma.modelMetadata.create({
      data: {
        userId: data.userId,
        datasetId: data.datasetId,
        name: data.name,
        modelType: data.modelType ?? 'xgboost',
        features: data.features ?? [],
        accuracy: data.accuracy,
        rmse: data.rmse,
        mae: data.mae,
        cvScore: data.cvScore,
        modelPath: data.modelPath,
        status: 'active',
      },
    });
  },

  async update(
    id: string,
    data: {
      status?: string;
      accuracy?: number;
      rmse?: number;
      modelPath?: string;
    }
  ) {
    return prisma.modelMetadata.update({ where: { id }, data });
  },

  async findById(id: string) {
    return prisma.modelMetadata.findUnique({ where: { id } });
  },
};
