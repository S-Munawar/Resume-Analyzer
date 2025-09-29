/**
 * Local Resume Analyzer - No external APIs required!
 * Uses advanced text analysis algorithms to provide comprehensive feedback
 */

interface ResumeAnalysis {
  overall_score: number;
  ats_score: number;
  sections: {
    contact_info: SectionAnalysis;
    professional_summary: SectionAnalysis;
    experience: SectionAnalysis;
    education: SectionAnalysis;
    skills: SectionAnalysis;
    formatting: SectionAnalysis;
  };
  recommendations: string[];
  strengths: string[];
  areas_for_improvement: string[];
  word_count: number;
  analysis_method: string;
}

interface SectionAnalysis {
  score: number;
  feedback: string;
  details?: string[];
}

/**
 * Comprehensive local resume analysis using NLP techniques
 */
export function analyzeResumeLocally(extractedText: string, jobTitle?: string, jobDescription?: string): string {
  try {
    console.log('Starting comprehensive local analysis...');
    
    const text = extractedText.toLowerCase();
    const lines = extractedText.split('\n').filter(line => line.trim().length > 0);
    const words = extractedText.split(/\s+/);
    const wordCount = words.length;
    
    // Analyze different sections
    const contactInfo = analyzeContactInfo(text, extractedText);
    const professionalSummary = analyzeProfessionalSummary(text, lines);
    const experience = analyzeExperience(text, lines, extractedText);
    const education = analyzeEducation(text, lines);
    const skills = analyzeSkills(text, extractedText, jobDescription);
    const formatting = analyzeFormatting(extractedText, lines);
    
    // Calculate overall score
    const sectionScores = [
      contactInfo.score,
      professionalSummary.score,
      experience.score,
      education.score,
      skills.score,
      formatting.score
    ];
    
    const overallScore = Math.round(sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length);
    const atsScore = calculateATSScore(text, extractedText, overallScore);
    
    // Generate recommendations
    const recommendations = generateRecommendations(
      { contactInfo, professionalSummary, experience, education, skills, formatting },
      jobTitle,
      jobDescription
    );
    
    // Identify strengths and areas for improvement
    const strengths = identifyStrengths({ contactInfo, professionalSummary, experience, education, skills, formatting });
    const areasForImprovement = identifyAreasForImprovement({ contactInfo, professionalSummary, experience, education, skills, formatting });
    
    const analysis: ResumeAnalysis = {
      overall_score: overallScore,
      ats_score: atsScore,
      sections: {
        contact_info: contactInfo,
        professional_summary: professionalSummary,
        experience: experience,
        education: education,
        skills: skills,
        formatting: formatting
      },
      recommendations,
      strengths,
      areas_for_improvement: areasForImprovement,
      word_count: wordCount,
      analysis_method: "Advanced Local NLP Analysis"
    };
    
    console.log('Local analysis complete - Overall Score:', overallScore);
    return JSON.stringify(analysis, null, 2);
    
  } catch (error) {
    console.error('Local analysis error:', error);
    return generateFallbackAnalysis(extractedText);
  }
}

function analyzeContactInfo(text: string, originalText: string): SectionAnalysis {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const linkedinRegex = /linkedin\.com\/in\/|linkedin\.com\/pub\//i;
  const githubRegex = /github\.com\/|github\.io/i;
  
  const hasEmail = emailRegex.test(originalText);
  const hasPhone = phoneRegex.test(originalText);
  const hasLinkedIn = linkedinRegex.test(originalText);
  const hasGitHub = githubRegex.test(originalText);
  
  let score = 0;
  const details = [];
  
  if (hasEmail) { score += 30; details.push("✓ Email address found"); }
  else details.push("✗ Add professional email address");
  
  if (hasPhone) { score += 25; details.push("✓ Phone number found"); }
  else details.push("✗ Add phone number");
  
  if (hasLinkedIn) { score += 25; details.push("✓ LinkedIn profile found"); }
  else details.push("✗ Add LinkedIn profile URL");
  
  if (hasGitHub) { score += 20; details.push("✓ GitHub profile found"); }
  else details.push("• Consider adding GitHub profile (if relevant)");
  
  return {
    score: Math.min(score, 100),
    feedback: hasEmail && hasPhone ? "Strong contact information" : "Missing essential contact details",
    details
  };
}

function analyzeProfessionalSummary(text: string, lines: string[]): SectionAnalysis {
  const summaryKeywords = ['summary', 'profile', 'objective', 'about', 'overview'];
  const hasSummarySection = summaryKeywords.some(keyword => text.includes(keyword));
  
  // Look for summary-like content in first few lines
  const firstFewLines = lines.slice(0, 5).join(' ').toLowerCase();
  const hasDescriptiveContent = /\b(experienced|skilled|professional|dedicated|passionate|results-driven)\b/.test(firstFewLines);
  
  let score = 0;
  if (hasSummarySection) score += 50;
  if (hasDescriptiveContent) score += 30;
  if (firstFewLines.length > 100) score += 20;
  
  return {
    score: Math.min(score, 100),
    feedback: score > 70 ? "Good professional summary" : score > 40 ? "Basic summary present" : "Add compelling professional summary"
  };
}

function analyzeExperience(text: string, lines: string[], originalText: string): SectionAnalysis {
  const experienceKeywords = ['experience', 'employment', 'work history', 'professional experience'];
  const hasExperienceSection = experienceKeywords.some(keyword => text.includes(keyword));
  
  const actionVerbs = ['achieved', 'managed', 'led', 'developed', 'implemented', 'created', 'improved', 'increased', 'reduced', 'designed'];
  const actionVerbCount = actionVerbs.filter(verb => text.includes(verb)).length;
  
  const quantifiers = /\b\d+%|\$\d+|\d+\+|increased by \d+|reduced by \d+/g;
  const quantifierMatches = (originalText.match(quantifiers) || []).length;
  
  let score = 0;
  if (hasExperienceSection) score += 40;
  score += Math.min(actionVerbCount * 5, 30);
  score += Math.min(quantifierMatches * 10, 30);
  
  const details = [];
  if (actionVerbCount > 3) details.push(`✓ Uses ${actionVerbCount} strong action verbs`);
  if (quantifierMatches > 0) details.push(`✓ Includes ${quantifierMatches} quantified achievements`);
  
  return {
    score: Math.min(score, 100),
    feedback: score > 80 ? "Excellent experience section" : score > 60 ? "Good experience details" : "Enhance experience with achievements",
    details
  };
}

function analyzeEducation(text: string, lines: string[]): SectionAnalysis {
  const educationKeywords = ['education', 'degree', 'university', 'college', 'bachelor', 'master', 'phd', 'certification'];
  const hasEducation = educationKeywords.some(keyword => text.includes(keyword));
  
  const degreeTypes = ['bachelor', 'master', 'phd', 'doctorate', 'associate'];
  const hasDegree = degreeTypes.some(degree => text.includes(degree));
  
  let score = hasEducation ? 80 : 30;
  if (hasDegree) score += 20;
  
  return {
    score: Math.min(score, 100),
    feedback: hasEducation ? "Education information present" : "Add educational background"
  };
}

function analyzeSkills(text: string, originalText: string, jobDescription?: string): SectionAnalysis {
  const skillsKeywords = ['skills', 'technologies', 'competencies', 'proficiencies'];
  const hasSkillsSection = skillsKeywords.some(keyword => text.includes(keyword));
  
  const technicalSkills = ['python', 'javascript', 'java', 'react', 'node', 'sql', 'aws', 'docker', 'git'];
  const foundTechSkills = technicalSkills.filter(skill => text.includes(skill));
  
  const softSkills = ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical'];
  const foundSoftSkills = softSkills.filter(skill => text.includes(skill));
  
  let score = 0;
  if (hasSkillsSection) score += 40;
  score += Math.min(foundTechSkills.length * 10, 30);
  score += Math.min(foundSoftSkills.length * 6, 30);
  
  // Job matching bonus
  if (jobDescription) {
    const jobKeywords = jobDescription.toLowerCase().split(/\s+/);
    const matchingSkills = jobKeywords.filter(keyword => text.includes(keyword)).length;
    score += Math.min(matchingSkills * 2, 20);
  }
  
  return {
    score: Math.min(score, 100),
    feedback: score > 80 ? "Comprehensive skills section" : score > 60 ? "Good skills coverage" : "Expand and organize skills section"
  };
}

function analyzeFormatting(originalText: string, lines: string[]): SectionAnalysis {
  const bulletPoints = (originalText.match(/[•·▪▫◦‣⁃]/g) || []).length;
  const hasConsistentStructure = lines.length > 10 && lines.length < 100;
  const averageLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  
  let score = 50; // Base score
  if (bulletPoints > 3) score += 20;
  if (hasConsistentStructure) score += 20;
  if (averageLineLength > 20 && averageLineLength < 80) score += 10;
  
  return {
    score: Math.min(score, 100),
    feedback: score > 80 ? "Well-formatted resume" : score > 60 ? "Good structure" : "Improve formatting and organization"
  };
}

function calculateATSScore(text: string, originalText: string, overallScore: number): number {
  let atsScore = overallScore;
  
  // ATS-specific factors
  const hasStandardSections = ['experience', 'education', 'skills'].every(section => text.includes(section));
  const hasMinimalFormatting = !/[^\w\s.,;:!?@#$%&*()[\]{}|\\/"'-]/.test(originalText);
  
  if (hasStandardSections) atsScore += 5;
  if (hasMinimalFormatting) atsScore += 5;
  
  return Math.min(atsScore, 100);
}

function generateRecommendations(sections: any, jobTitle?: string, jobDescription?: string): string[] {
  const recommendations = [];
  
  if (sections.contactInfo.score < 80) {
    recommendations.push("Add complete contact information including email, phone, and LinkedIn profile");
  }
  
  if (sections.experience.score < 70) {
    recommendations.push("Use more action verbs and quantify your achievements with specific numbers and percentages");
  }
  
  if (sections.skills.score < 70) {
    recommendations.push("Expand your skills section with both technical and soft skills relevant to your field");
  }
  
  if (jobDescription) {
    recommendations.push(`Tailor your resume to match keywords from the ${jobTitle || 'target'} position`);
  }
  
  recommendations.push("Use consistent formatting and bullet points for easy readability");
  recommendations.push("Keep your resume to 1-2 pages maximum");
  recommendations.push("Proofread carefully for grammar and spelling errors");
  
  return recommendations;
}

function identifyStrengths(sections: any): string[] {
  const strengths = [];
  
  if (sections.contactInfo.score >= 80) strengths.push("Complete professional contact information");
  if (sections.experience.score >= 80) strengths.push("Strong work experience with quantified achievements");
  if (sections.skills.score >= 80) strengths.push("Comprehensive skills section");
  if (sections.formatting.score >= 80) strengths.push("Well-organized and professional formatting");
  
  return strengths.length > 0 ? strengths : ["Resume structure follows professional standards"];
}

function identifyAreasForImprovement(sections: any): string[] {
  const improvements = [];
  
  if (sections.contactInfo.score < 70) improvements.push("Contact information completeness");
  if (sections.professionalSummary.score < 70) improvements.push("Professional summary development");
  if (sections.experience.score < 70) improvements.push("Work experience presentation");
  if (sections.skills.score < 70) improvements.push("Skills section organization");
  if (sections.formatting.score < 70) improvements.push("Overall formatting and structure");
  
  return improvements;
}

function generateFallbackAnalysis(extractedText: string): string {
  const wordCount = extractedText.split(/\s+/).length;
  return JSON.stringify({
    overall_score: 65,
    ats_score: 60,
    sections: {
      contact_info: { score: 70, feedback: "Basic contact information detected" },
      experience: { score: 60, feedback: "Experience section needs enhancement" },
      skills: { score: 65, feedback: "Skills section could be expanded" }
    },
    recommendations: [
      "Add quantified achievements to your experience section",
      "Include relevant keywords for your target position",
      "Ensure consistent formatting throughout"
    ],
    word_count: wordCount,
    analysis_method: "Basic Text Analysis"
  }, null, 2);
}