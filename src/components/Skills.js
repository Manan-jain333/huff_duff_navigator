import React from 'react';
import '../styles/Skills.css';

const Skills = () => {
  const skillCategories = [
    {
      title: "Languages",
      skills: ["C++", "Python", "Java", "HTML/CSS", "JavaScript", "TypeScript", "SQL"]
    },
    {
      title: "Frontend",
      skills: ["React", "Redux Toolkit", "JavaScript", "HTML5", "CSS3"]
    },
    {
      title: "Backend",
      skills: ["Node.js", "Express.js", "MongoDB", "REST APIs"]
    },
    {
      title: "Cloud & DevOps",
      skills: ["AWS (EC2, S3, IAM, Lambda, RDS, Cognito, Personalize, Lex)", "Docker", "Git", "GitHub"]
    },
    {
      title: "Tools & Others",
      skills: ["Git Bash", "Figma", "WordPress", "Elementor", "PowerBI"]
    }
  ];

  return (
    <section id="skills" className="skills-section">
      <div className="container">
        <h2 className="section-title">
          <span className="title-number">04.</span>
          <span className="title-text">Technical Skills</span>
          <span className="title-line"></span>
        </h2>
        <div className="skills-container">
          {skillCategories.map((category, index) => (
            <div key={index} className="skill-category">
              <h3 className="category-title">{category.title}</h3>
              <div className="skills-list">
                {category.skills.map((skill, idx) => (
                  <div key={idx} className="skill-item">
                    <i className="fas fa-check-circle"></i>
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;


