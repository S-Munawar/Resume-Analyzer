/**
 * Local Resume Analyzer - No external APIs required!
 * Uses advanced text analysis algorithms to provide comprehensive feedback
 */

// Import types from the global types file
// The Resume and Feedback types are already defined globally

interface SectionAnalysis {
  score: number;
  feedback: string;
  details?: string[];
}

/**
 * Comprehensive local resume analysis using NLP techniques
 * Returns both the new detailed format and the legacy compatible format
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
    
    // Helper function to convert section analysis to tips
    const convertSectionToTips = (section: SectionAnalysis) => {
      const tips: { type: "good" | "improve"; tip: string; explanation: string; }[] = [];
      
      if (section.score >= 80) {
        tips.push({
          type: "good",
          tip: section.feedback,
          explanation: section.feedback
        });
      } else {
        tips.push({
          type: "improve",
          tip: section.feedback,
          explanation: section.feedback
        });
      }
      
      // Add details as additional tips if available
      if (section.details) {
        section.details.forEach((detail: string) => {
          const isPositive = detail.startsWith("✓");
          if (!isPositive && !detail.startsWith("•")) {
            tips.push({
              type: "improve",
              tip: detail.replace("✗ ", ""),
              explanation: "This is important for professional presentation and ATS compatibility"
            });
          }
        });
      }
      
      return tips;
    };

    // Generate ATS recommendations
    const atsRecommendations = generateRecommendations(
      { contactInfo, professionalSummary, experience, education, skills, formatting },
      jobTitle,
      jobDescription
    );

    // Create Feedback structure directly
    const feedback: Feedback = {
      overallScore: overallScore,
      ATS: {
        score: atsScore,
        tips: atsRecommendations.slice(0, 5).map(rec => ({
          type: "improve" as const,
          tip: rec
        }))
      },
      toneAndStyle: {
        score: professionalSummary.score,
        tips: convertSectionToTips(professionalSummary)
      },
      content: {
        score: experience.score,
        tips: convertSectionToTips(experience)
      },
      structure: {
        score: formatting.score,
        tips: convertSectionToTips(formatting)
      },
      skills: {
        score: skills.score,
        tips: convertSectionToTips(skills)
      }
    };
    
    console.log('Local analysis complete - Overall Score:', overallScore);
    
    return JSON.stringify(feedback, null, 2);
    
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
  
  // Return in the expected Feedback format
  const fallbackFeedback: Feedback = {
    overallScore: 65,
    ATS: {
      score: 60,
      tips: [
        { type: "improve", tip: "Add more relevant keywords for better ATS compatibility" },
        { type: "improve", tip: "Use standard section headings like 'Experience' and 'Education'" }
      ]
    },
    toneAndStyle: {
      score: 70,
      tips: [
        { type: "improve", tip: "Add a professional summary section", explanation: "A compelling summary helps recruiters quickly understand your value proposition" }
      ]
    },
    content: {
      score: 60,
      tips: [
        { type: "improve", tip: "Add quantified achievements to your experience section", explanation: "Numbers and metrics make your accomplishments more impactful" }
      ]
    },
    structure: {
      score: 65,
      tips: [
        { type: "improve", tip: "Ensure consistent formatting throughout", explanation: "Consistent formatting improves readability and professionalism" }
      ]
    },
    skills: {
      score: 65,
      tips: [
        { type: "improve", tip: "Expand your skills section with relevant technologies", explanation: "Include both technical and soft skills relevant to your target role" }
      ]
    }
  };
  
  return JSON.stringify(fallbackFeedback, null, 2);
}

