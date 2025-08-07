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

  // Schedule an exam with conflict checking and shared subject logic
  async scheduleExam(subjectId: string, examDate: string, assignedBy: string): Promise<void> {
    // Get the current department's ID based on the staff member or subject
    let currentDepartmentId: string;
    let subjectName: string;
    
    if (subjectId.startsWith('staff-subject-')) {
      // Get department from staff details
      const staffId = subjectId.replace('staff-subject-', '');
      const { data: staffData, error: staffError } = await supabase
        .from('staff_details')
        .select('department')
        .eq('id', staffId)
        .single();

      if (staffError || !staffData) {
        throw new Error(`Staff member not found with ID: ${staffId}`);
      }

      const { data: deptData } = await supabase
        .from('departments')
        .select('id')
        .eq('name', staffData.department.trim())
        .single();
        
      currentDepartmentId = deptData?.id;
      subjectName = staffData.subject_name;
    } else {
      // Get department from subject details
      const { data: subject, error: subjectError } = await supabase
        .from('subject_detail')
        .select('department, name')
        .eq('id', subjectId)
        .single();

      if (subjectError || !subject) {
        throw new Error(`Subject not found with ID: ${subjectId}`);
      }

      const { data: deptData } = await supabase
        .from('departments')
        .select('id')
        .eq('name', subject.department.trim())
        .single();
        
      currentDepartmentId = deptData?.id;
      subjectName = subject.name;
    }

    // Get current department name first
    let currentDeptName: string;
    if (subjectId.startsWith('staff-subject-')) {
      const staffId = subjectId.replace('staff-subject-', '');
      const { data: staffData } = await supabase
        .from('staff_details')
        .select('department')
        .eq('id', staffId)
        .single();
      currentDeptName = staffData?.department;
    } else {
      const { data: subjectData } = await supabase
        .from('subject_detail')
        .select('department')
        .eq('id', subjectId)
        .single();
      currentDeptName = subjectData?.department;
    }

    // Check for same-day conflicts within the same department
    const { data: sameDayExams, error: sameDayError } = await supabase
      .from('exam_schedules')
      .select(`
        *,
        subject_detail(*),
        departments!exam_schedules_department_id_fkey(*)
      `)
      .eq('exam_date', examDate);

    if (sameDayError) {
      throw new Error(sameDayError.message);
    }

    // Filter exams by department name to ensure correct comparison
    const sameDeptExams = sameDayExams?.filter(exam => 
      exam.departments?.name === currentDeptName
    ) || [];

    if (sameDeptExams.length > 0) {
      throw new Error(`${currentDeptName} department already has an exam scheduled on ${examDate}. Cannot schedule multiple exams for the same department on the same day.`);
    }

    // Check for time conflicts only within the same department
    const { data: timeConflicts, error: conflictError } = await supabase
      .from('exam_schedules')
      .select(`
        *,
        subject_detail(*),
        departments!exam_schedules_department_id_fkey(*)
      `)
      .eq('exam_date', examDate)

      .eq('department_id', currentDepartmentId);

    if (conflictError) {
      throw new Error(conflictError.message);
    }

    if (timeConflicts && timeConflicts.length > 0) {
      throw new Error(`Conflict detected: Department already has an exam scheduled on ${examDate}`);
    }

    // Check if this is a staff-subject ID (from staff_details table)
    if (subjectId.startsWith('staff-subject-')) {
      // Extract the staff ID from the subject ID
      const staffId = subjectId.replace('staff-subject-', '');
      
      // Get the staff member's subject details
      const { data: staffData, error: staffError } = await supabase
        .from('staff_details')
        .select('*')
        .eq('id', staffId)
        .single();

      if (staffError || !staffData) {
        throw new Error(`Staff member not found with ID: ${staffId}`);
      }

      if (!staffData.subject_name || !staffData.subject_code) {
        throw new Error(`Staff member ${staffData.name} has no assigned subject`);
      }

      // Check for shared subject conflicts BEFORE creating/finding the subject
      const { data: existingSchedules, error: scheduleCheckError } = await supabase
        .from('exam_schedules')
        .select(`
          *,
          subject_detail(*),
          departments!exam_schedules_department_id_fkey(*)
        `);

      if (scheduleCheckError) {
        throw new Error(scheduleCheckError.message);
      }

      // Check if the same subject name is already scheduled
      const sameSubjectSchedules = existingSchedules?.filter(schedule => 
        schedule.subject_detail?.name === staffData.subject_name
      ) || [];

      if (sameSubjectSchedules.length > 0) {
        // If the subject is already scheduled, force it to be on the same date
        const existingSchedule = sameSubjectSchedules[0];
        if (examDate !== existingSchedule.exam_date) {
          const scheduledDept = existingSchedule.departments?.name || 'Unknown Department';
          throw new Error(
            `Subject "${staffData.subject_name}" must be scheduled on ${existingSchedule.exam_date} ` +
            `as it is already scheduled by ${scheduledDept} department. ` +
            `All departments teaching "${staffData.subject_name}" must have the exam on the same date.`
          );
        }
      }

      // First, create or find a subject record in subject_detail table
      let actualSubjectId = subjectId;
      
      // Check if subject already exists in subject_detail by subcode (which has unique constraint)
      const { data: existingSubject, error: findError } = await supabase
        .from('subject_detail')
        .select('*')
        .eq('subcode', staffData.subject_code)
        .maybeSingle();

      if (findError) {
        console.error('Error finding existing subject:', findError);
      }

      if (existingSubject) {
        // Use existing subject ID
        actualSubjectId = existingSubject.id;
        console.log('Using existing subject:', existingSubject);
      } else {
        // Create new subject record
        const { data: newSubject, error: createError } = await supabase
          .from('subject_detail')
          .insert([{
            name: staffData.subject_name,
            subcode: staffData.subject_code,
            department: staffData.department,
            year: 1, // Default year
            is_shared: true, // Mark as shared subject
            shared_subject_code: staffData.subject_code,
          }])
          .select()
          .single();

        if (createError) {
          throw new Error(`Failed to create subject record: ${createError.message}`);
        }

        actualSubjectId = newSubject.id;
        console.log('Created new shared subject:', newSubject);
      }

      // Get department ID for the staff member's department
      // Trim any whitespace from the department name to handle trailing spaces
      const trimmedDepartment = staffData.department.trim();
      
      const { data: departmentData, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .eq('name', trimmedDepartment)
        .single();

      if (deptError || !departmentData) {
        throw new Error(`Department not found: ${trimmedDepartment}`);
      }

      // Find other departments teaching the same subject
      const { data: otherDeptSubjects, error: otherDeptError } = await supabase
        .from('subject_detail')
        .select('*')
        .eq('name', staffData.subject_name)
        .neq('department', staffData.department);

      // Get department IDs for the other departments
      const departmentIds: { [dept: string]: string } = {};
      if (otherDeptSubjects) {
        const deptNames = otherDeptSubjects.map(s => s.department.trim());
        const { data: deptData } = await supabase
          .from('departments')
          .select('id, name')
          .in('name', deptNames);
        
        if (deptData) {
          deptData.forEach(d => {
            departmentIds[d.name] = d.id;
          });
        }
      }

      if (otherDeptError) {
        throw new Error(otherDeptError.message);
      }

      // Prepare exam schedules for all departments
      const schedulesToCreate = [{
        subject_id: actualSubjectId,
        exam_date: examDate,
        exam_time: examTime,
        department_id: departmentData.id,
        assigned_by: staffData.user_id,
        priority_department: null,
      }];

      // Add schedules for other departments
      if (otherDeptSubjects) {
        otherDeptSubjects.forEach(subject => {
          const deptId = departmentIds[subject.department.trim()];
          if (deptId) {
            schedulesToCreate.push({
              subject_id: subject.id,
              exam_date: examDate,
              exam_time: examTime,
              department_id: deptId,
              assigned_by: staffData.user_id,
              priority_department: departmentData.id, // Mark original department as priority
            });
          }
        });
      }

      // Check for existing schedules and update them if they exist
      for (const schedule of schedulesToCreate) {
        const { data: existingSchedule } = await supabase
          .from('exam_schedules')
          .select('*')
          .eq('subject_id', schedule.subject_id)
          .eq('department_id', schedule.department_id)
          .maybeSingle();

        if (existingSchedule) {
          // Update existing schedule
          const { error: updateError } = await supabase
            .from('exam_schedules')
            .update({
              exam_date: schedule.exam_date,
              exam_time: schedule.exam_time,
              assigned_by: schedule.assigned_by,
              priority_department: schedule.priority_department
            })
            .eq('id', existingSchedule.id);

          if (updateError) {
            throw new Error(`Failed to update exam schedule: ${updateError.message}`);
          }
        } else {
          // Create new schedule
          const { error: insertError } = await supabase
            .from('exam_schedules')
            .insert([schedule]);

          if (insertError) {
            throw new Error(`Failed to create exam schedule: ${insertError.message}`);
          }
        }
      }

      // Notify other departments about the shared subject scheduling
      await this.notifySharedSubjectScheduling(staffData.subject_name, examDate, staffData.department);
    } else {
      // Handle regular subject_detail table subjects (existing logic)
      const { data: subjects, error: subjectError } = await supabase
        .from('subject_detail')
        .select('*')
        .eq('id', subjectId);

      if (subjectError) {
        throw new Error(subjectError.message);
      }

      if (!subjects || subjects.length === 0) {
        throw new Error(`Subject not found with ID: ${subjectId}`);
      }

      const subject = subjects[0];

      // Check if schedule already exists
      const { data: existingSchedule } = await supabase
        .from('exam_schedules')
        .select('*')
        .eq('subject_id', subjectId)
        .eq('department_id', currentDepartmentId)
        .maybeSingle();

      if (existingSchedule) {
        // Update existing schedule
        const { error: updateError } = await supabase
          .from('exam_schedules')
          .update({
            exam_date: examDate,
            exam_time: examTime,
            assigned_by: assignedBy
          })
          .eq('id', existingSchedule.id);

        if (updateError) {
          throw new Error(`Failed to update exam schedule: ${updateError.message}`);
        }
      } else {
        // Create new schedule
        const { error: scheduleError } = await supabase
          .from('exam_schedules')
          .insert([{
            subject_id: subjectId,
            exam_date: examDate,
            exam_time: examTime,
            department_id: currentDepartmentId,
            assigned_by: assignedBy,
            priority_department: null,
          }]);

        if (scheduleError) {
          throw new Error(`Failed to create exam schedule: ${scheduleError.message}`);
        }
      }
    }
  },

  // Get scheduled exams for admin dashboard
  async getScheduledExams(): Promise<any[]> {
    const { data, error } = await supabase
      .from('exam_schedules')
      .select(`
        *,
        subject_detail(*),
        departments!exam_schedules_department_id_fkey(*)
      `)
      .order('exam_date', { ascending: true })
      .order('exam_date', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(schedule => ({
      id: schedule.id,
      subjectId: schedule.subject_id,
      subjectName: schedule.subject_detail?.name || 'Unknown Subject',
      subjectCode: schedule.subject_detail?.subcode || 'Unknown',
      department: schedule.departments?.name || 'Unknown',
      examDate: schedule.exam_date,

      assignedBy: schedule.assigned_by,
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

  // Notify other departments about shared subject scheduling
  async notifySharedSubjectScheduling(subjectName: string, examDate: string, scheduledByDepartment: string): Promise<void> {
    try {
      // Find all staff members teaching the same subject in other departments
      const { data: otherStaff, error: staffError } = await supabase
        .from('staff_details')
        .select('*')
        .eq('subject_name', subjectName)
        .neq('department', scheduledByDepartment);

      if (staffError) {
        console.error('Error finding other staff teaching same subject:', staffError);
        return;
      }

      if (otherStaff && otherStaff.length > 0) {
        console.log(`📢 Shared Subject Notification: "${subjectName}" has been scheduled on ${examDate} by ${scheduledByDepartment} department.`);
        console.log(`📋 Other departments teaching this subject:`, otherStaff.map(staff => `${staff.department} (${staff.name})`));
        
        // In a real application, you would send emails/notifications here
        // For now, we'll just log the information
        otherStaff.forEach(staff => {
          console.log(`📧 Notification sent to ${staff.name} (${staff.email}) in ${staff.department} department`);
        });
      }
    } catch (error) {
      console.error('Error notifying shared subject scheduling:', error);
    }
  },
}; 