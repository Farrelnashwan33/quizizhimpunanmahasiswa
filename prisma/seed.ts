import { PrismaClient } from '@prisma/client';
import { OFFICIAL_30_QUESTIONS } from '../src/lib/data/questions';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed for Quiz Kaderisasi Tingkat I HIMA FST UT Bandung...');

  const quizId = '11111111-1111-1111-1111-111111111111';

  const quiz = await prisma.quiz.upsert({
    where: { id: quizId },
    update: {
      title: 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung',
      description: 'Uji Pemahaman, Bangun Karakter, dan Siap Berkontribusi. 30 butir soal pilihan ganda.',
      durationMinutes: 60,
      isActive: true,
      showResult: true,
      allowRetry: false
    },
    create: {
      id: quizId,
      title: 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung',
      description: 'Uji Pemahaman, Bangun Karakter, dan Siap Berkontribusi. 30 butir soal pilihan ganda.',
      durationMinutes: 60,
      isActive: true,
      showResult: true,
      allowRetry: false
    }
  });

  console.log(`✅ Quiz ready: ${quiz.title}`);

  // Upsert all 30 questions
  for (const q of OFFICIAL_30_QUESTIONS) {
    await prisma.question.upsert({
      where: {
        quizId_questionNumber: {
          quizId: quiz.id,
          questionNumber: q.questionNumber
        }
      },
      update: {
        section: q.section,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      },
      create: {
        quizId: quiz.id,
        questionNumber: q.questionNumber,
        section: q.section,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }
    });
  }

  console.log(`✅ Seeded ${OFFICIAL_30_QUESTIONS.length} questions successfully!`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
