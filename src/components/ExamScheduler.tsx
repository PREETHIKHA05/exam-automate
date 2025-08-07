import React, { useState } from 'react';
import { X, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { Exam } from '../types';
import { useExams } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';

interface ExamSchedulerProps {
  exam: Exam;
  onClose: () => void;
  onSchedule: (examId: string, date: string) => void;
}

export const ExamScheduler: React.FC<ExamSchedulerProps> = ({ exam, onClose, onSchedule }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('10:00:00');
  const [conflict, setConflict] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { exams, scheduleExam } = useExams();
  const { user } = useAuth();

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setConflict(null);
    
    // Check for conflicts
    const scheduledExams = exams.filter(e => e.status === 'scheduled' && e.scheduledDate === date);
    
    // Check for same department conflict
    const sameDeptConflict = scheduledExams.find(e => e.department === exam.department);
    if (sameDeptConflict) {
      setConflict(`Conflict: Another exam is already scheduled for ${exam.department} department on this date.`);
      return;
    }
    
    // Check for same subject name scheduling opportunity
    const sameSubjectScheduled = scheduledExams.find(e => e.subjectName === exam.subjectName);
    if (sameSubjectScheduled) {
      setConflict(`Info: Same subject "${exam.subjectName}" is already scheduled for ${sameSubjectScheduled.department} on this date.`);
      return;
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && !conflict?.includes('Conflict:') && user) {
      setLoading(true);
      try {
        await scheduleExam(exam.id, selectedDate, selectedTime, user.id);
        onSchedule(exam.id, selectedDate);
        onClose();
      } catch (error) {
        console.error('Error scheduling exam:', error);
        setConflict(`Error: ${error instanceof Error ? error.message : 'Failed to schedule exam'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Schedule Exam</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Exam Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">{exam.subjectName}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Subject Code: {exam.subjectCode}</p>
              <p>Course ID: {exam.courseId}</p>
              <p>Department: {exam.department}</p>
              <p>Year {exam.year} • Semester {exam.semester}</p>
            </div>
          </div>



                      {/* Date Selection */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Select Exam Date
                </label>
                <input
                  type="date"
                  required
                  min={exam.startDate}
                  max={exam.endDate}
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be between {exam.startDate} and {exam.endDate}
                </p>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Select Exam Time
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="09:00:00">09:00 AM</option>
                  <option value="10:00:00">10:00 AM</option>
                  <option value="11:00:00">11:00 AM</option>
                  <option value="14:00:00">02:00 PM</option>
                  <option value="15:00:00">03:00 PM</option>
                  <option value="16:00:00">04:00 PM</option>
                </select>
              </div>

            {/* Conflict Notice */}
            {conflict && (
              <div className={`border rounded-lg p-4 ${
                conflict.includes('Conflict:') 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start">
                  <AlertTriangle className={`h-5 w-5 mr-2 mt-0.5 ${
                    conflict.includes('Conflict:') ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <div>
                    <h4 className={`text-sm font-medium ${
                      conflict.includes('Conflict:') ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {conflict.includes('Conflict:') ? 'Scheduling Conflict' : 'Scheduling Information'}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      conflict.includes('Conflict:') ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      {conflict.replace('Conflict: ', '').replace('Info: ', '')}
                    </p>
                  </div>
                </div>
              </div>
            )}



            {/* Exam Time Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Exam Information</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Duration: 08:00 AM to 09:30 AM<br />
                    Students must be present by 07:45 AM
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedDate || conflict?.includes('Conflict:') || loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Scheduling...' : 'Schedule Exam'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};