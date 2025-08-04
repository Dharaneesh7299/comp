'use client';

import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import pRetry from 'p-retry';
import { Users, Plus, Search, Edit, Trash2, Save, X, Hash, Mail, GraduationCap, Calendar } from 'lucide-react';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMajor, setFilterMajor] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    registrationNo: '',
    year: '',
    major: '',
  });

  // Fetch students with retry and debounce
  const fetchStudents = useCallback(
    debounce(async (signal) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await pRetry(
          () =>
            axios.get('https://comp-kyir.onrender.com/api/teacher/getstudent', {
              signal,
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                Pragma: 'no-cache',
                Expires: '0',
              },
            }),
          { retries: 3, minTimeout: 1000, maxTimeout: 5000 }
        );

        if (!response.data.students) {
          throw new Error('No students data received from server');
        }

        const fetchedStudents = response.data.students.map((student) => ({
          id: student.id,
          name: student.name,
          email: student.email,
          registrationNo: student.registerno,
          year: student.year,
          major: student.department,
          registeredAt: student.createdAt,
        }));
        setStudents(fetchedStudents);
        console.log('Fetched students:', fetchedStudents);
      } catch (error) {
        if (error.name === 'CanceledError') {
          console.log('Fetch request canceled');
          return;
        }
        console.error('Error fetching students:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        setError(error.response?.data?.message || 'Failed to load students. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchStudents(controller.signal);
    return () => {
      controller.abort();
      fetchStudents.cancel();
    };
  }, [fetchStudents]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      registrationNo: '',
      year: '',
      major: '',
    });
    setShowAddForm(false);
    setEditingStudent(null);
    setFormError(null);
  };

  const handleAddStudent = () => {
    setShowAddForm(true);
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      registrationNo: '',
      year: '',
      major: '',
    });
    setFormError(null);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student.id);
    setFormData({
      name: student.name,
      email: student.email,
      registrationNo: student.registrationNo,
      year: student.year,
      major: student.major,
    });
    setShowAddForm(true);
    setFormError(null);
  };

  const handleSaveStudent = async () => {
    if (!formData.name || !formData.email || !formData.registrationNo || !formData.year || !formData.major) {
      setFormError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setFormError(null);

    const submitData = {
      id: editingStudent,
      name: formData.name,
      email: formData.email,
      registerno: formData.registrationNo,
      year: formData.year,
      department: formData.major,
    };

    try {
      let response;
      if (editingStudent) {
        response = await pRetry(
          () => axios.put('https://comp-kyir.onrender.com/api/teacher/updatestudent', submitData),
          { retries: 3, minTimeout: 1000, maxTimeout: 5000 }
        );
        const updatedStudent = {
          id: response.data.student.id,
          name: response.data.student.name,
          email: response.data.student.email,
          registrationNo: response.data.student.registerno,
          year: response.data.student.year,
          major: response.data.student.department,
          registeredAt: response.data.student.createdAt,
        };
        setStudents((prev) =>
          prev.map((student) => (student.id === updatedStudent.id ? updatedStudent : student))
        );
      } else {
        response = await pRetry(
          () => axios.post('https://comp-kyir.onrender.com/api/teacher/addstudent', submitData),
          { retries: 3, minTimeout: 1000, maxTimeout: 5000 }
        );
        const newStudent = {
          id: response.data.student.id,
          name: response.data.student.name,
          email: response.data.student.email,
          registrationNo: response.data.student.registerno,
          year: response.data.student.year,
          major: response.data.student.department,
          registeredAt: response.data.student.createdAt,
        };
        setStudents((prev) => [...prev, newStudent]);
      }
      resetForm();
    } catch (error) {
      console.error(`Error ${editingStudent ? 'updating' : 'adding'} student:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setFormError(
        error.response?.data?.message || `Failed to ${editingStudent ? 'update' : 'add'} student. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setDeletingId(studentId);
      setIsLoading(true);
      try {
        const response = await pRetry(
          () => axios.delete('https://comp-kyir.onrender.com/api/teacher/deletestudent', { data: { id: studentId } }),
          { retries: 3, minTimeout: 1000, maxTimeout: 5000 }
        );
        if (response.data.message === 'Student deleted successfully') {
          setStudents((prev) => prev.filter((student) => student.id !== studentId));
          console.log('Student deleted:', studentId);
        } else {
          throw new Error(response.data.message || 'Failed to delete student');
        }
      } catch (error) {
        console.error('Error deleting student:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        setError(error.response?.data?.message || 'Failed to delete student. Please try again.');
      } finally {
        setDeletingId(null);
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = !filterYear || student.year === filterYear;
    const matchesMajor = !filterMajor || student.major.toLowerCase().includes(filterMajor.toLowerCase());

    return matchesSearch && matchesYear && matchesMajor;
  });

  const uniqueYears = [...new Set(students.map((s) => s.year))].sort();
  const uniqueMajors = [...new Set(students.map((s) => s.major))].sort();

  const departmentOptions = ['IT', 'CSE', 'AIDS', 'AIML', 'ECE', 'EEE', 'MECH'];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
            <p className="text-gray-600">Add, edit, and manage student registrations</p>
          </div>
        </div>
        <button
          onClick={handleAddStudent}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, email, or registration number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>
          <div>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">All Years</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterMajor}
              onChange={(e) => setFilterMajor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">All Majors</option>
              {uniqueMajors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Student Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-md border p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{formError}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter student's full name"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="student@university.edu"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
                <input
                  type="text"
                  value={formData.registrationNo}
                  onChange={(e) => handleInputChange('registrationNo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="CS2021001"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                <select
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                >
                  <option value="">Select Year</option>
                  <option value="first_Year">1st Year</option>
                  <option value="second_Year">2nd Year</option>
                  <option value="third_Year">3rd Year</option>
                  <option value="fourth_Year">4th Year</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  value={formData.major}
                  onChange={(e) => handleInputChange('major', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStudent}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 text-white mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{editingStudent ? 'Update Student' : 'Add Student'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="ml-3 text-gray-700">Loading...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => fetchStudents(new AbortController().signal)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Students ({filteredStudents.length})</h2>
              {(searchTerm || filterYear || filterMajor) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterYear('');
                    setFilterMajor('');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                >
                  <X className="h-3 w-3" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {student.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Hash className="h-3 w-3 mr-1 text-gray-400" />
                        <span className="font-mono">{student.registrationNo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                        {student.year}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <GraduationCap className="h-3 w-3 mr-1 text-gray-400" />
                        {student.major}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                          disabled={deletingId === student.id || isLoading}
                        >
                          {deletingId === student.id ? (
                            <svg
                              className="animate-spin h-4 w-4 text-red-600"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterYear || filterMajor ? 'No students found' : 'No students yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterYear || filterMajor
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by adding your first student to the system'}
              </p>
              {!(searchTerm || filterYear || filterMajor) && (
                <button
                  onClick={handleAddStudent}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  disabled={isLoading}
                >
                  Add First Student
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}