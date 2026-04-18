import { prisma } from '@/lib/prisma';

export const predictionRepository = {
  async create(data: {
    userId: string;
    datasetId?: string;
    inputData: string;
    predictedValue: number;
    confidenceScore: number;
    segment?: string;
    clvScore?: number;
    recommendations?: string;
  }) {
    return prisma.prediction.create({ data });
  },

  async findById(id: string) {
    return prisma.prediction.findUnique({ where: { id } });
  },

  async findByUserId(userId: string, limit = 20) {
    return prisma.prediction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        inputData: true,
        predictedValue: true,
        confidenceScore: true,
        segment: true,
        clvScore: true,
        createdAt: true,
      },
    });
  },

  async countByUserId(userId: string) {
    return prisma.prediction.count({ where: { userId } });
  },

  async getAverageClv(userId: string): Promise<number> {
    const result = await prisma.prediction.aggregate({
      where: { userId },
      _avg: { predictedValue: true },
    });
    return result._avg.predictedValue ?? 0;
  },

  async getSegmentCounts(userId: string) {
    return prisma.prediction.groupBy({
      by: ['segment'],
      where: { userId, segment: { not: null } },
      _count: { segment: true },
      _avg: { predictedValue: true },
    });
  },

  async findRecentByUserId(userId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return prisma.prediction.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
      select: { predictedValue: true, segment: true, createdAt: true },
    });
  },
};
