"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePost = exports.deletePost = exports.updatePost = exports.getPostById = exports.getPosts = exports.createPost = void 0;
const database_1 = __importDefault(require("../config/database"));
const client_1 = require("@prisma/client");
const createPost = async (req, res) => {
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
        let mediaType = null;
        if (mediaUrls.length > 0) {
            // 첫 번째 미디어 URL을 기준으로 타입 결정 (실제로는 더 정교한 로직 필요)
            const firstUrl = mediaUrls[0];
            if (firstUrl.includes('image') || firstUrl.includes('jpg') || firstUrl.includes('png')) {
                mediaType = client_1.MediaType.IMAGE;
            }
            else if (firstUrl.includes('video') || firstUrl.includes('mp4')) {
                mediaType = client_1.MediaType.VIDEO;
            }
        }
        const post = await database_1.default.post.create({
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
    }
    catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({
            success: false,
            message: '게시물 작성 중 오류가 발생했습니다.',
        });
    }
};
exports.createPost = createPost;
const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const tags = req.query.tags;
        const author = req.query.author;
        const search = req.query.search;
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
        const where = {
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
            database_1.default.post.findMany({
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
            database_1.default.post.count({ where }),
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
    }
    catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({
            success: false,
            message: '게시물 조회 중 오류가 발생했습니다.',
        });
    }
};
exports.getPosts = getPosts;
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await database_1.default.post.findUnique({
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
    }
    catch (error) {
        console.error('Get post by id error:', error);
        res.status(500).json({
            success: false,
            message: '게시물 조회 중 오류가 발생했습니다.',
        });
    }
};
exports.getPostById = getPostById;
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, mediaUrls, tags } = req.body;
        const updateData = {};
        if (content !== undefined)
            updateData.content = content;
        if (mediaUrls !== undefined) {
            updateData.mediaUrls = JSON.stringify(mediaUrls);
            // 미디어 타입 업데이트
            if (mediaUrls.length > 0) {
                const firstUrl = mediaUrls[0];
                if (firstUrl.includes('image') || firstUrl.includes('jpg') || firstUrl.includes('png')) {
                    updateData.mediaType = client_1.MediaType.IMAGE;
                }
                else if (firstUrl.includes('video') || firstUrl.includes('mp4')) {
                    updateData.mediaType = client_1.MediaType.VIDEO;
                }
            }
            else {
                updateData.mediaType = null;
            }
        }
        if (tags !== undefined)
            updateData.tags = JSON.stringify(tags);
        const post = await database_1.default.post.update({
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
    }
    catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({
            success: false,
            message: '게시물 수정 중 오류가 발생했습니다.',
        });
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.default.post.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: '게시물이 성공적으로 삭제되었습니다.',
        });
    }
    catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({
            success: false,
            message: '게시물 삭제 중 오류가 발생했습니다.',
        });
    }
};
exports.deletePost = deletePost;
const likePost = async (req, res) => {
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
        const existingLike = await database_1.default.like.findUnique({
            where: {
                postId_userId: {
                    postId: id,
                    userId,
                },
            },
        });
        if (existingLike) {
            // 좋아요 취소
            await database_1.default.like.delete({
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
        }
        else {
            // 좋아요 추가
            await database_1.default.like.create({
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
    }
    catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({
            success: false,
            message: '좋아요 처리 중 오류가 발생했습니다.',
        });
    }
};
exports.likePost = likePost;
//# sourceMappingURL=postController.js.map