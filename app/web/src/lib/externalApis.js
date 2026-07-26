import axios from 'axios';

// University API: HipoLabs
const UNIVERSITY_API = "http://universities.hipolabs.com/search";

// Company API: Clearbit Autocomplete
const COMPANY_API = "https://autocomplete.clearbit.com/v1/companies/suggest";

export const searchUniversities = async (query) => {
    if (!query) return [];
    try {
        const response = await axios.get(`${UNIVERSITY_API}?name=${query}`);
        // Function to filter and limit results to avoid overwhelming UI
        return response.data.slice(0, 20).map(u => u.name);
    } catch (error) {
        console.error("Failed to fetch universities", error);
        return [];
    }
};

export const searchCompanies = async (query) => {
    if (!query) return [];
    try {
        const response = await axios.get(`${COMPANY_API}?query=${query}`);
        return response.data.map(c => ({ name: c.name, logo: c.logo, domain: c.domain }));
    } catch (error) {
        console.error("Failed to fetch companies", error);
        return [];
    }
};

// Location API: Photon (OSM)
const LOCATION_API = "https://photon.komoot.io/api";

export const searchLocations = async (query) => {
    if (!query || query.length < 3) return [];
    try {
        const response = await axios.get(`${LOCATION_API}?q=${query}&limit=10`);
        // Photon returns GeoJSON. Features have properties.name, city, country etc.
        return response.data.features.map(f => {
            const p = f.properties;
            const parts = [p.name, p.city, p.state, p.country].filter(Boolean);
            return [...new Set(parts)].join(", "); // Remove duplicates and join
        });
    } catch (error) {
        console.error("Failed to fetch locations", error);
        return [];
    }
};

// Curated List of Common Job Titles
// Skills API: StackExchange (StackOverflow Tags)
// Fallback to local list if API fails
const SKILLS_API = "https://api.stackexchange.com/2.3/tags";

export const searchSkills = async (query) => {
    if (!query) return [];
    try {
        const response = await axios.get(`${SKILLS_API}?order=desc&sort=popular&inname=${query}&site=stackoverflow`);
        return response.data.items.map(item => item.name);
    } catch (error) {
        console.error("Failed to fetch skills", error);
        return [];
    }
};

// Curated List of Common Job Titles
export const JOB_TITLES_LIST = [
    "Software Engineer",
    "Senior Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Product Manager",
    "Project Manager",
    "Data Scientist",
    "Data Analyst",
    "UX Designer",
    "UI Designer",
    "Product Designer",
    "DevOps Engineer",
    "System Administrator",
    "QA Engineer",
    "Mobile Developer",
    "Android Developer",
    "iOS Developer",
    "Machine Learning Engineer",
    "Cloud Architect",
    "Technical Lead",
    "Engineering Manager",
    "CTO",
    "VP of Engineering",
    "Web Developer",
    "Game Developer",
    "Embedded Systems Engineer",
    "Security Engineer",
    "Blockchain Developer",
    "Sales Representative",
    "Account Manager",
    "Marketing Manager",
    "Business Analyst",
    "HR Manager",
    "Recruiter",
    "Consultant",
    "Founder",
    "Co-Founder",
    "CEO",
    "CFO",
    "COO",
    "Intern",
    "Student",
    "Teacher",
    "Professor",
    "Researcher",
    "Writer",
    "Editor",
    "Graphic Designer",
    "Art Director",
    "Copywriter"
].sort();

export const searchJobTitles = async (query) => {
    if (!query) return [];
    return JOB_TITLES_LIST.filter(title => title.toLowerCase().includes(query.toLowerCase()));
};
