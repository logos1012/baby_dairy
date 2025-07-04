import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { MediaType } from '@prisma/client';

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, mediaUrls = [], tags = [] } = req.body;
    const userId = req.user?.id;
    const familyId = req.familyId;

    if (!userId || !familyId) {
      res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
      return;
    }

    // 미디어 타입 결정
    let mediaType: MediaType | null = null;
    if (mediaUrls.length > 0) {
      // 첫 번째 미디어 URL을 기준으로 타입 결정 (실제로는 더 정교한 로직 필요)
      const firstUrl = mediaUrls[0];
      if (firstUrl.includes('image') || firstUrl.includes('jpg') || firstUrl.includes('png')) {
        mediaType = MediaType.IMAGE;
      } else if (firstUrl.includes('video') || firstUrl.includes('mp4')) {
        mediaType = MediaType.VIDEO;
      }
    }

    const post = await prisma.post.create({
      data: {
        content,
        mediaUrls: JSON.stringify(mediaUrls),
        mediaType,
        tags: JSON.stringify(tags),
        authorId: userId,
        familyId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
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
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: post,
      message: '게시물이 성공적으로 작성되었습니다.',
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: '게시물 작성 중 오류가 발생했습니다.',
    });
  }
};

export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const tags = req.query.tags as string;
    const author = req.query.author as string;
    const search = req.query.search as string;
    const familyId = req.familyId;

    if (!familyId) {
      res.status(401).json({
        success: false,
        message: '가족 정보가 필요합니다.',
      });
      return;
    }

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {
      familyId,
    };

    // Note: SQLite doesn't support array operations, so tag filtering would need custom implementation

    if (author) {
      where.author = {
        name: {
          contains: author,
          mode: 'insensitive',
        },
      };
    }

    if (search) {
      where.OR = [
        {
          content: {
            contains: search,
            mode: 'insensitive',
          },
        },
        // Note: SQLite doesn't support array search, would need custom implementation
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          family: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: page,
          total: totalPages,
          count: posts.length,
          totalCount: total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: '게시물 조회 중 오류가 발생했습니다.',
    });
  }
};

export const getPostById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
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
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.',
      });
      return;
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Get post by id error:', error);
    res.status(500).json({
      success: false,
      message: '게시물 조회 중 오류가 발생했습니다.',
    });
  }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, mediaUrls, tags } = req.body;

    const updateData: any = {};

    if (content !== undefined) updateData.content = content;
    if (mediaUrls !== undefined) {
      updateData.mediaUrls = JSON.stringify(mediaUrls);
      
      // 미디어 타입 업데이트
      if (mediaUrls.length > 0) {
        const firstUrl = mediaUrls[0];
        if (firstUrl.includes('image') || firstUrl.includes('jpg') || firstUrl.includes('png')) {
          updateData.mediaType = MediaType.IMAGE;
        } else if (firstUrl.includes('video') || firstUrl.includes('mp4')) {
          updateData.mediaType = MediaType.VIDEO;
        }
      } else {
        updateData.mediaType = null;
      }
    }
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
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
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: post,
      message: '게시물이 성공적으로 수정되었습니다.',
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: '게시물 수정 중 오류가 발생했습니다.',
    });
  }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.post.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: '게시물이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: '게시물 삭제 중 오류가 발생했습니다.',
    });
  }
};

export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
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

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId,
        },
      },
    });

    if (existingLike) {
      // 좋아요 취소
      await prisma.like.delete({
        where: {
          postId_userId: {
            postId: id,
            userId,
          },
        },
      });

      res.json({
        success: true,
        data: { liked: false },
        message: '좋아요를 취소했습니다.',
      });
    } else {
      // 좋아요 추가
      await prisma.like.create({
        data: {
          postId: id,
          userId,
        },
      });

      res.json({
        success: true,
        data: { liked: true },
        message: '좋아요를 추가했습니다.',
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: '좋아요 처리 중 오류가 발생했습니다.',
    });
  }
};