import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import { departments } from '../data/mockData';
import { mockExamService } from '../services/mockExamService';

export const PDFGenerator: React.FC = () => {
  const [generating, setGenerating] = useState(false);
  const [selectedYear, setSelectedYear] = useState('4');
  const [selectedExam, setSelectedExam] = useState('IA2');
  const [scheduledExams, setScheduledExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load scheduled exams
  useEffect(() => {
    const loadScheduledExams = async () => {
      try {
        const exams = await mockExamService.getScheduledExams();
        setScheduledExams(exams);
      } catch (error) {
        console.error('Error loading scheduled exams:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScheduledExams();
  }, []);

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      
      // Set initial position
      let yPosition = 20;
      
      // Header with CIT Logo and Details
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 139); // Dark blue color
      pdf.text('CHENNAI INSTITUTE OF TECHNOLOGY', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('(Autonomous)', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 8;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('OFFICE OF THE CONTROLLER OF EXAMINATIONS', pageWidth / 2, yPosition, { align: 'center' });
      
      // Reference and date
      yPosition += 15;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Ref: CIT/COE/2025-26/ODD/001', 20, yPosition);
      pdf.text(new Date().toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }), pageWidth - 20, yPosition, { align: 'right' });
      
      // Circular title
      yPosition += 15;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CIRCULAR', pageWidth / 2, yPosition, { align: 'center' });
      
      // Subject line
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const yearText = selectedYear === '2' ? 'II Year' : selectedYear === '3' ? 'III Year' : 'IV Year';
      const examTypeText = selectedExam === 'IA1' ? 'Internal Assessment-I' : 
                          selectedExam === 'IA2' ? 'Internal Assessment-II' :
                          selectedExam === 'IA3' ? 'Internal Assessment-III' :
                          selectedExam === 'Model' ? 'Model Examination' :
                          'End Semester Examination';
      pdf.text(`Sub: ${examTypeText} - ${yearText} Students`, 20, yPosition);
      
      // Circular content
      yPosition += 10;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const circularText = `The ${examTypeText.toLowerCase()} for ${yearText.toLowerCase()} students will commence from 04.02.2025 onwards. The marks secured in this examination will be considered for internal evaluation. All students are hereby informed to prepare for the examinations as per the schedule given below.`;
      
      const lines = pdf.splitTextToSize(circularText, pageWidth - 40);
      pdf.text(lines, 20, yPosition);
      
      yPosition += (lines.length * 5) + 10;
      
      // Examination Schedule Table
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXAMINATION SCHEDULE', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 8;
      
      // Create examination schedule data
      const scheduleData = createExamSchedule();
      
      // Table header
      const tableStartY = yPosition;
      const cellHeight = 10; // Increased height to accommodate time
      const dateColWidth = 25;
      const deptColWidth = (pageWidth - 40 - dateColWidth) / departments.length;
      const tableWidth = dateColWidth + (departments.length * deptColWidth);
      const tableStartX = (pageWidth - tableWidth) / 2;
      
      // Header row
      pdf.setFillColor(240, 240, 240);
      pdf.rect(tableStartX, tableStartY, tableWidth, cellHeight, 'F');
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATE', tableStartX + 5, tableStartY + 6);
      
      departments.forEach((dept, index) => {
        const xPos = tableStartX + dateColWidth + (index * deptColWidth);
        pdf.text(dept.code, xPos + 2, tableStartY + 6);
      });
      
      // Table rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      
      scheduleData.forEach((row, rowIndex) => {
        const rowY = tableStartY + (rowIndex + 1) * cellHeight;
        
        // Date column
        pdf.rect(tableStartX, rowY, dateColWidth, cellHeight);
        pdf.text(row.date, tableStartX + 5, rowY + 6);
        
        // Department columns
        departments.forEach((dept, deptIndex) => {
          const xPos = tableStartX + dateColWidth + (deptIndex * deptColWidth);
          pdf.rect(xPos, rowY, deptColWidth, cellHeight);
          
          const subject = row.subjects[dept.code];
          if (subject) {
            // Split subject code and name for better fit
            const subjectCode = subject.code;
            const subjectName = subject.name.substring(0, 8); // Truncate long names
            const examTime = subject.time.substring(0, 5); // Format time (HH:MM)
            pdf.text(subjectCode, xPos + 2, rowY + 2);
            pdf.text(subjectName, xPos + 2, rowY + 5);
            pdf.text(examTime, xPos + 2, rowY + 8);
          } else {
            pdf.text('-', xPos + 2, rowY + 6);
          }
        });
      });
      
      // Notes section
      const notesY = tableStartY + ((scheduleData.length + 1) * cellHeight) + 15;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('IMPORTANT NOTES:', 20, notesY);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const notes = [
        '1. Examination Duration: 08:00 AM to 09:30 AM (1½ hours)',
        '2. Students should be in the examination hall by 07:45 AM',
        '3. No student will be allowed after 08:00 AM',
        '4. Students must bring their ID cards and necessary stationery',
        '5. Mobile phones and electronic devices are strictly prohibited',
        '6. Seating arrangement will be displayed on the notice board',
        '7. For any queries, contact the respective department HOD'
      ];
      
      notes.forEach((note, index) => {
        pdf.text(note, 20, notesY + 10 + (index * 6));
      });
      
      // Copy to section
      const copyY = notesY + 60;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Copy to:', 20, copyY);
      
      pdf.setFont('helvetica', 'normal');
      const copyList = [
        '1. All Head of Departments',
        '2. All Class Coordinators',
        '3. Main Notice Board',
        '4. Student Notice Boards',
        '5. File Copy'
      ];
      
      copyList.forEach((item, index) => {
        pdf.text(item, 25, copyY + 10 + (index * 6));
      });
      
      // Signature block
      const sigY = copyY + 50;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Dr. A. RAMESH, M.E., Ph.D.', pageWidth - 80, sigY, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text('Principal', pageWidth - 80, sigY + 8, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text('CHENNAI INSTITUTE OF TECHNOLOGY (AUTONOMOUS)', pageWidth - 80, sigY + 16, { align: 'center' });
      pdf.text('Sarathy Nagar, Kundrathur, Chennai-600069', pageWidth - 80, sigY + 22, { align: 'center' });
      
      // Footer
      const footerY = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Generated on: ' + new Date().toLocaleString('en-GB'), pageWidth / 2, footerY, { align: 'center' });
      
      // Save the PDF
      const filename = `CIT_${examTypeText.replace(/\s+/g, '_')}_${yearText.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getSemesterForYear = (year: string) => {
    switch (year) {
      case '2': return 4; // II Year - 4th semester
      case '3': return 6; // III Year - 6th semester
      case '4': return 8; // IV Year - 8th semester
      default: return 8;
    }
  };

  const createExamSchedule = () => {
    const scheduleData = [];
    const selectedSemester = getSemesterForYear(selectedYear);
    
    // Filter scheduled exams by year/semester
    const filteredExams = scheduledExams.filter(exam => {
      // For now, we'll show all exams since the mock data doesn't have year filtering
      // In a real implementation, you would filter by year/semester
      return true;
    });
    
    // Determine the date range based on scheduled exams
    let startDate: Date;
    let endDate: Date;
    
    if (filteredExams.length > 0) {
      // Get the earliest and latest exam dates
      const examDates = filteredExams.map(exam => new Date(exam.examDate)).sort((a, b) => a.getTime() - b.getTime());
      startDate = new Date(examDates[0]);
      endDate = new Date(examDates[examDates.length - 1]);
      
      // Extend the range by a few days before and after for better presentation
      startDate.setDate(startDate.getDate() - 2);
      endDate.setDate(endDate.getDate() + 2);
    } else {
      // Default range if no exams are scheduled
      startDate = new Date('2025-02-04');
      endDate = new Date('2025-02-28'); // Extended to end of February
    }
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Skip weekends
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        const dateStr = d.toISOString().split('T')[0];
        const dateFormatted = d.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
        
        const subjects: { [key: string]: { code: string; name: string; time: string } } = {};
        
        // Get exams scheduled for this date
        const examsOnDate = filteredExams.filter(exam => exam.examDate === dateStr);
        
        // Assign subjects to departments
        departments.forEach(dept => {
          const examForDept = examsOnDate.find(exam => exam.department === dept.code);
          if (examForDept) {
            subjects[dept.code] = {
              code: examForDept.subjectCode,
              name: examForDept.subjectName,
              time: examForDept.examTime
            };
          }
        });
        
        scheduleData.push({
          date: dateFormatted,
          subjects
        });
      }
    }
    
    return scheduleData;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Examination Timetable PDF</h3>
        <p className="text-gray-600 mb-6">Create official CIT examination circular with complete schedule.</p>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">PDF Preview</h4>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading scheduled exams...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="2">II Year</option>
                    <option value="3">III Year</option>
                    <option value="4">IV Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Examination Type
                  </label>
                  <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {selectedYear === '2' && (
                      <>
                        <option value="IA1">IA1 - Internal Assessment I</option>
                        <option value="IA2">IA2 - Internal Assessment II</option>
                        <option value="IA3">IA3 - Internal Assessment III</option>
                      </>
                    )}
                    {selectedYear === '3' && (
                      <>
                        <option value="IA1">IA1 - Internal Assessment I</option>
                        <option value="IA2">IA2 - Internal Assessment II</option>
                        <option value="IA3">IA3 - Internal Assessment III</option>
                      </>
                    )}
                    {selectedYear === '4' && (
                      <>
                        <option value="IA2">IA2 - Internal Assessment II</option>
                        <option value="Model">Model Examination</option>
                        <option value="End-Semester">End Semester Examination</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-blue-800">PDF Features</h5>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Official CIT letterhead and branding</li>
                      <li>• Professional examination schedule table</li>
                      <li>• Important notes and instructions</li>
                      <li>• Official signature and contact details</li>
                      <li>• Proper formatting and layout</li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Selected:</span> {selectedYear === '2' ? 'II Year' : selectedYear === '3' ? 'III Year' : 'IV Year'} - {selectedExam}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduled Exams Preview */}
              {scheduledExams.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-medium text-green-800">Scheduled Exams ({scheduledExams.length})</h5>
                      <div className="text-sm text-green-700 mt-2 space-y-1">
                        {scheduledExams.slice(0, 3).map((exam, index) => (
                          <div key={exam.id} className="flex justify-between">
                            <span>{exam.subjectName} ({exam.subjectCode})</span>
                            <span className="text-green-600 font-medium">
                              {new Date(exam.examDate).toLocaleDateString()} at {exam.examTime.substring(0, 5)}
                            </span>
                          </div>
                        ))}
                        {scheduledExams.length > 3 && (
                          <div className="text-green-600 font-medium">
                            +{scheduledExams.length - 3} more exams...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {scheduledExams.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-medium text-yellow-800">No Scheduled Exams</h5>
                      <p className="text-sm text-yellow-700 mt-1">
                        No exams have been scheduled yet. Teachers can schedule exams from their dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={generatePDF}
                  disabled={generating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};