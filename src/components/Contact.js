import React from 'react';
import '../styles/Contact.css';

const Contact = () => {
  const contactInfo = [
    {
      icon: "fas fa-phone",
      label: "Phone",
      value: "+91 9461061450",
      link: "tel:+919461061450"
    },
    {
      icon: "fas fa-envelope",
      label: "Email",
      value: "mananjain8892@gmail.com",
      link: "mailto:mananjain8892@gmail.com"
    },
    {
      icon: "fab fa-linkedin",
      label: "LinkedIn",
      value: "linkedin.com/in/manan-jain-67a7b2258",
      link: "https://www.linkedin.com/in/manan-jain-67a7b2258/"
    },
    {
      icon: "fas fa-map-marker-alt",
      label: "Location",
      value: "Bhilwara, Rajasthan",
      link: null
    }
  ];

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <h2 className="section-title">
          <span className="title-number">07.</span>
          <span className="title-text">Get In Touch</span>
          <span className="title-line"></span>
        </h2>
        <div className="contact-content">
          <div className="contact-info">
            <p className="contact-description">
              I'm always open to discussing new opportunities, interesting projects, 
              or just having a chat about technology. Feel free to reach out!
            </p>
            <div className="contact-details">
              {contactInfo.map((info, index) => (
                <div key={index} className="contact-item">
                  <div className="contact-icon">
                    <i className={info.icon}></i>
                  </div>
                  <div className="contact-text">
                    <span className="contact-label">{info.label}</span>
                    {info.link ? (
                      <a href={info.link} target="_blank" rel="noopener noreferrer" className="contact-value">
                        {info.value}
                      </a>
                    ) : (
                      <span className="contact-value">{info.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} Manan Jain. All rights reserved.</p>
          <p>Built with React, HTML, CSS, and JavaScript</p>
        </footer>
      </div>
    </section>
  );
};

export default Contact;


