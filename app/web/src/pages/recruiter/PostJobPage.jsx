import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  WorkOutline,
  AttachMoney,
  Description,
  Code,
  ArrowForward,
  Business,
  LocationOn,
  Close
} from "@mui/icons-material";
import { Navbar } from "../../components/layout/Navbar";
import jobInstance from "../../lib/jobInstance";
import { searchCompanies, searchLocations, searchSkills, searchJobTitles } from "../../lib/externalApis";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior Level", "Director", "Executive"];

const PostJobPage = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    companyId: null,
    jobTitle: "",
    companyName: "",
    location: "",
    employmentType: "Full-time",
    experienceLevel: "Entry Level",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    responsibilities: "",
    skillsRequired: [], // Array for UI
    expiresAt: "", // String YYYY-MM-DD for input
    isRemote: false
  });

  // Autocomplete States
  const [suggestions, setSuggestions] = useState({
    title: [],
    company: [],
    location: [],
    skills: []
  });

  const [showSuggestions, setShowSuggestions] = useState({
    title: false,
    company: false,
    location: false,
    skills: false
  });

  const [skillInput, setSkillInput] = useState("");

  // Prefill Company Name
  useEffect(() => {
    if (userProfile?.experience) {
      try {
        const experience = JSON.parse(userProfile.experience);
        if (Array.isArray(experience) && experience.length > 0) {
          const currentCompany = experience[0].company;
          if (currentCompany) {
            setFormData((prev) => ({ ...prev, companyName: currentCompany }));
          }
        }
      } catch (err) {
        console.error("Failed to parse user experience:", err);
      }
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSearch = async (query, fn, field) => {
    if (!query) {
      setSuggestions(prev => ({ ...prev, [field]: [] }));
      return;
    }
    try {
      const res = await fn(query);
      setSuggestions(prev => ({ ...prev, [field]: res }));
      setShowSuggestions(prev => ({ ...prev, [field]: true }));
    } catch (err) {
      console.error(err);
    }
  };

  const selectSuggestion = (field, value) => {
    if (field === 'companyName' && typeof value === 'object') {
      setFormData(prev => ({
        ...prev,
        companyName: value.name,
        companyId: value.companyId || value.id // Handle potential ID field names
      }));
    } else {
      const valStr = typeof value === 'string' ? value : value.name || "";
      setFormData(prev => ({ ...prev, [field]: valStr }));
    }
    setShowSuggestions(prev => ({ ...prev, [field]: false }));
  };

  // Skill Handling
  const addSkill = (skill) => {
    if (skill && !formData.skillsRequired.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skill]
      }));
    }
    setSkillInput("");
    setShowSuggestions(prev => ({ ...prev, skills: false }));
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(s => s !== skillToRemove)
    }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      salaryMin: Number(formData.salaryMin) || 0,
      salaryMax: Number(formData.salaryMax) || 0,
      skillsRequired: JSON.stringify(formData.skillsRequired),
      // Use standard LocalDateTime format without Z (timezone), assuming server local time or UTC
      expiresAt: formData.expiresAt ? `${formData.expiresAt}T23:59:59` : null,
    };

    try {
      await jobInstance.post(
        "/api/jobs",
        payload,
        { headers: { "X-User-Id": user?.id } }
      );

      navigate("/recruiter/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  // Theme primary color: hsl(150, 25%, 45%)

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900 mb-2">
            Post a New Job
          </h1>
          <p className="text-lg text-gray-500">Reach the best talent for your team</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 md:p-10 space-y-10">

            {/* Basic Info */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <WorkOutline sx={{ color: "hsl(150, 25%, 45%)" }} /> Basic Information
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {/* Job Title */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    name="jobTitle"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(150,25%,45%)] focus:border-[hsl(150,25%,45%)] outline-none transition-all"
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.jobTitle}
                    onChange={(e) => {
                      handleChange(e);
                      handleSearch(e.target.value, searchJobTitles, 'title');
                    }}
                    onFocus={() => formData.jobTitle && setShowSuggestions(prev => ({ ...prev, title: true }))}
                    required
                  />
                  {showSuggestions.title && suggestions.title.length > 0 && (
                    <ul className="absolute z-20 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {suggestions.title.map((item, i) => (
                        <li key={i}
                          onClick={() => selectSuggestion('jobTitle', item)}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700 border-b border-gray-50 last:border-0"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Business className="text-gray-400 text-sm" />
                      </div>
                      <input
                        type="text"
                        name="companyName"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(150,25%,45%)] focus:border-[hsl(150,25%,45%)] outline-none transition-all"
                        placeholder="Company Name"
                        value={formData.companyName}
                        onChange={(e) => {
                          handleChange(e);
                          handleSearch(e.target.value, searchCompanies, 'company');
                        }}
                        onFocus={() => formData.companyName && setShowSuggestions(prev => ({ ...prev, company: true }))}
                        required
                      />
                    </div>
                    {showSuggestions.company && suggestions.company.length > 0 && (
                      <ul className="absolute z-20 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {suggestions.company.map((item, i) => (
                          <li key={i}
                            onClick={() => selectSuggestion('companyName', item)}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                          >
                            {typeof item === 'string' ? item : item.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Location */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LocationOn className="text-gray-400 text-sm" />
                      </div>
                      <input
                        type="text"
                        name="location"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(150,25%,45%)] focus:border-[hsl(150,25%,45%)] outline-none transition-all"
                        placeholder="e.g. Remote, New York"
                        value={formData.location}
                        onChange={(e) => {
                          handleChange(e);
                          handleSearch(e.target.value, searchLocations, 'location');
                        }}
                        onFocus={() => formData.location && setShowSuggestions(prev => ({ ...prev, location: true }))}
                      />
                    </div>
                    {showSuggestions.location && suggestions.location.length > 0 && (
                      <ul className="absolute z-20 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {suggestions.location.map((item, i) => (
                          <li key={i}
                            onClick={() => selectSuggestion('location', item)}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Is Remote Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRemote"
                    name="isRemote"
                    checked={formData.isRemote}
                    onChange={handleChange}
                    className="w-4 h-4 text-[hsl(150,25%,45%)] border-gray-300 rounded focus:ring-[hsl(150,25%,45%)]"
                  />
                  <label htmlFor="isRemote" className="text-sm text-gray-700">This is a fully remote position</label>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200"></div>

            {/* Compensation */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <AttachMoney sx={{ color: "hsl(150, 25%, 45%)" }} /> Compensation & Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(150,25%,45%)] outline-none bg-white"
                  >
                    {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(150,25%,45%)] outline-none bg-white"
                  >
                    {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Annual Salary ($)</label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    placeholder="80000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(150,25%,45%)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Annual Salary ($)</label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    placeholder="120000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(150,25%,45%)] outline-none"
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200"></div>

            {/* Description */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Description sx={{ color: "hsl(150, 25%, 45%)" }} /> Job Description
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">About the Role *</label>
                  <textarea
                    name="description"
                    rows="4"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the main purpose of this job..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(150,25%,45%)] outline-none resize-y"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Requirements</label>
                  <textarea
                    name="requirements"
                    rows="4"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="List the must-have qualifications..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(150,25%,45%)] outline-none resize-y"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities</label>
                  <textarea
                    name="responsibilities"
                    rows="4"
                    value={formData.responsibilities}
                    onChange={handleChange}
                    placeholder="What will the daily duties involve?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(150,25%,45%)] outline-none resize-y"
                  ></textarea>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200"></div>

            {/* Skills */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Code sx={{ color: "hsl(150, 25%, 45%)" }} /> Skills & Timeline
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                  <div className="p-2 border border-gray-300 rounded-lg min-h-[50px] focus-within:ring-2 focus-within:ring-[hsl(150,25%,45%)] focus-within:border-[hsl(150,25%,45%)] bg-white">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.skillsRequired.map((skill, index) => (
                        <span key={index} className="bg-[hsl(150,25%,94%)] text-[hsl(150,25%,25%)] px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          {skill}
                          <Close
                            className="w-4 h-4 cursor-pointer hover:text-[hsl(150,25%,15%)]"
                            fontSize="small"
                            onClick={() => removeSkill(skill)}
                          />
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="w-full outline-none text-sm"
                      placeholder="Type a skill and press Enter..."
                      value={skillInput}
                      onChange={(e) => {
                        setSkillInput(e.target.value);
                        handleSearch(e.target.value, searchSkills, 'skills');
                      }}
                      onKeyDown={handleSkillKeyDown}
                      onFocus={() => skillInput && setShowSuggestions(prev => ({ ...prev, skills: true }))}
                    />
                  </div>
                  {showSuggestions.skills && suggestions.skills.length > 0 && (
                    <ul className="absolute z-20 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {suggestions.skills.map((item, i) => (
                        <li key={i}
                          onClick={() => addSkill(item)}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700 border-b border-gray-50 last:border-0"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(150,25%,45%)] outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-[hsl(150,25%,45%)] text-white font-medium rounded-lg hover:bg-[hsl(150,25%,40%)] transition-colors shadow-lg shadow-[hsl(150,25%,45%)]/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Posting..." : "Post Job Opening"}
                {!loading && <ArrowForward fontSize="small" />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJobPage;
