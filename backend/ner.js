const nlp = require('compromise');
// Add NLP plugin for named entities
const nlpDates = require('compromise-dates');
nlp.extend(nlpDates);




const extractEntities = (text) => {
    try{

    const doc = nlp(text);
    
    // Extract entities
    const result = {
        // Personal information
        name: extractPersonName(text),
        
        // Education details
        education: extractEducation(text),
        
        // Work experience
        experience: extractWorkExperience(text),
        
        // Skills
        skills: extractSkills(text),
        
        // Dates from document
        dates: doc.dates().json({ normal: true }),
        
        // Organizations mentioned
        organizations: doc.organizations().out('array'),
        
        // Job titles/roles found
        jobTitles: extractJobTitles(text),
        
        // Extract specific sections for better analysis
        sections: extractSections(text)
    };
    
    return result;

    }
    catch(err){
        return
    }
};


// Extract person name (simplified approach)
const extractPersonName = (text) => {
    // Get first few lines of resume (where name is typically found)
    const firstLines = text.split('\n').slice(0, 5).join(' ');
    
    // Use compromise to find names in the first few lines
    const doc = nlp(firstLines);
    const names = doc.people().out('array');
    
    // Return the first name found, or null if none
    return names.length > 0 ? names[0] : null;
};

// Extract education information
const extractEducation = (text) => {
    const education = [];
    
    // Find education section
    const educationSection = extractSectionText(text, /education|academic|qualification|degree/i);
    
    if (educationSection) {
        const doc = nlp(educationSection);
        
        // Get organizations (universities/colleges)
        const institutions = doc.organizations().out('array');
        
        // Get dates
        const dates = doc.dates().out('array');
        
        // Look for degree patterns
        const degreeRegex = /\b(bachelor|master|ph\.?d\.?|diploma|certificate|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|b\.?e\.?|m\.?e\.?|b\.?tech\.?|m\.?tech\.?)\b.*?\b(of|in|on)\b.*?(\w+)/gi;
        let degreeMatch;
        const degrees = [];
        
        while ((degreeMatch = degreeRegex.exec(educationSection)) !== null) {
            degrees.push(degreeMatch[0]);
        }
        
        // Look for GPA/percentages
        const gpaRegex = /\b([0-9]\.?[0-9]*)\s*\/\s*([0-9]\.?[0-9]*)|([0-9]{2,3})(\s*)%|cgpa|[0-9]\.?[0-9]*/gi;
        const gpas = [];
        let gpaMatch;
        
        while ((gpaMatch = gpaRegex.exec(educationSection)) !== null) {
            gpas.push(gpaMatch[0]);
        }
        
        // Group education entries
        for (let i = 0; i < Math.max(institutions.length, degrees.length); i++) {
            education.push({
                institution: institutions[i] || null,
                degree: degrees[i] || null,
                date: dates[i] || null,
                gpa: gpas[i] || null
            });
        }
    }
    
    return education;
};

// Extract work experience information
const extractWorkExperience = (text) => {
    const experience = [];
    
    // Find experience section
    const experienceSection = extractSectionText(text, /experience|work history|employment|professional background/i);
    
    if (experienceSection) {
        const doc = nlp(experienceSection);
        
        // Get organizations (companies)
        const companies = doc.organizations().out('array');
        
        // Get dates
        const dates = doc.dates().json({ normal: true });
        
        // Get job titles
        const jobTitles = [];
        const titleRegex = /\b(senior|junior|lead|principal|staff|chief|head|director|manager|supervisor|coordinator|specialist|engineer|developer|analyst|designer|consultant|associate|assistant|intern)\b\s*\w+/gi;
        let titleMatch;
        
        while ((titleMatch = titleRegex.exec(experienceSection)) !== null) {
            jobTitles.push(titleMatch[0]);
        }
        
        // Extract responsibilities and achievements
        const entries = experienceSection.split(/\n\s*\n/);
        
        for (let i = 0; i < companies.length; i++) {
            // Look for relevant entry text
            let entryText = entries.find(entry => 
                entry.includes(companies[i]) || 
                (jobTitles[i] && entry.includes(jobTitles[i]))
            ) || '';
            
            // Extract achievements (sentences with action verbs)
            const achievements = [];
            const actionVerbRegex = /\b(achieved|improved|led|managed|created|developed|implemented|increased|reduced|designed|analyzed|organized|executed|coordinated|delivered|built|launched|negotiated|transformed)\b.*?[.]/gi;
            let achievementMatch;
            
            while ((achievementMatch = actionVerbRegex.exec(entryText)) !== null) {
                achievements.push(achievementMatch[0].trim());
            }
            
            experience.push({
                company: companies[i] || null,
                title: jobTitles[i] || null,
                period: dates[i] || null,
                achievements: achievements,
            });
        }
    }
    
    return experience;
};

// Extract skills
const extractSkills = (text) => {
    // Find skills section
    const skillsSection = extractSectionText(text, /skills|expertise|technologies|competencies|proficienc(y|ies)/i);
    
    const skills = [];
    
    if (skillsSection) {
        // Technical skills list - extend this as needed
        const technicalSkills = [
            'javascript', 'python', 'java', 'c\\+\\+', 'c#', 'ruby', 'php', 'typescript',
            'html', 'css', 'react', 'angular', 'vue', 'node', 'express', 'django', 'flask',
            'spring', 'asp\\.net', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'oracle',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'jira', 'agile',
            'scrum', 'devops', 'ci/cd', 'rest', 'graphql', 'api', 'microservices', 'testing',
            'machine learning', 'ai', 'data science', 'statistics', 'analytics', 'big data',
            'hadoop', 'spark', 'tableau', 'power bi', 'excel', 'vba', 'sap', 'salesforce',
            'linux', 'windows', 'ios', 'android', 'swift', 'kotlin', 'objective-c', 'mobile',
            'ui', 'ux', 'photoshop', 'illustrator', 'figma', 'sketch', 'indesign', 'adobe',
        ];
        
        // Create a big regex from all skills
        const skillsRegex = new RegExp(`\\b(${technicalSkills.join('|')})\\b`, 'gi');
        
        let skillMatch;
        while ((skillMatch = skillsRegex.exec(text)) !== null) {
            if (!skills.includes(skillMatch[0].toLowerCase())) {
                skills.push(skillMatch[0].toLowerCase());
            }
        }
        
        // Also check for comma or bullet-separated items in skills section
        const skillItems = skillsSection.split(/[,•\-\n]/);
        skillItems.forEach(item => {
            item = item.trim();
            if (item && item.length > 2 && item.length < 30 && !skills.includes(item.toLowerCase())) {
                skills.push(item);
            }
        });
    }
    
    return skills;
};




// Helper to extract specific sections of text
const extractSectionText = (text, sectionHeaderRegex) => {
    // Common section headers for resumes
    const sectionHeaders = [
        /education|academic|qualification/i,
        /experience|work history|employment|professional background/i,
        /skills|expertise|technologies|competencies/i,
        /projects|portfolio/i,
        /certifications|certificates/i,
        /summary|objective|profile/i,
        /awards|honors|achievements/i,
        /publications|research/i,
        /languages|proficiency/i,
        /interests|activities|hobbies/i,
        /references/i
    ];
    
    // Find the target section
    const matches = text.match(new RegExp(`(${sectionHeaderRegex.source}).*?\\n`, 'i'));
    if (!matches) return null;
    
    const sectionStartIndex = text.indexOf(matches[0]);
    if (sectionStartIndex === -1) return null;
    
    // Find the next section after our target
    let sectionEndIndex = text.length;
    for (const header of sectionHeaders) {
        const nextHeaderMatch = text.slice(sectionStartIndex + matches[0].length).match(new RegExp(`\\n.*?(${header.source}).*?\\n`, 'i'));
        if (nextHeaderMatch) {
            const nextHeaderIndex = text.slice(sectionStartIndex + matches[0].length).indexOf(nextHeaderMatch[0]) + sectionStartIndex + matches[0].length;
            if (nextHeaderIndex < sectionEndIndex) {
                sectionEndIndex = nextHeaderIndex;
            }
        }
    }
    
    return text.slice(sectionStartIndex, sectionEndIndex).trim();
};

// Extract job titles
const extractJobTitles = (text) => {
    const jobTitles = [];
    const titleRegex = /\b(senior|junior|lead|principal|staff|chief|head|director|manager|supervisor|coordinator|specialist|engineer|developer|analyst|designer|consultant|associate|assistant|intern)\b\s*\w+/gi;
    let match;
    
    while ((match = titleRegex.exec(text)) !== null) {
        if (!jobTitles.includes(match[0])) {
            jobTitles.push(match[0]);
        }
    }
    
    return jobTitles;
};

// Extract all sections for comprehensive analysis
const extractSections = (text) => {
    const sections = {};
    
    // Common section headers
    const sectionHeaders = {
        summary: /summary|objective|profile/i,
        education: /education|academic|qualification/i,
        experience: /experience|work history|employment|professional background/i,
        skills: /skills|expertise|technologies|competencies/i,
        projects: /projects|portfolio/i,
        certifications: /certifications|certificates/i,
        awards: /awards|honors|achievements/i,
        publications: /publications|research/i,
        languages: /languages|proficiency/i,
        interests: /interests|activities|hobbies/i,
        references: /references/i
    };
    
    // Extract each section
    for (const [sectionName, regex] of Object.entries(sectionHeaders)) {
        sections[sectionName] = extractSectionText(text, regex);
    }
    
    return sections;
};

const extractRelevantInternshipSkills = (text) => {
    // Only the most strategic skills that are both common Internshala filters 
    // AND frequently mentioned in job descriptions
    const highImpactSkills = [
        // Tech (the most frequently requested)
        'python',
        'java',
        'react',
        'web development',
        'data science',
        'machine learning',
        
        // Business (high demand on Internshala)
        'digital marketing',
        'content writing',
        'social media marketing',
        
        // Design (common filters)
        'ui/ux',
        'graphic design',
        
        // Finance/Business
        'financial analysis',
        'business development',
        
        // Analytics tools
        'excel',
        'sql',
        
        // General skills with high search volume
        'communication',
        'marketing',
        'research'
    ];

    const skills = new Set();
    
    // Simple text matching to find these high-impact skills
    for (const skill of highImpactSkills) {
        // Create a case-insensitive pattern with word boundaries to ensure we match complete terms
        const pattern = new RegExp('\\b' + skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
        if (pattern.test(text)) {
            skills.add(skill);
        }
    }
    
    return Array.from(skills);
};
module.exports={
    extractEntities,extractRelevantInternshipSkills
}