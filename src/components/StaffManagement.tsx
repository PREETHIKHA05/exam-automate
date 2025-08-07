import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
  phone: string;
}

export const StaffManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: 'cdf14a0f-80b9-40c0-84f3-5eff78bd613b',
      name: 'John Teacher',
      department: 'Information Technology',
      role: 'Teacher',
      email: 'teacher@example.com',
      phone: '+1234567891'
    },
    {
      id: '3f2a75d8-4aee-473a-bb5a-795104bc8c93',
      name: 'CS Teacher',
      department: 'Computer Science',
      role: 'Teacher',
      email: 'cs.teacher@example.com',
      phone: '+1234567892'
    },
    {
      id: '7d9785d2-be8b-40d1-b923-4f8685e968e7',
      name: 'System Administrator',
      department: 'Computer Science',
      role: 'Administrator',
      email: 'admin@example.com',
      phone: '+1234567890'
    }
  ]);

  const filteredStaff = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    return role === 'Administrator' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const handleEdit = (id: string) => {
    // TODO: Implement edit functionality
    console.log('Edit staff member:', id);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Delete staff member:', id);
  };

  const handleAddStaff = () => {
    // TODO: Implement add staff functionality
    console.log('Add new staff member');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-sm text-gray-600">Manage staff members and their roles</p>
        </div>
        <button
          onClick={handleAddStaff}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search staff by name, email, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STAFF MEMBER
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DEPARTMENT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROLE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CONTACT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                      <div className="text-sm text-gray-500">{staff.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{staff.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(staff.role)}`}>
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{staff.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{staff.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(staff.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(staff.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-500">No staff members found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}; 