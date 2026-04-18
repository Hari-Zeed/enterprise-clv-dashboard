import { NextRequest } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { modelRepository } from '@/repositories/model.repository';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getMockActiveModel } from '@/lib/mock-data';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as any).id as string;

    if (userId === 'demo-user-id' || (session.user as any).role === 'demo') {
      return successResponse(getMockActiveModel());
    }

    const activeModel = await modelRepository.getActiveByUserId(userId);
    
    if (!activeModel) {
        return successResponse({ hasActiveModel: false });
    }

    return successResponse({ 
        hasActiveModel: true,
        modelDetails: {
            version: activeModel.version,
            updatedAt: activeModel.updatedAt,
            accuracy: activeModel.accuracy,
            rmse: activeModel.rmse,
            features: activeModel.features
        }
    });

  } catch (err) {
    return errorResponse('Internal server error', 500);
  }
}
