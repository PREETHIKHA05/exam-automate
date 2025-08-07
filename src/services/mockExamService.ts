import { Exam, ExamAlert, Teacher } from '../types';
import { mockExams, teachers, subjects } from '../data/mockData';

// Mock data storage (in-memory)
let mockScheduledExams: any[] = [];
let mockExamSettings: any[] = [];

export const mockExamService = {
  // Get all subjects (mapped to Exam interface)
  async getExams(): Promise<Exam[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockExams;
  },

  // Get subjects by teacher (staff member)
  async getExamsByTeacher(teacherId: string): Promise<Exam[]> {
    const allExams = await this.getExams();
    return allExams.filter(exam => exam.teacherId === teacherId);
  },

  // Get teacher by credentials
  async authenticateTeacher(email: string, password: string): Promise<Teacher | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const teacher = teachers.find(t => t.email === email && t.password === password);
    return teacher || null;
  },

  // Get all teachers
  async getTeachers(): Promise<Teacher[]> {
    return teachers;
  },

  // Schedule an exam with constraint checking
  async scheduleExam(subjectId: string, examDate: string, assignedBy: string): Promise<{ success: boolean; message: string; forcedSchedules?: any[] }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get subject details
    const allExams = await this.getExams();
    const subject = allExams.find(exam => exam.id === subjectId);
    
    if (!subject) {
      throw new Error('Subject not found');
    }

    // Check for time conflicts (same date and time)
    const timeConflicts = mockScheduledExams.filter(schedule => 
      schedule.examDate === examDate
    );
    
    if (timeConflicts.length > 0) {
      throw new Error(`Conflict detected: Another exam is already scheduled on ${examDate}`);
    }

    // Check for same subject name constraint
    const sameSubjectExams = mockScheduledExams.filter(schedule => 
      schedule.subjectName === subject.subjectName && schedule.department !== subject.department
    );

    let forcedSchedules: any[] = [];
    
    if (sameSubjectExams.length > 0) {
      // Check if any same subject is already scheduled on a different date
      const differentDateExams = sameSubjectExams.filter(schedule => schedule.examDate !== examDate);
      
      if (differentDateExams.length > 0) {
        throw new Error(`Constraint violation: ${subject.subjectName} is already scheduled on ${differentDateExams[0].examDate} for ${differentDateExams[0].department} department. All ${subject.subjectName} exams must be on the same date.`);
      }
    } else {
      // This is the first exam for this subject name, so we need to force schedule other departments
      const otherDepartments = ['IT', 'CSE', 'AIDS'].filter(dept => dept !== subject.department);
      
      for (const dept of otherDepartments) {
        const deptSubject = allExams.find(exam => 
          exam.subjectName === subject.subjectName && exam.department === dept
        );
        
        if (deptSubject) {
          // Force schedule the same subject for other departments
          const forcedSchedule = {
            id: `forced-${Date.now()}-${dept}`,
            subjectId: deptSubject.id,
            subjectName: deptSubject.subjectName,
            subjectCode: deptSubject.subjectCode,
            department: deptSubject.department,
            examDate: examDate,

            assignedBy: 'System (Auto-scheduled due to constraint)',
            isShared: true,
            priorityDepartment: subject.department,
            createdAt: new Date().toISOString(),
            isForced: true
          };
          
          mockScheduledExams.push(forcedSchedule);
          forcedSchedules.push(forcedSchedule);
        }
      }
    }

    // Create the main schedule
    const newSchedule = {
      id: `schedule-${Date.now()}`,
      subjectId: subjectId,
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      department: subject.department,
      examDate: examDate,

      assignedBy: assignedBy,
      isShared: false,
      priorityDepartment: null,
      createdAt: new Date().toISOString(),
      isForced: false
    };

    // Add to mock storage
    mockScheduledExams.push(newSchedule);
    
    console.log('✅ Mock exam scheduled:', newSchedule);
    
    if (forcedSchedules.length > 0) {
      console.log('🔄 Forced schedules created:', forcedSchedules);
      return {
        success: true,
        message: `Exam scheduled successfully. ${forcedSchedules.length} additional exams were automatically scheduled for the same subject in other departments due to constraint requirements.`,
        forcedSchedules
      };
    }
    
    return {
      success: true,
      message: 'Exam scheduled successfully.'
    };
  },

  // Get scheduled exams for admin dashboard
  async getScheduledExams(): Promise<any[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockScheduledExams.map(schedule => ({
      id: schedule.id,
      subjectId: schedule.subjectId,
      subjectName: schedule.subjectName,
      subjectCode: schedule.subjectCode,
      department: schedule.department,
      examDate: schedule.examDate,

      assignedBy: schedule.assignedBy,
      isShared: schedule.isShared,
      priorityDepartment: schedule.priorityDepartment,
      createdAt: schedule.createdAt,
      isForced: schedule.isForced || false
    }));
  },

  // Get scheduled exams by teacher
  async getScheduledExamsByTeacher(teacherId: string): Promise<any[]> {
    const allScheduled = await this.getScheduledExams();
    const teacherExams = await this.getExamsByTeacher(teacherId);
    const teacherSubjectIds = teacherExams.map(exam => exam.id);
    
    return allScheduled.filter(schedule => teacherSubjectIds.includes(schedule.subjectId));
  },

  // Get available dates (excluding weekends and holidays)
  async getAvailableDates(startDate: string, endDate: string): Promise<string[]> {
    const availableDates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      // Exclude weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        availableDates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return availableDates;
  },

  // Get available time slots
  getAvailableTimeSlots(): string[] {
    return [
      '09:00:00',
      '10:00:00', 
      '11:00:00',
      '14:00:00',
      '15:00:00',
      '16:00:00'
    ];
  },

  // Get exam settings (mapped to ExamAlert interface)
  async getExamAlerts(): Promise<ExamAlert[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockExamSettings.map(setting => ({
      id: setting.id,
      title: `Exam Settings - ${setting.exam_start_date} to ${setting.exam_end_date}`,
      startDate: setting.exam_start_date,
      endDate: setting.exam_end_date,
      year: 4,
      semester: 8,
      departments: [],
      status: 'active',
      createdAt: setting.created_at,
    }));
  },

  // Create exam setting (mock)
  async createExamAlert(alertData: Omit<ExamAlert, 'id' | 'createdAt'>): Promise<ExamAlert> {
    const newSetting = {
      id: `setting-${Date.now()}`,
      exam_start_date: alertData.startDate,
      exam_end_date: alertData.endDate,
      holidays: [],
      created_by: 'mock-user',
      created_at: new Date().toISOString(),
    };

    mockExamSettings.push(newSetting);

    return {
      id: newSetting.id,
      title: `Exam Settings - ${newSetting.exam_start_date} to ${newSetting.exam_end_date}`,
      startDate: newSetting.exam_start_date,
      endDate: newSetting.exam_end_date,
      year: 4,
      semester: 8,
      departments: [],
      status: 'active',
      createdAt: newSetting.created_at,
    };
  },

  // Update exam setting (mock)
  async updateExamAlert(alertId: string, updates: Partial<ExamAlert>): Promise<ExamAlert> {
    const settingIndex = mockExamSettings.findIndex(s => s.id === alertId);
    if (settingIndex === -1) {
      throw new Error('Exam setting not found');
    }

    const updatedSetting = {
      ...mockExamSettings[settingIndex],
      exam_start_date: updates.startDate || mockExamSettings[settingIndex].exam_start_date,
      exam_end_date: updates.endDate || mockExamSettings[settingIndex].exam_end_date,
    };

    mockExamSettings[settingIndex] = updatedSetting;

    return {
      id: updatedSetting.id,
      title: `Exam Settings - ${updatedSetting.exam_start_date} to ${updatedSetting.exam_end_date}`,
      startDate: updatedSetting.exam_start_date,
      endDate: updatedSetting.exam_end_date,
      year: 4,
      semester: 8,
      departments: [],
      status: 'active',
      createdAt: updatedSetting.created_at,
    };
  },

  // Clear all mock data (for testing)
  clearMockData(): void {
    mockScheduledExams = [];
    mockExamSettings = [];
    console.log('🗑️ Mock data cleared');
  },

  // Get mock data status
  getMockDataStatus(): { scheduledExams: number; examSettings: number } {
    return {
      scheduledExams: mockScheduledExams.length,
      examSettings: mockExamSettings.length,
    };
  },

  // Get teacher login credentials for testing
  getTeacherCredentials(): { email: string; password: string; name: string; department: string; subject: string }[] {
    return teachers.map(teacher => ({
      email: teacher.email,
      password: teacher.password,
      name: teacher.name,
      department: teacher.department,
      subject: teacher.subject
    }));
  }
}; 