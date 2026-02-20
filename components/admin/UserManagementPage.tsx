
import React, { useState, useMemo } from 'react';
import type { TeacherUser, StudentUser } from '../../types';

interface UserManagementPageProps {
  teachers: TeacherUser[];
  students: StudentUser[];
  t: (key: string) => string;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ teachers, students, t }) => {
  const [activeTab, setActiveTab] = useState('teachers');
  const [searchTerm, setSearchTerm] = useState('');

  const groupedAndFilteredTeachers = useMemo(() => {
    const filtered = teachers.filter(t => 
      t.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.reduce((acc, teacher) => {
        const dept = teacher.department || 'Uncategorized';
        if (!acc[dept]) {
            acc[dept] = [];
        }
        acc[dept].push(teacher);
        return acc;
    }, {} as { [key: string]: TeacherUser[] });
  }, [teachers, searchTerm]);


  const filteredStudents = useMemo(() => 
    students.filter(s => 
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.includes(searchTerm)
    ), [students, searchTerm]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('userManagement')}</h1>
        <p className="text-gray-500">View all users in the system</p>
      </header>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex border-b">
          <button onClick={() => setActiveTab('teachers')} className={`py-2 px-4 ${activeTab === 'teachers' ? 'border-b-2 border-spk-blue text-spk-blue font-semibold' : 'text-gray-500'}`}>Teachers ({teachers.length})</button>
          <button onClick={() => setActiveTab('students')} className={`py-2 px-4 ${activeTab === 'students' ? 'border-b-2 border-spk-blue text-spk-blue font-semibold' : 'text-gray-500'}`}>Students ({students.length})</button>
        </div>
        
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                {activeTab === 'teachers' ? (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                ) : (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID / Class</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeTab === 'teachers' && Object.keys(groupedAndFilteredTeachers).sort().map(department => (
                  <React.Fragment key={department}>
                      <tr className="bg-gray-100">
                          <th colSpan={3} className="px-6 py-2 text-left text-sm font-semibold text-spk-blue">
                              {department}
                          </th>
                      </tr>
                      {groupedAndFilteredTeachers[department].map(user => (
                          <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                      <img className="h-10 w-10 rounded-full object-cover" src={user.profileImageUrl} alt="" />
                                      <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.department}</td>
                          </tr>
                      ))}
                  </React.Fragment>
              ))}
              {activeTab === 'students' && filteredStudents.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full object-cover" src={user.profileImageUrl} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.studentId} / M.{user.grade}/{user.classroom}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {((activeTab === 'teachers' && Object.keys(groupedAndFilteredTeachers).length === 0) || (activeTab === 'students' && filteredStudents.length === 0)) && (
             <p className="text-center text-gray-500 py-8">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;