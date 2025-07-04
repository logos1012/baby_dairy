import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/database';

export const checkFamilyMembership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
      return;
    }

    // 사용자의 가족 정보 조회
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId },
      include: { family: true },
    });

    if (!familyMember) {
      res.status(403).json({
        success: false,
        message: '가족에 속하지 않은 사용자입니다.',
      });
      return;
    }

    // req 객체에 가족 정보 추가
    req.familyId = familyMember.familyId;
    req.familyRole = familyMember.role;

    next();
  } catch (error) {
    console.error('Family membership check error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

export const checkPostOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const postId = req.params.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
      return;
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, familyId: true },
    });

    if (!post) {
      res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.',
      });
      return;
    }

    // 게시물 작성자이거나 같은 가족 구성원인지 확인
    if (post.authorId !== userId) {
      const familyMember = await prisma.familyMember.findFirst({
        where: {
          userId,
          familyId: post.familyId,
        },
      });

      if (!familyMember) {
        res.status(403).json({
          success: false,
          message: '이 게시물에 접근할 권한이 없습니다.',
        });
        return;
      }

      // 수정/삭제는 작성자만 가능
      if (req.method !== 'GET') {
        res.status(403).json({
          success: false,
          message: '본인이 작성한 게시물만 수정/삭제할 수 있습니다.',
        });
        return;
      }
    }

    next();
  } catch (error) {
    console.error('Post ownership check error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};