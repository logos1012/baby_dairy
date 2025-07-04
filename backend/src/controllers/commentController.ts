import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
      return;
    }

    if (!content?.trim()) {
      res.status(400).json({
        success: false,
        message: '댓글 내용을 입력해주세요.',
      });
      return;
    }

    // 게시물 존재 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, familyId: true }
    });

    if (!post) {
      res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.',
      });
      return;
    }

    // 가족 구성원 확인
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        userId,
        familyId: post.familyId,
      },
    });

    if (!familyMember) {
      res.status(403).json({
        success: false,
        message: '이 게시물에 댓글을 달 권한이 없습니다.',
      });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: comment,
      message: '댓글이 작성되었습니다.',
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: '댓글 작성 중 오류가 발생했습니다.',
    });
  }
};

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: { postId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          current: page,
          total: totalPages,
          count: comments.length,
          totalCount: total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: '댓글 조회 중 오류가 발생했습니다.',
    });
  }
};

export const updateComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
      return;
    }

    if (!content?.trim()) {
      res.status(400).json({
        success: false,
        message: '댓글 내용을 입력해주세요.',
      });
      return;
    }

    // 댓글 존재 및 권한 확인
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!comment) {
      res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없습니다.',
      });
      return;
    }

    if (comment.authorId !== userId) {
      res.status(403).json({
        success: false,
        message: '본인이 작성한 댓글만 수정할 수 있습니다.',
      });
      return;
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content: content.trim() },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedComment,
      message: '댓글이 수정되었습니다.',
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: '댓글 수정 중 오류가 발생했습니다.',
    });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
      return;
    }

    // 댓글 존재 및 권한 확인
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!comment) {
      res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없습니다.',
      });
      return;
    }

    if (comment.authorId !== userId) {
      res.status(403).json({
        success: false,
        message: '본인이 작성한 댓글만 삭제할 수 있습니다.',
      });
      return;
    }

    await prisma.comment.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: '댓글이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: '댓글 삭제 중 오류가 발생했습니다.',
    });
  }
};