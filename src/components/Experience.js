import React from 'react';
import '../styles/Experience.css';

const Experience = () => {
  const experiences = [
    {
      company: "Volopay",
      role: "Backend Developer Intern",
      period: "Current",
      location: "Remote",
      description: "Working on backend development and cloud infrastructure."
    },
    {
      company: "CRM Landing Software Pvt. Ltd.",
      role: "Web-Developer Intern",
      period: "Feb 2025 - July 2025",
      location: "Remote",
      responsibilities: [
        "Redesigned and optimized the official company website crmlanding.in using HTML, CSS, JavaScript, and React.js, improving responsiveness and user experience across devices.",
        "Built interactive UI components and managed state with Redux Toolkit to improve scalability.",
        "Collaborated with senior developers using Git/GitHub for version control, implementing new features, debugging issues, and maintaining clean, structured code."
      ]
    },
    {
      company: "Springworks",
      role: "Intern",
      period: "Previous",
      location: "Remote",
      description: "Gained valuable experience in software development and team collaboration."
    }
  ];

  return (
    <section id="experience" className="experience-section">
      <div className="container">
        <h2 className="section-title">
          <span className="title-number">02.</span>
          <span className="title-text">Experience</span>
          <span className="title-line"></span>
        </h2>
        <div className="experience-timeline">
          {experiences.map((exp, index) => (
            <div key={index} className="experience-item">
              <div className="experience-content">
                <div className="experience-header">
                  <h3 className="company-name">{exp.company}</h3>
                  <span className="experience-period">{exp.period}</span>
                </div>
                <div className="role">{exp.role}</div>
                <div className="location">
                  <i className="fas fa-map-marker-alt"></i>
                  {exp.location}
                </div>
                {exp.responsibilities ? (
                  <ul className="responsibilities">
                    {exp.responsibilities.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="description">{exp.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;


