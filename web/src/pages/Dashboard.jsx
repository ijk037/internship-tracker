import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const STAGES = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected']

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingApp, setEditingApp] = useState(null)
  
  // Form fields
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('Wishlist')
  const [salary, setSalary] = useState('')
  const [location, setLocation] = useState('')
  const [workType, setWorkType] = useState('Remote')
  const [jobUrl, setJobUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  
  // Database schema support flags
  const [hasFullSchema, setHasFullSchema] = useState(true)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/login')
    } else {
      setUser(user)
      fetchApplications(user.id)
    }
  }

  const fetchApplications = async (userId) => {
    setLoading(true)
    try {
      // First, try querying all fields
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        // If query fails because column not found, fallback to basic schema
        if (error.code === 'PGRST204' || error.message.includes('column')) {
          setHasFullSchema(false)
          const { data: basicData, error: basicError } = await supabase
            .from('applications')
            .select('id, user_id, created_at, company, role, status')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

          if (basicError) throw basicError
          setApplications(basicData || [])
        } else {
          throw error
        }
      } else {
        setApplications(data || [])
      }
    } catch (err) {
      console.error('Error fetching applications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const openAddModal = () => {
    setEditingApp(null)
    setCompany('')
    setRole('')
    setStatus('Wishlist')
    setSalary('')
    setLocation('')
    setWorkType('Remote')
    setJobUrl('')
    setNotes('')
    setContactPerson('')
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (app) => {
    setEditingApp(app)
    setCompany(app.company || '')
    setRole(app.role || '')
    setStatus(app.status || 'Wishlist')
    setSalary(app.salary || '')
    setLocation(app.location || '')
    setWorkType(app.work_type || 'Remote')
    setJobUrl(app.job_url || '')
    setNotes(app.notes || '')
    setContactPerson(app.contact_person || '')
    setFormError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!company.trim() || !role.trim()) {
      setFormError('Company and Role are required.')
      return
    }

    setSubmitting(true)
    setFormError('')

    const payload = {
      user_id: user.id,
      company: company.trim(),
      role: role.trim(),
      status
    }

    // Add extra fields if database schema supports them
    if (hasFullSchema) {
      if (salary.trim()) payload.salary = salary.trim()
      if (location.trim()) payload.location = location.trim()
      if (workType) payload.work_type = workType
      if (jobUrl.trim()) payload.job_url = jobUrl.trim()
      if (notes.trim()) payload.notes = notes.trim()
      if (contactPerson.trim()) payload.contact_person = contactPerson.trim()
    }

    try {
      let resError;
      if (editingApp) {
        const { error } = await supabase
          .from('applications')
          .update(payload)
          .eq('id', editingApp.id)
        resError = error
      } else {
        const { error } = await supabase
          .from('applications')
          .insert([payload])
        resError = error
      }

      if (resError) {
        // If it failed due to missing columns, retry with basic fields only
        if (resError.code === 'PGRST204' && hasFullSchema) {
          setHasFullSchema(false)
          // Strip extra columns and retry
          const basicPayload = {
            user_id: user.id,
            company: company.trim(),
            role: role.trim(),
            status
          }
          const { error: retryError } = editingApp 
            ? await supabase.from('applications').update(basicPayload).eq('id', editingApp.id)
            : await supabase.from('applications').insert([basicPayload])

          if (retryError) throw retryError
        } else {
          throw resError
        }
      }

      setShowModal(false)
      fetchApplications(user.id)
    } catch (err) {
      setFormError(err.message || 'An error occurred while saving the application.')
    } finally {
      setSubmitting(false)
    }
  }

  const moveStatus = async (app, nextStatus) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: nextStatus })
        .eq('id', app.id)
      
      if (error) throw error
      fetchApplications(user.id)
    } catch (err) {
      console.error('Error moving status:', err)
    }
  }

  const handleDelete = async (appId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return
    
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', appId)

      if (error) throw error
      fetchApplications(user.id)
    } catch (err) {
      console.error('Error deleting application:', err)
    }
  }

  // Calculate Metrics
  const totalApps = applications.length
  const activeApps = applications.filter(a => ['Wishlist', 'Applied', 'Interviewing'].includes(a.status)).length
  const offersCount = applications.filter(a => a.status === 'Offer').length
  const interviewRate = totalApps > 0 
    ? Math.round((applications.filter(a => ['Interviewing', 'Offer'].includes(a.status)).length / totalApps) * 100) 
    : 0

  return (
    <div className="min-h-screen pb-12 flex flex-col">
      {/* Header */}
      <header className="glass border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-pink flex items-center justify-center font-bold text-lg text-white shadow-md shadow-brand-purple/20">
            IT
          </div>
          <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink">
            Internship Tracker
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-gray-400">
            {user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-700/80 hover:bg-gray-800/50 hover:border-gray-600 transition cursor-pointer text-gray-300"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Alerts / Info */}
        {!hasFullSchema && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>
              <strong>Note:</strong> Running in <em>Basic Schema Mode</em> (company, role, status). To unlock salary, location, work type, notes, and scraper capabilities, run the SQL script in your Supabase Editor.
            </span>
            <a 
              href="file:///D:/vsc/internship%20tracker/schema.sql"
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-cyan hover:underline font-semibold shrink-0"
            >
              View SQL Script →
            </a>
          </div>
        )}

        {/* Dashboard Actions & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
              Dashboard
            </h1>
            <p className="text-sm text-gray-400">
              Overview of your application statuses and metrics
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-95 transition cursor-pointer transform hover:scale-[1.02] shadow-lg shadow-brand-purple/25 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Application
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Metric 1 */}
          <div className="glass p-5 rounded-2xl border-l-4 border-brand-purple flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Applications</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">{totalApps}</span>
            </div>
          </div>
          {/* Metric 2 */}
          <div className="glass p-5 rounded-2xl border-l-4 border-brand-cyan flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Apps</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">{activeApps}</span>
            </div>
          </div>
          {/* Metric 3 */}
          <div className="glass p-5 rounded-2xl border-l-4 border-brand-pink flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Interview Rate</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">{interviewRate}%</span>
            </div>
          </div>
          {/* Metric 4 */}
          <div className="glass p-5 rounded-2xl border-l-4 border-emerald-500 flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Offers Received</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">{offersCount}</span>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm">Loading applications...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 items-start">
            {STAGES.map((stage) => {
              const stageApps = applications.filter((app) => app.status === stage)
              return (
                <div key={stage} className="flex flex-col rounded-2xl bg-gray-900/40 p-4 border border-gray-800/60 min-h-[500px]">
                  {/* Column Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm tracking-wide text-gray-200 uppercase">
                      {stage}
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700/50">
                      {stageApps.length}
                    </span>
                  </div>

                  {/* Cards Area */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {stageApps.length === 0 ? (
                      <div className="border border-dashed border-gray-800 rounded-xl py-8 text-center text-xs text-gray-600">
                        No applications
                      </div>
                    ) : (
                      stageApps.map((app) => (
                        <div
                          key={app.id}
                          className="glass p-4 rounded-xl border border-gray-800/80 hover:border-brand-purple/40 hover:shadow-lg hover:shadow-brand-purple/5 transition duration-200 group relative"
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className="font-bold text-white text-sm group-hover:text-brand-purple transition truncate">
                              {app.role}
                            </h4>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                              <button
                                onClick={() => openEditModal(app)}
                                className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition cursor-pointer"
                                title="Edit"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(app.id)}
                                className="p-1 hover:bg-red-950/30 rounded text-gray-500 hover:text-red-400 transition cursor-pointer"
                                title="Delete"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-xs font-semibold text-gray-300 mb-2 truncate">
                            {app.company}
                          </p>

                          {/* Extra info details if present */}
                          {(app.location || app.salary) && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {app.location && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-800/80 text-gray-400 border border-gray-700/30">
                                  📍 {app.location}
                                </span>
                              )}
                              {app.salary && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/20 text-emerald-300 border border-emerald-500/20">
                                  💰 {app.salary}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Quick move buttons */}
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-800/50">
                            <span className="text-[10px] text-gray-500">
                              Move to:
                            </span>
                            <div className="flex gap-1">
                              {STAGES.filter((s) => s !== stage).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => moveStatus(app, s)}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 hover:bg-brand-purple/20 hover:text-brand-purple border border-gray-700/60 hover:border-brand-purple/30 text-gray-400 transition cursor-pointer"
                                >
                                  {s[0]}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass w-full max-w-xl p-8 rounded-2xl border border-gray-800 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-bold text-white mb-6">
              {editingApp ? 'Edit Application' : 'Add Application'}
            </h3>

            {formError && (
              <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-500/50 text-red-200 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/60 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition text-white placeholder-gray-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Job Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Frontend Intern"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/60 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition text-white placeholder-gray-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Application Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700/60 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition text-white text-sm"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Extra Fields (Only rendered if schema supports it or fallback warning shown) */}
              {hasFullSchema ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Salary / Compensation
                      </label>
                      <input
                        type="text"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        placeholder="e.g. $40/hr or $5,000/mo"
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/60 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition text-white placeholder-gray-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. New York, NY"
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/60 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition text-white placeholder-gray-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Work Type
                      </label>
                      <select
                        value={workType}
                        onChange={(e) => setWorkType(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-700/60 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition text-white text-sm"
                      >
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Onsite">Onsite</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="e.g. Sarah Jenkins (Recruiter)"
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/60 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition text-white placeholder-gray-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Job URL
                    </label>
                    <input
                      type="url"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/60 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition text-white placeholder-gray-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any extra details, interview dates, preparation ideas..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/60 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition text-white placeholder-gray-500 text-sm resize-none"
                    />
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-800 text-xs text-gray-400">
                  ⚠️ Extra fields (Notes, Salary, Location, URL) are disabled because the database schema hasn't been migrated yet. Read schema.sql for more information.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-300 hover:bg-gray-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-95 disabled:opacity-50 transition cursor-pointer flex items-center gap-2"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    'Save Application'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
