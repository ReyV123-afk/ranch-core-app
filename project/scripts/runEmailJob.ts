import { emailJobService } from '../src/lib/emailJob';

async function main() {
  try {
    console.log('Starting email job...');
    await emailJobService.processEmailJobs();
    console.log('Email job completed successfully');
  } catch (error) {
    console.error('Error running email job:', error);
    process.exit(1);
  }
}

main(); 