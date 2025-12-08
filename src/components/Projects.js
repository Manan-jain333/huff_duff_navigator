import React from 'react';
import '../styles/Projects.css';

const Projects = () => {
  const projects = [
    {
      name: "Huff-Duff: The Bennett Navigator",
      technologies: ["Python", "HTML", "CSS", "JavaScript", "Figma", "GitHub"],
      description: "Developed an interactive navigation system for Bennett University that helps students locate classes efficiently using user-friendly maps, reducing delays and confusion. Designed intuitive UI/UX prototypes in Figma and implemented responsive front-end features.",
      icon: "fas fa-map-marked-alt"
    },
    {
      name: "Order Ease",
      technologies: ["HTML", "CSS", "JavaScript", "React", "MongoDB", "Node.js", "Express.js"],
      description: "Developed a full-stack restaurant delivery and takeaway platform for university students with QR code payments, order tracking, and real-time updates. Collaborated with campus dining outlets to streamline ordering and offer diverse dining options.",
      icon: "fas fa-utensils"
    },
    {
      name: "Eventify",
      technologies: ["Docker", "Render", "MongoDB Atlas", "Cloudinary", "Node.js", "JavaScript", "HTML", "CSS"],
      description: "Developed a responsive event management web app for students, guests, and admins with event image uploads via Cloudinary and CRUD operations using MongoDB Atlas. Containerized backend with Docker Compose and deployed on Render with GitHub CI/CD for seamless deployment and automated updates.",
      icon: "fas fa-calendar-alt"
    }
  ];

  return (
    <section id="projects" className="projects-section">
      <div className="container">
        <h2 className="section-title">
          <span className="title-number">03.</span>
          <span className="title-text">Projects</span>
          <span className="title-line"></span>
        </h2>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              <div className="project-icon">
                <i className={project.icon}></i>
              </div>
              <h3 className="project-name">{project.name}</h3>
              <p className="project-description">{project.description}</p>
              <div className="project-technologies">
                {project.technologies.map((tech, idx) => (
                  <span key={idx} className="tech-tag">{tech}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;


