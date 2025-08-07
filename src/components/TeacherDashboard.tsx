import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExams } from '../context/ExamContext';
import { Exam } from '../types';
import { Calendar, Clock, BookOpen, CheckCircle, AlertTriangle, Home, Building, Bell, User, LogOut, FileText } from 'lucide-react';
import { ExamScheduler } from './ExamScheduler';
import { mockExamService } from '../services/mockExamService';

export const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { exams, updateExam } = useExams();
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subjects' | 'schedule' | 'notifications'>('dashboard');
  const [teacherExams, setTeacherExams] = useState<Exam[]>([]);
  const [scheduledExams, setScheduledExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load teacher's subjects and scheduled exams
  useEffect(() => {
    const loadTeacherData = async () => {
      if (user?.id) {
        try {
          const teacherSubjects = await mockExamService.getExamsByTeacher(user.id);
          const teacherScheduled = await mockExamService.getScheduledExamsByTeacher(user.id);
          setTeacherExams(teacherSubjects);
          setScheduledExams(teacherScheduled);
        } catch (error) {
          console.error('Error loading teacher data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadTeacherData();
  }, [user?.id]);

  const pendingExams = teacherExams.filter(exam => exam.status === 'pending');

  const handleScheduleExam = (examId: string, date: string) => {
    // Update the exam using the shared context
    updateExam(examId, { scheduledDate: date, status: 'scheduled' });
    setSelectedExam(null);
  };

  const completionRate = teacherExams.length > 0 ? Math.round((scheduledExams.length / teacherExams.length) * 100) : 0;
  
  const stats = [
    { label: 'Available Subjects', value: teacherExams.length.toString(), icon: BookOpen, color: 'text-blue-600 bg-blue-100', progress: 0 },
    { label: 'Scheduled Exams', value: scheduledExams.length.toString(), icon: Calendar, color: 'text-green-600 bg-green-100', progress: 0 },
    { label: 'Pending Schedules', value: pendingExams.length.toString(), icon: Clock, color: 'text-orange-600 bg-orange-100', progress: 0 },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: FileText, color: 'text-purple-600 bg-purple-100', progress: completionRate }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* User Profile */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{user?.name?.charAt(0) || 'T'}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user?.name || 'Teacher'}</h3>
              <p className="text-sm text-gray-600">{user?.department || 'Department'}</p>
              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mt-1">Faculty Member</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('subjects')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'subjects' 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span>My Subjects</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'schedule' 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="h-5 w-5" />
                <span>Schedule Exams</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'notifications' 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 space-y-1">
            <p>Chennai Institute of Technology</p>
            <p>Examination Management System</p>
            <p>TNEA Code: 1399</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">CIT</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chennai Institute of Technology</h1>
                <p className="text-sm text-gray-600">Examination Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Faculty Member</span>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-700">{user?.name || 'Teacher'}</span>
              </div>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Home className="h-4 w-4" />
            <span>/</span>
            <span>Faculty Portal</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Teacher Dashboard</span>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Faculty Dashboard</h1>
                    <p className="text-blue-100 mb-1">Schedule your examinations and view assignments</p>
                    <p className="text-blue-200 text-sm">Chennai Institute of Technology • Examination Management System</p>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold">12 Departments</div>
                    <div className="text-2xl font-bold">150+ Faculty</div>
                    <div className="text-2xl font-bold">3000+ Students</div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mb-2">
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stat.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Content Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Latest examination alerts and schedules</p>
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                </div>

                {/* My Department */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Building className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">My Department</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Your department status</p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-blue-900">{user?.department || 'Department'}</p>
                      <p className="text-sm text-blue-700">Your Department</p>
                      <p className="text-sm text-green-600 font-medium">✓ Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subjects Tab */}
          {activeTab === 'subjects' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">My Subjects</h2>
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Available Subjects ({teacherExams.length})</h3>
                </div>
                {teacherExams.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-gray-500">No subjects available</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {teacherExams.map((exam) => (
                      <div key={exam.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-base font-medium text-gray-900">
                                {exam.subjectName}
                              </h3>
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                {exam.subjectCode}
                              </span>
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                Year {exam.year} • Sem {exam.semester}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Department: {exam.department} • Course ID: {exam.courseId}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Status: {exam.status === 'scheduled' ? 'Scheduled' : 'Available for scheduling'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              exam.status === 'scheduled' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {exam.status === 'scheduled' ? 'Scheduled' : 'Available'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Schedule Exams</h2>
              
              {/* Pending Exams Section */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Exams Requiring Schedule ({pendingExams.length})
                    </h3>
                  </div>
                </div>
                
                {pendingExams.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-gray-500">No pending exams to schedule</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {pendingExams.map((exam) => (
                      <div key={exam.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-base font-medium text-gray-900">
                                {exam.subjectName}
                              </h3>
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                {exam.subjectCode}
                              </span>
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                Year {exam.year} • Sem {exam.semester}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Department: {exam.department} • Course ID: {exam.courseId}
                            </p>
                            <p className="text-sm text-gray-600">
                              Schedule between: {exam.startDate} - {exam.endDate}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedExam(exam)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Schedule Date
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scheduled Exams Section */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Scheduled Exams ({scheduledExams.length})
                    </h3>
                  </div>
                </div>
                
                {scheduledExams.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-gray-500">No scheduled exams yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {scheduledExams.map((exam) => (
                      <div key={exam.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-base font-medium text-gray-900">
                                {exam.subjectName}
                              </h3>
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                {exam.subjectCode}
                              </span>
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                Year {exam.year} • Sem {exam.semester}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Department: {exam.department} • Course ID: {exam.courseId}
                            </p>
                            <p className="text-sm font-medium text-green-600">
                              Scheduled for: {exam.scheduledDate}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              Confirmed
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Exam Scheduler Modal */}
              {selectedExam && (
                <ExamScheduler
                  exam={selectedExam}
                  onClose={() => setSelectedExam(null)}
                  onSchedule={handleScheduleExam}
                />
              )}
            </div>
          )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No new notifications</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};