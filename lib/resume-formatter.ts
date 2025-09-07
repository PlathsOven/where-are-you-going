interface EducationItem {
  institution: string;
  degree: string;
  dates: string;
  details: string;
}

interface CareerItem {
  company: string;
  role: string;
  dates: string;
  details: string;
}

interface PersonData {
  name?: string;
  education: EducationItem[];
  career: CareerItem[];
}

export function formatResume(person: PersonData): string {
  let resume = '';

  // Name at the top (centered via special marker)
  if (person.name) {
    resume += `[CENTERED]${person.name}[/CENTERED]\n\n`;
  }

  // Education section
  if (person.education && person.education.length > 0) {
    person.education.forEach(edu => {
      resume += `**${edu.institution}**, ${edu.degree}, ${edu.dates}\n`;
      if (edu.details) {
        resume += `- ${edu.details}\n`;
      }
      resume += '\n';
    });
  }

  // Career section
  if (person.career && person.career.length > 0) {
    person.career.forEach(job => {
      resume += `**${job.company}**, ${job.role}, ${job.dates}\n`;
      if (job.details) {
        resume += `- ${job.details}\n`;
      }
      resume += '\n';
    });
  }

  return resume.trim();
}
