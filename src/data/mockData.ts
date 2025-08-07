import { Exam, ExamAlert, Department, Teacher } from '../types';

// Define the three departments as requested
export const departments: Department[] = [
  { code: 'IT', name: 'Information Technology' },
  { code: 'CSE', name: 'Computer Science & Engineering' },
  { code: 'AIDS', name: 'Artificial Intelligence & Data Science' }
];

// Define teachers for each subject in each department
export const teachers: Teacher[] = [
  // IT Department Teachers
  { id: 'IT_DAA_001', name: 'Dr. Sarah Johnson', email: 'sarah.johnson@cit.edu', department: 'IT', subject: 'DAA', password: 'it_daa_2025' },
  { id: 'IT_CPP_001', name: 'Prof. Michael Chen', email: 'michael.chen@cit.edu', department: 'IT', subject: 'C++', password: 'it_cpp_2025' },
  { id: 'IT_PYTHON_001', name: 'Dr. Emily Rodriguez', email: 'emily.rodriguez@cit.edu', department: 'IT', subject: 'Python', password: 'it_python_2025' },
  
  // CSE Department Teachers
  { id: 'CSE_DAA_001', name: 'Dr. David Kumar', email: 'david.kumar@cit.edu', department: 'CSE', subject: 'DAA', password: 'cse_daa_2025' },
  { id: 'CSE_CA_001', name: 'Prof. Lisa Wang', email: 'lisa.wang@cit.edu', department: 'CSE', subject: 'CA', password: 'cse_ca_2025' },
  { id: 'CSE_PYTHON_001', name: 'Dr. Robert Singh', email: 'robert.singh@cit.edu', department: 'CSE', subject: 'Python', password: 'cse_python_2025' },
  
  // AIDS Department Teachers
  { id: 'AIDS_DAA_001', name: 'Dr. Priya Sharma', email: 'priya.sharma@cit.edu', department: 'AIDS', subject: 'DAA', password: 'aids_daa_2025' },
  { id: 'AIDS_WEB_001', name: 'Prof. Alex Thompson', email: 'alex.thompson@cit.edu', department: 'AIDS', subject: 'Web frameworks', password: 'aids_web_2025' },
  { id: 'AIDS_PYTHON_001', name: 'Dr. Maria Garcia', email: 'maria.garcia@cit.edu', department: 'AIDS', subject: 'Python', password: 'aids_python_2025' }
];

// Define subjects for each department
export const subjects = {
  IT: [
    { code: 'IT301', name: 'DAA', teacherId: 'IT_DAA_001' },
    { code: 'IT302', name: 'C++', teacherId: 'IT_CPP_001' },
    { code: 'IT303', name: 'Python', teacherId: 'IT_PYTHON_001' }
  ],
  CSE: [
    { code: 'CS301', name: 'DAA', teacherId: 'CSE_DAA_001' },
    { code: 'CS302', name: 'CA', teacherId: 'CSE_CA_001' },
    { code: 'CS303', name: 'Python', teacherId: 'CSE_PYTHON_001' }
  ],
  AIDS: [
    { code: 'AI301', name: 'DAA', teacherId: 'AIDS_DAA_001' },
    { code: 'AI302', name: 'Web frameworks', teacherId: 'AIDS_WEB_001' },
    { code: 'AI303', name: 'Python', teacherId: 'AIDS_PYTHON_001' }
  ]
};

// Create mock exams for all subjects
export const mockExams: Exam[] = [
  // IT Department Subjects
  {
    id: 'IT_DAA_001',
    subjectCode: 'IT301',
    subjectName: 'DAA',
    courseId: 'IT301',
    department: 'IT',
    year: 3,
    semester: 6,
    teacherId: 'IT_DAA_001',
    teacherName: 'Dr. Sarah Johnson',
    startDate: '2025-02-04',
    endDate: '2025-02-28',
    status: 'pending'
  },
  {
    id: 'IT_CPP_001',
    subjectCode: 'IT302',
    subjectName: 'C++',
    courseId: 'IT302',
    department: 'IT',
    year: 3,
    semester: 6,
    teacherId: 'IT_CPP_001',
    teacherName: 'Prof. Michael Chen',
    startDate: '2025-02-04',
    endDate: '2025-02-28',
    status: 'pending'
  },
  {
    id: 'IT_PYTHON_001',
    subjectCode: 'IT303',
    subjectName: 'Python',
    courseId: 'IT303',
    department: 'IT',
    year: 3,
    semester: 6,
    teacherId: 'IT_PYTHON_001',
    teacherName: 'Dr. Emily Rodriguez',
    startDate: '2025-02-04',
    endDate: '2025-02-28',
    status: 'pending'
  },
  
  // CSE Department Subjects
  {
    id: 'CSE_DAA_001',
    subjectCode: 'CS301',
    subjectName: 'DAA',
    courseId: 'CS301',
    department: 'CSE',
    year: 3,
    semester: 6,
    teacherId: 'CSE_DAA_001',
    teacherName: 'Dr. David Kumar',
    startDate: '2025-02-04',
    endDate: '2025-02-28',
    status: 'pending'
  },
  {
    id: 'CSE_CA_001',
    subjectCode: 'CS302',
    subjectName: 'CA',
    courseId: 'CS302',
    department: 'CSE',
    year: 3,
    semester: 6,
    teacherId: 'CSE_CA_001',
    teacherName: 'Prof. Lisa Wang',
    startDate: '2025-02-04',
    endDate: '2025-02-28',
    status: 'pending'
  },
  {
    id: 'CSE_PYTHON_001',
    subjectCode: 'CS303',
    subjectName: 'Python',
    courseId: 'CS303',
    department: 'CSE',
    year: 3,
    semester: 6,
    teacherId: 'CSE_PYTHON_001',
    teacherName: 'Dr. Robert Singh',
    startDate: '2025-02-04',
    endDate: '2025-02-28',
    status: 'pending'
  },
  
  // AIDS Department Subjects
  {
    id: 'AIDS_DAA_001',
    subjectCode: 'AI301',
    subjectName: 'DAA',
    courseId: 'AI301',
    department: 'AIDS',
    year: 3,
    semester: 6,
    teacherId: 'AIDS_DAA_001',
    teacherName: 'Dr. Priya Sharma',
    startDate: '2025-02-04',
    endDate: '2025-02-28',
    status: 'pending'
  },
  {
    id: 'AIDS_WEB_001',
    subjectCode: 'AI302',
    subjectName: 'Web frameworks',
    courseId: 'AI302',
    department: 'AIDS',
    year: 3,
    semester: 6,
    teacherId: 'AIDS_WEB_001',
    teacherName: 'Prof. Alex Thompson',
    startDate: '2025-02-04',
    endDate: '2025-02-28',
    status: 'pending'
  },
  {
    id: 'AIDS_PYTHON_001',
    subjectCode: 'AI303',
    subjectName: 'Python',
    courseId: 'AI303',
    department: 'AIDS',
    year: 3,
    semester: 6,
    teacherId: 'AIDS_PYTHON_001',
    teacherName: 'Dr. Maria Garcia',
    startDate: '2025-02-04',
    endDate: '2025-02-28',
    status: 'pending'
  }
];

export const mockAlerts: ExamAlert[] = [
  {
    id: '1',
    title: 'Internal Assessment-II - III Year',
    startDate: '2025-02-04',
    endDate: '2025-02-28',
    year: 3,
    semester: 6,
    departments: ['IT', 'CSE', 'AIDS'],
    createdAt: '2025-01-15',
    status: 'active'
  }
];