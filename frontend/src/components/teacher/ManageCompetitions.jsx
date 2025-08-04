'use client';

import { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import pRetry from 'p-retry';
import { Search, Plus, Edit, Trash2, Eye, Calendar, MapPin, Users, Trophy, ExternalLink, Star } from 'lucide-react';

export default function ManageCompetitions() {
  const [competitions, setCompetitions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'REGISTRATION_OPEN',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    location: '',
    teamSize: 1,
    prizePool: '',
    priority: 'MEDIUM',
    url: '',
  });

  // Fetch competitions with retry and debounce
  const fetchCompetitions = debounce(async (signal) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await pRetry(
        () =>
          axios.get('https://comp-kyir.onrender.com/api/comp/get', {
            signal,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            },
          }),
        { retries: 3, minTimeout: 1000, maxTimeout: 5000 }
      );
      if (!response.data.g_comp) {
        throw new Error('No competitions data received from server');
      }
      const fetchedCompetitions = response.data.g_comp.map((comp) => ({
        id: comp.id,
        title: comp.name,
        description: comp.about,
        category: comp.category,
        status: comp.status,
        startDate: comp.startdate.split('T')[0],
        endDate: comp.enddate.split('T')[0],
        registrationDeadline: comp.deadline.split('T')[0],
        location: comp.location,
        teamSize: comp.team_size,
        prizePool: `$${comp.prize_pool.toLocaleString()}`,
        priority: comp.priority,
        url: comp.url || '',
        registrationCount: comp._count?.teams || 0,
      }));
      setCompetitions(fetchedCompetitions);
      console.log('Fetched competitions:', fetchedCompetitions);
    } catch (error) {
      if (error.name === 'CanceledError') {
        console.log('Fetch request canceled');
        return;
      }
      console.error('Error fetching competitions:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setError(
        error.response?.data?.message || 'Failed to load competitions. Please try again later.',
      );
    } finally {
      setIsLoading(false);
    }
  }, 500);

  useEffect(() => {
    const controller = new AbortController();
    fetchCompetitions(controller.signal);
    return () => {
      controller.abort();
      fetchCompetitions.cancel();
    };
  }, []);

  const getRegistrationCount = (competition) => {
    return competition.registrationCount || 0;
  };

  const getPriorityStars = (priority) => {
    const priorityLevels = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
    };
    const starCount = priorityLevels[priority] || 1;
    return (
      <div className="flex items-center space-x-1">
        {[...Array(3)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${index < starCount ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{priority}</span>
      </div>
    );
  };

  const filteredCompetitions = competitions.filter((competition) => {
    const matchesSearch =
      competition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competition.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || competition.status === statusFilter;
    console.log(`Filtering - statusFilter: ${statusFilter}, competition.status: ${competition.status}, matches: ${matchesStatus}`);
    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true); // Show loading during form submission
    const submitData = {
      id: editingCompetition ? editingCompetition.id : undefined,
      name: formData.title,
      url: formData.url,
      about: formData.description,
      category: formData.category,
      status: formData.status,
      startdate: new Date(formData.startDate).toISOString(),
      enddate: new Date(formData.endDate).toISOString(),
      deadline: new Date(formData.registrationDeadline).toISOString(),
      location: formData.location,
      team_size: Number.parseInt(formData.teamSize),
      prize_pool: parseInt(formData.prizePool.replace(/[^0-9]/g, '') || '0'),
      priority: formData.priority,
    };

    try {
      let response;
      if (editingCompetition) {
        response = await pRetry(
          () => axios.put('https://comp-kyir.onrender.com/api/comp/update', submitData),
          { retries: 3, minTimeout: 1000, maxTimeout: 5000 }
        );
        const updatedCompetition = {
          id: response.data.update.id,
          title: response.data.update.name,
          description: response.data.update.about,
          category: response.data.update.category,
          status: response.data.update.status,
          startDate: response.data.update.startdate.split('T')[0],
          endDate: response.data.update.enddate.split('T')[0],
          registrationDeadline: response.data.update.deadline.split('T')[0],
          location: response.data.update.location,
          teamSize: response.data.update.team_size,
          prizePool: `$${response.data.update.prize_pool.toLocaleString()}`,
          priority: response.data.update.priority,
          url: response.data.update.url || '',
          registrationCount: response.data.update._count?.teams || 0,
        };
        setCompetitions((prev) =>
          prev.map((comp) => (comp.id === updatedCompetition.id ? updatedCompetition : comp)),
        );
      } else {
        response = await pRetry(
          () => axios.post('https://comp-kyir.onrender.com/api/comp/add', submitData),
          { retries: 3, minTimeout: 1000, maxTimeout: 5000 }
        );
        const newCompetition = {
          id: response.data.create_comp.id,
          title: response.data.create_comp.name,
          description: response.data.create_comp.about,
          category: response.data.create_comp.category,
          status: response.data.create_comp.status,
          startDate: response.data.create_comp.startdate.split('T')[0],
          endDate: response.data.create_comp.enddate.split('T')[0],
          registrationDeadline: response.data.create_comp.deadline.split('T')[0],
          location: response.data.create_comp.location,
          teamSize: response.data.create_comp.team_size,
          prizePool: `$${response.data.create_comp.prize_pool.toLocaleString()}`,
          priority: response.data.create_comp.priority,
          url: response.data.create_comp.url || '',
          registrationCount: response.data.create_comp._count?.teams || 0,
        };
        setCompetitions((prev) => [...prev, newCompetition]);
      }
      resetForm();
    } catch (error) {
      console.error(`Error ${editingCompetition ? 'updating' : 'adding'} competition:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setFormError(
        error.response?.data?.message || `Failed to ${editingCompetition ? 'update' : 'add'} competition. Please try again.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      status: 'REGISTRATION_OPEN',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      location: '',
      teamSize: 1,
      prizePool: '',
      priority: 'MEDIUM',
      url: '',
    });
    setShowAddForm(false);
    setEditingCompetition(null);
    setFormError(null);
  };

  const handleEdit = (competition) => {
    setEditingCompetition(competition);
    setFormData({
      title: competition.title,
      description: competition.description,
      category: competition.category,
      status: competition.status,
      startDate: competition.startDate,
      endDate: competition.endDate,
      registrationDeadline: competition.registrationDeadline,
      location: competition.location,
      teamSize: competition.teamSize,
      prizePool: competition.prizePool.replace(/[^0-9]/g, ''),
      priority: competition.priority,
      url: competition.url || '',
    });
    setShowAddForm(true);
    setFormError(null);
  };

  const handleDelete = async (competitionId) => {
    if (window.confirm('Are you sure you want to delete this competition?')) {
      setDeletingId(competitionId);
      setIsLoading(true); // Show loading during deletion
      try {
        const response = await pRetry(
          () => axios.delete('https://comp-kyir.onrender.com/api/comp/delete', {data : { id: competitionId }}),
          { retries: 3, minTimeout: 1000, maxTimeout: 5000 }
        );
        if (response.data.message === 'Deleted successfully') {
          setCompetitions((prev) => prev.filter((comp) => comp.id !== competitionId));
          console.log('Competition deleted:', competitionId);
        } else {
          throw new Error(response.data.message || 'Failed to delete competition');
        }
      } catch (error) {
        console.error('Error deleting competition:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        setError(error.response?.data?.message || 'Failed to delete competition. Please try again.');
      } finally {
        setDeletingId(null);
        setIsLoading(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ONGOING: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ongoing' },
      UPCOMING: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Upcoming' },
      REGISTRATION_OPEN: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Registration Open' },
      COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' },
    };
    const config = statusConfig[status] || statusConfig['UPCOMING'];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Competitions</h1>
          <p className="text-gray-600 mt-1">Create, edit, and manage competitions</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          <span>Add Competition</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search competitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              console.log('Selected statusFilter:', e.target.value);
              setStatusFilter(e.target.value);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="all">All Status</option>
            <option value="REGISTRATION_OPEN">Registration Open</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingCompetition ? 'Edit Competition' : 'Add New Competition'}
          </h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{formError}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Competition Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Competition URL *</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="REGISTRATION_OPEN">Registration Open</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline *</label>
                <input
                  type="date"
                  required
                  value={formData.registrationDeadline}
                  onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Size *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={formData.teamSize}
                  onChange={(e) => handleInputChange('teamSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prize Pool *</label>
                <input
                  type="text"
                  required
                  value={formData.prizePool}
                  onChange={(e) => handleInputChange('prizePool', e.target.value)}
                  placeholder="e.g., $10,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 text-white mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </div>
                ) : editingCompetition ? 'Update Competition' : 'Add Competition'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Competitions List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="ml-3 text-gray-700">Loading...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => fetchCompetitions(new AbortController().signal)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCompetitions.map((competition) => (
              <div key={competition.id} className="bg-white rounded-lg shadow-md border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{competition.title}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {competition.category}
                      </span>
                      {competition.url && (
                        <a
                          href={competition.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs"
                          title="Visit Competition Website"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(competition.status)}
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {competition.startDate} - {competition.endDate}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{competition.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{competition.teamSize} members per team</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4" />
                    <span>{competition.prizePool}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span>{getPriorityStars(competition.priority)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">{getRegistrationCount(competition)} registrations</div>
                  <div className="flex space-x-2">
                    <button
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="View Details"
                      disabled={isLoading}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(competition)}
                      className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                      title="Edit Competition"
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(competition.id)}
                      className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete Competition"
                      disabled={deletingId === competition.id || isLoading}
                    >
                      {deletingId === competition.id ? (
                        <svg
                          className="animate-spin h-4 w-4 text-red-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredCompetitions.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No competitions found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first competition to get started'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}