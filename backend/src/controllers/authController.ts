import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, familyName, inviteCode } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: '이미 존재하는 이메일입니다.',
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 트랜잭션으로 사용자와 가족 생성
    const result = await prisma.$transaction(async (tx) => {
      // 사용자 생성
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      let family;
      let role: 'ADMIN' | 'MEMBER' = 'ADMIN';

      if (inviteCode) {
        // 초대 코드가 있는 경우 기존 가족에 참여
        family = await tx.family.findUnique({
          where: { inviteCode },
        });

        if (!family) {
          throw new Error('유효하지 않은 초대 코드입니다.');
        }

        role = 'MEMBER';
      } else {
        // 새 가족 생성
        const newFamilyName = familyName || `${name}의 가족`;
        const newInviteCode = generateInviteCode();

        family = await tx.family.create({
          data: {
            name: newFamilyName,
            inviteCode: newInviteCode,
          },
        });
      }

      // 가족 구성원으로 추가
      await tx.familyMember.create({
        data: {
          userId: user.id,
          familyId: family.id,
          role,
        },
      });

      return { user, family, role };
    });

    const token = generateToken(result.user.id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          profileImage: result.user.profileImage,
          createdAt: result.user.createdAt,
        },
        family: {
          id: result.family.id,
          name: result.family.name,
          inviteCode: result.family.inviteCode,
          role: result.role,
        },
        token,
      },
      message: '회원가입이 완료되었습니다.',
    });
  } catch (error: any) {
    console.error('Register error:', error);
    
    if (error.message === '유효하지 않은 초대 코드입니다.') {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        familyMembers: {
          include: {
            family: true,
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
      return;
    }

    const token = generateToken(user.id);

    // 사용자의 첫 번째 가족 정보 가져오기
    const familyMember = user.familyMembers[0];
    const family = familyMember ? familyMember.family : null;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
        family: family ? {
          id: family.id,
          name: family.name,
          inviteCode: family.inviteCode,
          role: familyMember.role,
        } : null,
        token,
      },
      message: '로그인이 완료되었습니다.',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        familyMembers: {
          include: {
            family: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
      return;
    }

    const familyMember = user.familyMembers[0];
    const family = familyMember ? familyMember.family : null;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
        family: family ? {
          id: family.id,
          name: family.name,
          inviteCode: family.inviteCode,
          role: familyMember.role,
        } : null,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      message: '로그아웃이 완료되었습니다.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};