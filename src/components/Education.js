import React from 'react';
import '../styles/Education.css';

const Education = () => {
  const education = [
    {
      institution: "Bennett University",
      degree: "Bachelor of Technology in Computer Science",
      cgpa: "9.5",
      period: "2022 - 2026",
      location: "Greater Noida, Uttar Pradesh",
      status: "Current"
    },
    {
      institution: "New Look Central School",
      degree: "12th Grade",
      percentage: "92.4%",
      period: "2021 - 2022",
      location: "Bhilwara, Rajasthan"
    }
  ];

  return (
    <section id="education" className="education-section">
      <div className="container">
        <h2 className="section-title">
          <span className="title-number">05.</span>
          <span className="title-text">Education</span>
          <span className="title-line"></span>
        </h2>
        <div className="education-timeline">
          {education.map((edu, index) => (
            <div key={index} className="education-item">
              <div className="education-content">
                <div className="education-header">
                  <h3 className="institution-name">{edu.institution}</h3>
                  <span className="education-period">{edu.period}</span>
                </div>
                <div className="degree">{edu.degree}</div>
                <div className="location">
                  <i className="fas fa-map-marker-alt"></i>
                  {edu.location}
                </div>
                <div className="performance">
                  {edu.cgpa && (
                    <div className="cgpa">
                      <i className="fas fa-graduation-cap"></i>
                      <span>CGPA: {edu.cgpa}</span>
                    </div>
                  )}
                  {edu.percentage && (
                    <div className="percentage">
                      <i className="fas fa-percentage"></i>
                      <span>Percentage: {edu.percentage}</span>
                    </div>
                  )}
                  {edu.status && (
                    <span className="status-badge">{edu.status}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;


