import { PrismaClient, Role, JobType, JobStatus, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('[Seed] Starting database seeding...');

  // 1. Clean existing records in reverse dependency order for idempotency
  await prisma.applicationHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobVacancy.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('[Seed] Cleaned existing records.');

  // 2. Hash common password
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 3. Seed Companies
  // Company 1: PT Teknologi Nusantara
  const company1User = await prisma.user.create({
    data: {
      email: 'company@indokerja.id',
      passwordHash,
      fullName: 'Recruiter PT Teknologi Nusantara',
      phone: '081234567890',
      role: Role.COMPANY,
      companyProfile: {
        create: {
          companyName: 'PT Teknologi Nusantara',
          industry: 'Teknologi Informasi & Software',
          location: 'Jakarta Selatan',
          description: 'Perusahaan teknologi inovatif pengembang platform digital terkemuka di Indonesia.',
          website: 'https://teknologinusantara.id'
        }
      }
    },
    include: {
      companyProfile: true
    }
  });

  const company1ProfileId = company1User.companyProfile!.id;

  // Company 2: PT Maju Bersama
  const company2User = await prisma.user.create({
    data: {
      email: 'company2@indokerja.id',
      passwordHash,
      fullName: 'Recruiter PT Maju Bersama',
      phone: '081298765432',
      role: Role.COMPANY,
      companyProfile: {
        create: {
          companyName: 'PT Maju Bersama',
          industry: 'Fintech & Layanan Keuangan',
          location: 'Bandung',
          description: 'Perusahaan penyedia solusi transaksi finansial digital terpercaya di Indonesia.',
          website: 'https://majubersama.id'
        }
      }
    },
    include: {
      companyProfile: true
    }
  });

  const company2ProfileId = company2User.companyProfile!.id;

  console.log('[Seed] Seeded 2 companies.');

  // 4. Seed Job Seekers
  // Seeker 1: Budi Santoso
  const seeker1 = await prisma.user.create({
    data: {
      email: 'seeker@indokerja.id',
      passwordHash,
      fullName: 'Budi Santoso',
      phone: '081311223344',
      role: Role.JOB_SEEKER
    }
  });

  // Seeker 2: Siti Rahma
  const seeker2 = await prisma.user.create({
    data: {
      email: 'seeker2@indokerja.id',
      passwordHash,
      fullName: 'Siti Rahma',
      phone: '081355667788',
      role: Role.JOB_SEEKER
    }
  });

  console.log('[Seed] Seeded 2 job seekers.');

  // 5. Seed Job Vacancies
  // Vacancy 1: Senior Frontend Engineer (React) - Company 1
  const jobFrontend = await prisma.jobVacancy.create({
    data: {
      companyId: company1ProfileId,
      title: 'Senior Frontend Engineer (React)',
      description: 'Kami mencari Senior Frontend Engineer yang berpengalaman dalam membangun antarmuka web modern berskala besar menggunakan React, TypeScript, dan state management optimal.',
      requirements: '- Pengalaman minimal 3 tahun dengan React & TypeScript\n- Memahami arsitektur SPA dan SSR\n- Terbiasa dengan CSS modular dan responsive design\n- Berpengalaman integrasi RESTful API & WebSocket',
      location: 'Jakarta Selatan (Hybrid)',
      jobType: JobType.FULL_TIME,
      salaryMin: 18000000,
      salaryMax: 25000000,
      isNegotiable: false,
      status: JobStatus.OPEN
    }
  });

  // Vacancy 2: Backend Engineer (Node.js) - Company 1
  const jobBackend = await prisma.jobVacancy.create({
    data: {
      companyId: company1ProfileId,
      title: 'Backend Engineer (Node.js)',
      description: 'Dibutuhkan Backend Engineer untuk merancang, membangun, dan memelihara API performa tinggi, database relational PostgreSQL, serta sistem transaksi asynchronous.',
      requirements: '- Mahir Node.js, Express.js / NestJS, dan TypeScript\n- Pengalaman dengan PostgreSQL, Prisma / TypeORM\n- Paham prinsip REST API, autentikasi JWT, dan RBAC\n- Familiar dengan Docker dan CI/CD pipeline',
      location: 'Jakarta Selatan',
      jobType: JobType.FULL_TIME,
      salaryMin: 15000000,
      salaryMax: 22000000,
      isNegotiable: false,
      status: JobStatus.OPEN
    }
  });

  // Vacancy 3: UI/UX Designer - Company 2
  const jobDesigner = await prisma.jobVacancy.create({
    data: {
      companyId: company2ProfileId,
      title: 'UI/UX Designer',
      description: 'Bergabung bersama PT Maju Bersama untuk menciptakan desain antarmuka dan pengalaman pengguna aplikasi fintech yang intuitif, rapi, dan mudah digunakan.',
      requirements: '- Minimal 2 tahun pengalaman sebagai Product/UIUX Designer\n- Mahir Figma, design system, prototyping\n- Memiliki portofolio studi kasus UX yang kuat\n- Kemampuan komunikasi visual yang baik',
      location: 'Bandung / Remote',
      jobType: JobType.REMOTE,
      salaryMin: 10000000,
      salaryMax: 16000000,
      isNegotiable: true,
      status: JobStatus.OPEN
    }
  });

  console.log('[Seed] Seeded 3 job vacancies.');

  // 6. Seed Applications and Chronological History Logs
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Application 1: Budi Santoso -> Senior Frontend Engineer (Status: SHORTLISTED)
  // History: APPLIED -> REVIEWING -> SHORTLISTED
  const app1 = await prisma.application.create({
    data: {
      jobId: jobFrontend.id,
      seekerId: seeker1.id,
      coverNote: 'Saya memiliki pengalaman 4 tahun membangun web apps dengan React dan TypeScript. Sangat antusias bergabung dengan tim teknologi PT Teknologi Nusantara.',
      resumeUrl: 'https://linkedin.com/in/budisantoso',
      status: ApplicationStatus.SHORTLISTED
    }
  });

  await prisma.applicationHistory.createMany({
    data: [
      {
        applicationId: app1.id,
        previousStatus: null,
        newStatus: ApplicationStatus.APPLIED,
        changedById: seeker1.id,
        note: 'Berkas lamaran awal dikirimkan oleh pelamar.',
        createdAt: new Date(now - 3 * dayMs)
      },
      {
        applicationId: app1.id,
        previousStatus: ApplicationStatus.APPLIED,
        newStatus: ApplicationStatus.REVIEWING,
        changedById: company1User.id,
        note: 'Profil kandidat sedang ditinjau oleh HR dan Technical Lead.',
        createdAt: new Date(now - 2 * dayMs)
      },
      {
        applicationId: app1.id,
        previousStatus: ApplicationStatus.REVIEWING,
        newStatus: ApplicationStatus.SHORTLISTED,
        changedById: company1User.id,
        note: 'Kandidat lolos seleksi berkas dan masuk shortlist untuk tahap technical interview.',
        createdAt: new Date(now - 1 * dayMs)
      }
    ]
  });

  // Application 2: Siti Rahma -> Backend Engineer (Status: REVIEWING)
  // History: APPLIED -> REVIEWING
  const app2 = await prisma.application.create({
    data: {
      jobId: jobBackend.id,
      seekerId: seeker2.id,
      coverNote: 'Spesialis backend engineering Node.js dan perancangan database PostgreSQL. Terbiasa menangani optimasi query dan clean architecture.',
      resumeUrl: 'https://github.com/sitirahma',
      status: ApplicationStatus.REVIEWING
    }
  });

  await prisma.applicationHistory.createMany({
    data: [
      {
        applicationId: app2.id,
        previousStatus: null,
        newStatus: ApplicationStatus.APPLIED,
        changedById: seeker2.id,
        note: 'Berkas lamaran awal dikirimkan oleh pelamar.',
        createdAt: new Date(now - 2 * dayMs)
      },
      {
        applicationId: app2.id,
        previousStatus: ApplicationStatus.APPLIED,
        newStatus: ApplicationStatus.REVIEWING,
        changedById: company1User.id,
        note: 'CV kandidat sesuai kualifikasi, sedang ditinjau mendalam oleh Engineering Team.',
        createdAt: new Date(now - 1 * dayMs)
      }
    ]
  });

  // Application 3: Budi Santoso -> UI/UX Designer (Status: APPLIED)
  // History: APPLIED
  const app3 = await prisma.application.create({
    data: {
      jobId: jobDesigner.id,
      seekerId: seeker1.id,
      coverNote: 'Selain frontend, saya mendalami desain sistem antarmuka produk digital.',
      resumeUrl: 'https://dribbble.com/budisantoso',
      status: ApplicationStatus.APPLIED
    }
  });

  await prisma.applicationHistory.createMany({
    data: [
      {
        applicationId: app3.id,
        previousStatus: null,
        newStatus: ApplicationStatus.APPLIED,
        changedById: seeker1.id,
        note: 'Berkas lamaran awal dikirimkan oleh pelamar.',
        createdAt: new Date(now - 4 * 60 * 60 * 1000) // 4 hours ago
      }
    ]
  });

  console.log('[Seed] Seeded 3 applications with valid, chronological history audit logs.');
  console.log('[Seed] Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
