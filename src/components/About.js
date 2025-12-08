import React from 'react';
import '../styles/About.css';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <div className="greeting">Hello, I'm</div>
            <h1 className="name">Manan Jain</h1>
            <div className="title">
              <span className="title-text">Backend Developer Intern @Volopay</span>
              <span className="verified-badge">
                <i className="fas fa-shield-check"></i>
              </span>
            </div>
            <div className="subtitle">
              Ex-Intern @Springworks, @CRM Landing
            </div>
            <div className="description">
              <p>
                Motivated and diligent B.Tech Computer Science student specializing in Cloud Computing. 
                Proficient in C++, Python, and Java, with expertise in React.js, JavaScript, HTML, and CSS. 
                Skilled in deploying scalable applications using AWS services like EC2, S3, IAM, Lambda, and Cognito.
              </p>
              <p>
                Has hands-on experience in Git repository management. Completed Cloud Practitioner certification 
                and proficient in full-stack development. Excels in collaborative projects and delivering innovative solutions.
              </p>
            </div>
            <div className="highlights">
              <div className="highlight-item">
                <i className="fas fa-code"></i>
                <span>MERN Stack</span>
              </div>
              <div className="highlight-item">
                <i className="fas fa-certificate"></i>
                <span>ServiceNow Certified CSA & CAD</span>
              </div>
              <div className="highlight-item">
                <i className="fab fa-aws"></i>
                <span>AWS Certified Cloud Practitioner</span>
              </div>
              <div className="highlight-item">
                <i className="fas fa-star"></i>
                <span>5 ⭐ HackerRank</span>
              </div>
            </div>
            <div className="cta-buttons">
              <a href="#contact" className="btn btn-primary">Get In Touch</a>
              <a href="#projects" className="btn btn-secondary">View Projects</a>
            </div>
          </div>
          <div className="about-image">
            <div className="image-wrapper">
              <div className="profile-placeholder">
                <i className="fas fa-user"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

