import { supabase } from '../lib/supabase';
import { Exam, ExamAlert } from '../types';

export const examService = {
  // Test function to verify exam_schedules table access
  async testExamSchedulesAccess(): Promise<void> {
    try {
      console.log('Testing exam_schedules table access...');
      
      const { data, error } = await supabase
        .from('exam_schedules')
        .select('*')
        .limit(5);

      if (error) {
        console.error('Error accessing exam_schedules table:', error);
        throw new Error(error.message);
      }

      console.log('Successfully accessed exam_schedules table!');
      console.log('Sample data:', data);
      console.log('Total records found:', data?.length || 0);
      
      return;
    } catch (error) {
      console.error('Failed to access exam_schedules table:', error);
      throw error;
    }
  },

  // Get all subjects (mapped to Exam interface)
  async getExams(): Promise<Exam[]> {
    const { data, error } = await supabase
      .from('subject_detail')
      .select(`
        *,
        exam_schedules(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(subject => ({
      id: subject.id,
      subjectCode: subject.subcode,
      subjectName: subject.name,
      courseId: subject.subcode, // Using subcode as courseId
      department: subject.department,
      year: subject.year,
      semester: 8, // Default semester since it's not in your schema
      teacherId: '', // Will be set from exam_schedules
      teacherName: '', // Will be set from exam_schedules
      scheduledDate: subject.exam_schedules?.[0]?.exam_date || null,
      startDate: '2025-02-04', // Default start date
      endDate: '2025-02-15', // Default end date
      status: subject.exam_schedules?.[0]?.exam_date ? 'scheduled' : 'pending',
    }));
  },

  // Get subjects by teacher (staff member)
  async getExamsByTeacher(teacherId: string): Promise<Exam[]> {
    // For now, return all subjects since we don't have teacher assignments yet
    const { data, error } = await supabase
      .from('subject_detail')
      .select(`
        *,
        exam_schedules(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(subject => ({
      id: subject.id,
      subjectCode: subject.subcode,
      subjectName: subject.name,
      courseId: subject.subcode,
      department: subject.department,
      year: subject.year,
      semester: 8,
      teacherId: teacherId,
      teacherName: '', // Will need to fetch from staff_details
      scheduledDate: subject.exam_schedules?.[0]?.exam_date || null,
      startDate: '2025-02-04',
      endDate: '2025-02-15',
      status: subject.exam_schedules?.[0]?.exam_date ? 'scheduled' : 'pending',
    }));
  },

  // Schedule an exam with conflict checking
  async scheduleExam(subjectId: string, examDate: string, examTime: string, assignedBy: string): Promise<void> {
    // First, check for conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from('exam_schedules')
      .select('*')
      .eq('exam_date', examDate)
      .eq('exam_time', examTime);

    if (conflictError) {
      throw new Error(conflictError.message);
    }

    if (conflicts && conflicts.length > 0) {
      throw new Error(`Conflict detected: Another exam is already scheduled on ${examDate} at ${examTime}`);
    }

    // Get the subject details
    const { data: subject, error: subjectError } = await supabase
      .from('subject_detail')
      .select('*')
      .eq('id', subjectId)
      .single();

    if (subjectError) {
      throw new Error(subjectError.message);
    }

    // Create the exam schedule
    const { error: scheduleError } = await supabase
      .from('exam_schedules')
      .insert([{
        subject_id: subjectId,
        exam_date: examDate,
        exam_time: examTime,
        department_id: '68b9d385-c948-490e-86c3-dc9e4d24a94e', // Computer Science default
        assigned_by: assignedBy,
        is_shared: false,
        priority_department: null,
      }]);

    if (scheduleError) {
      throw new Error(scheduleError.message);
    }
  },

  // Get scheduled exams for admin dashboard
  async getScheduledExams(): Promise<any[]> {
    const { data, error } = await supabase
      .from('exam_schedules')
      .select(`
        *,
        subject_detail(*)
      `)
      .order('exam_date', { ascending: true })
      .order('exam_time', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(schedule => ({
      id: schedule.id,
      subjectId: schedule.subject_id,
      subjectName: schedule.subject_detail?.name || 'Unknown Subject',
      subjectCode: schedule.subject_detail?.subcode || 'Unknown',
      department: schedule.subject_detail?.department || 'Unknown',
      examDate: schedule.exam_date,
      examTime: schedule.exam_time,
      assignedBy: schedule.assigned_by,
      isShared: schedule.is_shared,
      priorityDepartment: schedule.priority_department,
    }));
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

  // Create subject (mapped to Exam interface)
  async createExam(examData: Omit<Exam, 'id'>): Promise<Exam> {
    const { data, error } = await supabase
      .from('subject_detail')
      .insert([{
        subcode: examData.subjectCode,
        name: examData.subjectName,
        department: examData.department,
        year: examData.year,
        is_shared: false,
        shared_subject_code: null,
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      subjectCode: data.subcode,
      subjectName: data.name,
      courseId: data.subcode,
      department: data.department,
      year: data.year,
      semester: 8,
      teacherId: examData.teacherId,
      teacherName: examData.teacherName,
      scheduledDate: examData.scheduledDate,
      startDate: examData.startDate,
      endDate: examData.endDate,
      status: examData.status,
    };
  },

  // Update subject
  async updateExam(examId: string, updates: Partial<Exam>): Promise<Exam> {
    const updateData: any = {};
    
    if (updates.subjectCode) updateData.subcode = updates.subjectCode;
    if (updates.subjectName) updateData.name = updates.subjectName;
    if (updates.department) updateData.department = updates.department;
    if (updates.year) updateData.year = updates.year;

    const { data, error } = await supabase
      .from('subject_detail')
      .update(updateData)
      .eq('id', examId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      subjectCode: data.subcode,
      subjectName: data.name,
      courseId: data.subcode,
      department: data.department,
      year: data.year,
      semester: 8,
      teacherId: updates.teacherId || '',
      teacherName: updates.teacherName || '',
      scheduledDate: updates.scheduledDate || null,
      startDate: updates.startDate || '2025-02-04',
      endDate: updates.endDate || '2025-02-15',
      status: updates.status || 'pending',
    };
  },

  // Delete subject
  async deleteExam(examId: string): Promise<void> {
    const { error } = await supabase
      .from('subject_detail')
      .delete()
      .eq('id', examId);

    if (error) {
      throw new Error(error.message);
    }
  },

  // Get exam settings (mapped to ExamAlert interface)
  async getExamAlerts(): Promise<ExamAlert[]> {
    const { data, error } = await supabase
      .from('exam_settings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(setting => ({
      id: setting.id,
      title: `Exam Settings - ${setting.exam_start_date} to ${setting.exam_end_date}`,
      startDate: setting.exam_start_date,
      endDate: setting.exam_end_date,
      year: 4, // Default year
      semester: 8, // Default semester
      departments: [], // Will need to be derived from other data
      status: 'active',
      createdAt: setting.created_at,
    }));
  },

  // Create exam setting
  async createExamAlert(alertData: Omit<ExamAlert, 'id' | 'createdAt'>): Promise<ExamAlert> {
    const { data, error } = await supabase
      .from('exam_settings')
      .insert([{
        exam_start_date: alertData.startDate,
        exam_end_date: alertData.endDate,
        holidays: [],
        created_by: '', // Will need to be set from current user
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      title: `Exam Settings - ${data.exam_start_date} to ${data.exam_end_date}`,
      startDate: data.exam_start_date,
      endDate: data.exam_end_date,
      year: 4,
      semester: 8,
      departments: [],
      status: 'active',
      createdAt: data.created_at,
    };
  },

  // Update exam setting
  async updateExamAlert(alertId: string, updates: Partial<ExamAlert>): Promise<ExamAlert> {
    const updateData: any = {};
    
    if (updates.startDate) updateData.exam_start_date = updates.startDate;
    if (updates.endDate) updateData.exam_end_date = updates.endDate;

    const { data, error } = await supabase
      .from('exam_settings')
      .update(updateData)
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      title: `Exam Settings - ${data.exam_start_date} to ${data.exam_end_date}`,
      startDate: data.exam_start_date,
      endDate: data.exam_end_date,
      year: 4,
      semester: 8,
      departments: [],
      status: 'active',
      createdAt: data.created_at,
    };
  },
}; 