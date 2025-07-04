import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 기존 데이터 정리
  await prisma.like.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.familyMember.deleteMany({});
  await prisma.family.deleteMany({});
  await prisma.user.deleteMany({});

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 사용자 생성
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: hashedPassword,
      name: '존 스미스',
      profileImage: 'https://example.com/avatar1.jpg',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: hashedPassword,
      name: '제인 스미스',
      profileImage: 'https://example.com/avatar2.jpg',
    },
  });

  // 가족 생성
  const family = await prisma.family.create({
    data: {
      name: '스미스 가족',
      inviteCode: 'SMITH2024',
    },
  });

  // 가족 구성원 추가
  await prisma.familyMember.create({
    data: {
      userId: user1.id,
      familyId: family.id,
      role: 'ADMIN',
    },
  });

  await prisma.familyMember.create({
    data: {
      userId: user2.id,
      familyId: family.id,
      role: 'MEMBER',
    },
  });

  // 게시물 생성
  const post1 = await prisma.post.create({
    data: {
      content: '우리 아기 첫 미소! 😊',
      mediaUrls: ['https://example.com/baby-smile.jpg'],
      mediaType: 'IMAGE',
      tags: ['첫미소', '아기', '행복'],
      authorId: user1.id,
      familyId: family.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      content: '오늘은 이유식을 처음 시작했어요. 호박죽을 정말 잘 먹네요!',
      mediaUrls: ['https://example.com/baby-food.jpg'],
      mediaType: 'IMAGE',
      tags: ['이유식', '호박죽', '첫시작'],
      authorId: user2.id,
      familyId: family.id,
    },
  });

  // 댓글 생성
  await prisma.comment.create({
    data: {
      content: '정말 귀여워요! 😍',
      postId: post1.id,
      authorId: user2.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: '잘 먹는 모습이 너무 예뻐요~',
      postId: post2.id,
      authorId: user1.id,
    },
  });

  // 좋아요 생성
  await prisma.like.create({
    data: {
      postId: post1.id,
      userId: user2.id,
    },
  });

  await prisma.like.create({
    data: {
      postId: post2.id,
      userId: user1.id,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('👥 Created users:', { user1: user1.email, user2: user2.email });
  console.log('👨‍👩‍👧‍👦 Created family:', family.name);
  console.log('📝 Created posts:', 2);
  console.log('💬 Created comments:', 2);
  console.log('❤️ Created likes:', 2);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });