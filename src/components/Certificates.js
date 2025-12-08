import React from 'react';
import '../styles/Certificates.css';

const Certificates = () => {
  const certificates = [
    {
      name: "ServiceNow Certified Application Developer",
      issuer: "ServiceNow",
      icon: "fas fa-certificate"
    },
    {
      name: "ServiceNow Certified System Administrator",
      issuer: "ServiceNow",
      icon: "fas fa-certificate"
    },
    {
      name: "AWS Certified Cloud Practitioner",
      issuer: "AWS",
      icon: "fab fa-aws"
    },
    {
      name: "AWS Academy Machine Learning Foundations",
      issuer: "AWS",
      icon: "fas fa-brain"
    }
  ];

  return (
    <section id="certificates" className="certificates-section">
      <div className="container">
        <h2 className="section-title">
          <span className="title-number">06.</span>
          <span className="title-text">Certificates</span>
          <span className="title-line"></span>
        </h2>
        <div className="certificates-grid">
          {certificates.map((cert, index) => (
            <div key={index} className="certificate-card">
              <div className="certificate-icon">
                <i className={cert.icon}></i>
              </div>
              <h3 className="certificate-name">{cert.name}</h3>
              <div className="certificate-issuer">
                <i className="fas fa-building"></i>
                <span>{cert.issuer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certificates;


