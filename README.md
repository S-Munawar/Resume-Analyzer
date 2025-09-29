# Resume Analyzer

An intelligent resume analysis platform that provides AI-powered feedback to help job seekers optimize their resumes for better ATS compatibility and overall presentation.

## 🎯 Features

- 📄 **PDF Resume Upload** - Upload and analyze PDF resumes
- 🤖 **AI-Powered Analysis** - Advanced local NLP algorithms for comprehensive feedback
- 📊 **ATS Score** - Applicant Tracking System compatibility rating
- 🎨 **Multiple Analysis Categories**:
  - Tone & Style Assessment
  - Content Quality Analysis
  - Structure & Formatting Review
  - Skills Section Evaluation
- 📈 **Interactive Scoring** - Visual score displays with actionable improvements
- 💾 **Resume Management** - Save and track multiple resume versions
- � **Secure Storage** - Powered by Puter.com cloud storage
- 🎨 **Modern UI** - Clean, responsive interface with TailwindCSS
- ⚡ **Real-time Processing** - Fast local analysis without external API dependencies

## �️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v7
- **Styling**: TailwindCSS
- **PDF Processing**: PDF.js for text extraction and image conversion
- **Cloud Storage**: Puter.com APIs (File System, Key-Value Store, Authentication)
- **Analysis Engine**: Custom NLP algorithms for local resume analysis
- **Build Tool**: Vite
- **Deployment**: Docker support included

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- A [Puter.com](https://puter.com) account for cloud storage

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/S-Munawar/ResumeAnalyzer.git
cd ResumeAnalyzer
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up Puter.com:**
   - Create an account at [puter.com](https://puter.com)
   - The app will prompt you to authenticate when you first run it

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

### Usage

1. **Authentication** - Sign in with your Puter.com account
2. **Upload Resume** - Navigate to upload page and select your PDF resume
3. **Job Details** - Fill in company name, job title, and job description for targeted analysis
4. **Analysis** - The system will process your resume and provide comprehensive feedback
5. **Review Results** - View your scores and actionable improvement suggestions
6. **Manage Resumes** - Access your analyzed resumes from the home dashboard

## 📁 Project Structure

```
ResumeAnalyzer/
├── app/
│   ├── components/          # React components
│   │   ├── Navbar.tsx      # Navigation component
│   │   ├── FileUploader.tsx # PDF upload interface
│   │   ├── ATS.tsx         # ATS score display
│   │   ├── Summary.tsx     # Score summary component
│   │   ├── Details.tsx     # Detailed feedback component
│   │   └── ResumeCard.tsx  # Resume list item
│   ├── routes/             # Application pages
│   │   ├── home.tsx        # Dashboard/resume list
│   │   ├── upload.tsx      # Resume upload page
│   │   ├── resume.tsx      # Individual resume view
│   │   └── auth.tsx        # Authentication
│   ├── lib/                # Utilities and services
│   │   ├── localAnalyzer.ts # Resume analysis engine
│   │   ├── PdfToImg.ts     # PDF processing utilities
│   │   ├── puter.ts        # Puter.com API integration
│   │   └── utils.ts        # General utilities
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
└── constants/              # Application constants
```

## 🔧 Building for Production

Create a production build:

```bash
npm run build
```

## 🚀 Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t resume-analyzer .

# Run the container
docker run -p 3000:3000 resume-analyzer
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## 🎨 Analysis Features

### ATS Compatibility
- Keyword optimization suggestions
- Format compatibility checks
- Section organization recommendations

### Content Analysis
- Action verb usage assessment
- Quantified achievements detection
- Professional language evaluation

### Structure Review
- Formatting consistency checks
- Section completeness validation
- Length and readability optimization

### Skills Evaluation
- Technical skills identification
- Soft skills assessment
- Job-specific skill matching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Puter.com](https://puter.com) for cloud storage and authentication services
- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF processing capabilities
- [React Router](https://reactrouter.com/) for application routing
- [TailwindCSS](https://tailwindcss.com/) for styling framework

## 📞 Support

If you encounter any issues or have questions, please:

1. Check the existing [GitHub Issues](https://github.com/S-Munawar/ResumeAnalyzer/issues)
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

## Author

**Shaik Abdul Munawar**

* [LinkedIn Profile](https://www.linkedin.com/in/shaik-abdul-munawar-b35821284)

---

Built with ❤️ using React Router and modern web technologies.
