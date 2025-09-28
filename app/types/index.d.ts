interface Resume {
  id: string;
  companyName: string;
  jobTitle: string;
  imagePath: string;
  resumePath: string;
  feedback: {
    overallScore: number;
    ATS: {
      score: number;
      tips: string[];
    };
    toneAndStyle: {
      score: number;
      tips: string[];
    };
    content: {
      score: number;
      tips: string[];
    };
    structure: {
      score: number;
      tips: string[];
    };
    skills: {
      score: number;
      tips: string[];
    };
  };
}