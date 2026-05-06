import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const FAQs = () => {
  const { user } = useContext(AuthContext);
  const [openIndex, setOpenIndex] = useState(null);

  const candidateFaqs = [
    {
      question: "How do I update my resume?",
      answer: "You can update your resume by navigating to the Profile page from the top right dropdown menu. There, you'll find a 'Manage Resume' section where you can upload a new PDF or Word document."
    },
    {
      question: "Can recruiters see my contact details?",
      answer: "Yes, once you apply for a job, the recruiter who posted that job will be able to see the contact details you provided in your Profile, such as your phone number and email."
    },
    {
      question: "How do the job filters work?",
      answer: "The job search page allows you to filter by keywords, location, and experience level. Selecting an experience level like 'Fresher' will specifically return jobs that recruiters have tagged as entry-level."
    },
    {
      question: "How do I change my profile picture?",
      answer: "Go to your Profile page and click on the camera icon over your current avatar or initial. Select a new image file, and it will be updated instantly."
    },
    {
      question: "What happens when I 'Apply Now'?",
      answer: "Your profile details and your latest resume are securely sent to the recruiter's dashboard. Your application status will initially be marked as 'Applied', and you can track it on your Candidate Dashboard."
    }
  ];

  const recruiterFaqs = [
    {
      question: "How do I post a new job?",
      answer: "Navigate to your Dashboard and click the '+ Post a New Job' button. Fill out the title, description, and other details to make it live instantly."
    },
    {
      question: "Can I edit a job posting after it's published?",
      answer: "Yes! On your Dashboard, click the 'Edit' button next to any of your listed jobs to update the title, description, keywords, or salary."
    },
    {
      question: "How do I review applications?",
      answer: "Go to your Dashboard and click 'View Applicants' on any of your active jobs. You will see a list of candidates along with their contact info, profile details, and a link to download their resume."
    },
    {
      question: "How do I update a candidate's status?",
      answer: "In the applicant list for a specific job, there is a 'Status' dropdown next to each candidate. You can change their status to 'Shortlisted', 'Accepted', or 'Rejected' to keep track of your hiring pipeline."
    },
    {
      question: "How do I change my company name or profile picture?",
      answer: "You can update your personal details and company name by navigating to your Profile from the top right dropdown menu. Click the camera icon to upload a company logo or profile picture."
    }
  ];

  const faqs = user?.role === 'recruiter' ? recruiterFaqs : candidateFaqs;

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <div className="card">
        <h2 style={{ color: 'var(--primary-blue)', marginBottom: '30px', textAlign: 'center' }}>Frequently Asked Questions</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              style={{ 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                overflow: 'hidden',
                backgroundColor: 'var(--bg-color)'
              }}
            >
              <button 
                onClick={() => toggleFaq(index)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px 20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '1.05rem',
                  fontWeight: 500,
                  color: 'var(--text-dark)'
                }}
              >
                {faq.question}
                <span style={{ fontSize: '1.2rem', color: 'var(--primary-blue)', transform: openIndex === index ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease' }}>
                  +
                </span>
              </button>
              
              {openIndex === index && (
                <div style={{ padding: '0 20px 20px 20px', color: 'var(--text-gray)', lineHeight: '1.6' }}>
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQs;
