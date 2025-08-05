import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InternshipForm.css";
import Header from '../components/Navbar'

// 🔄 Normalization map for popular companies
const companyNameMap = {
  "jpmorgan chase": "JPMC",
  "jp morgan chase": "JPMC",
  "jpmorgan chase & co.": "JPMC",
  "jpmorgan chase and co": "JPMC",
  "jpmorgan chase & co": "JPMC",
  "jpmorgan and chase": "JPMC",
  "jpmc": "JPMC",
  "j p morgan": "JPMC",
  "jpmorganchase": "JPMC",

  "amazon": "Amazon",
  "amazon inc": "Amazon",
  "amazon.com": "Amazon",

  "google": "Google",
  "google inc": "Google",
  "alphabet": "Google",

  "microsoft": "Microsoft",
  "msft": "Microsoft",

  "tcs": "TCS",
  "tata consultancy services": "TCS",

  "infosys": "Infosys",
  "infy": "Infosys",

  "wipro": "Wipro",

  "cognizant": "Cognizant",
  "cts": "Cognizant",

  "accenture": "Accenture",

  "uravu labs": "Uravu Labs",
  "uravu laboratories": "Uravu Labs",
  "Uravu Laboratories":"Uravu Labs",
  "Uravu laboratories":"Uravu Labs",
  "tech mahindra": "Tech Mahindra",
  "choice solutions limited": "Choice Solutions",
  "choice solutions": "Choice Solutions",
  "drdo": "DRDO"
  // Add more as needed
};


function InternshipForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    rollNo: "",
    name: "",
    branch: "",
    semester: "",
    section: "",
    email: "",
    phoneNo: "",
    role: "",
    organizationName: "",
    hrEmail: "",
    hrPhone: "",
    duration: "",
    package: "",
    startDate: "",
    endDate: "",
    internshipType: ""
  });

  const [errors, setErrors] = useState({});
  const [offerFile, setOfferFile] = useState(null);
  const [approvalFile, setApprovalFile] = useState(null);
  const [nocFile, setNocFile] = useState(null);
  const [uniqueCompanies, setUniqueCompanies] = useState([]);


  const semesters = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData };

    if (name === "organizationName") {
      const inputValue = value.toLowerCase().trim();
      const normalized = companyNameMap[inputValue] || value;
      updatedFormData.organizationName = normalized;
    } else {
      updatedFormData[name] = value;
    }

    if (name === "internshipType") {
      if (value === "Unpaid") updatedFormData.package = "0";
      else if (value === "Paid" && formData.package === "0") updatedFormData.package = "";
    }

    if (name === "startDate" || name === "endDate") {
      const start = new Date(name === "startDate" ? value : formData.startDate);
      const end = new Date(name === "endDate" ? value : formData.endDate);
      if (start && end && start < end) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let duration = diffDays >= 30
          ? `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""}` +
            (diffDays % 30 > 0 ? ` ${diffDays % 30} day${diffDays % 30 > 1 ? "s" : ""}` : "")
          : `${diffDays} day${diffDays > 1 ? "s" : ""}`;
        updatedFormData.duration = duration;
      } else {
        updatedFormData.duration = "";
      }
    }

    setFormData(updatedFormData);

    if (name === "email" && !value.endsWith("@vnrvjiet.in")) {
      setErrors({ ...errors, email: "Email must end with @vnrvjiet.in" });
    } else if (name === "phoneNo" && !/^\d{10}$/.test(value)) {
      setErrors({ ...errors, phoneNo: "Mobile number must be exactly 10 digits" });
    } else if (name === "hrPhone" && !/^\d{10}$/.test(value)) {
      setErrors({ ...errors, hrPhone: "HR mobile number must be exactly 10 digits" });
    } else if (name === "hrEmail" && !/^\S+@\S+\.\S+$/.test(value)) {
      setErrors({ ...errors, hrEmail: "Enter a valid HR email address" });
    } else {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    for (const key in formData) {
      if (key === "internshipType") continue;
      if (formData[key].trim() === "") {
        alert(`${key} is required.`);
        return false;
      }
    }
    if (!offerFile || !approvalFile || !nocFile) {
      alert("All files are required.");
      return false;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert("Start Date must be earlier than End Date.");
      return false;
    }
    if (!formData.email.endsWith("@vnrvjiet.in")) {
      alert("Email must end with @vnrvjiet.in");
      return false;
    }
    if (!/^\d{10}$/.test(formData.phoneNo)) {
      alert("Mobile number must be exactly 10 digits.");
      return false;
    }
    if (!/^\d{10}$/.test(formData.hrPhone)) {
      alert("HR Mobile number must be exactly 10 digits.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    let durationValue = formData.duration;
    const rollNo = formData.rollNo;

    const renamedOfferFile = offerFile ? new File([offerFile], `${rollNo}_offer.pdf`, { type: offerFile.type }) : null;
    const renamedApprovalFile = approvalFile ? new File([approvalFile], `${rollNo}_approval.pdf`, { type: approvalFile.type }) : null;
    const renamedNocFile = nocFile ? new File([nocFile], `${rollNo}_noc.pdf`, { type: nocFile.type }) : null;

    const form = new FormData();
    for (const key in formData) {
      if (key !== "internshipType") {
        form.append(key, key === "duration" ? durationValue : formData[key]);
      }
    }
    if (renamedOfferFile) form.append("offerLetter", renamedOfferFile);
    if (renamedApprovalFile) form.append("applicationLetter", renamedApprovalFile);
    if (renamedNocFile) form.append("noc", renamedNocFile);

    try {
      const res = await fetch("http://localhost:8080/api/internships/submit", {
        method: "POST",
        body: form
      });

      if (res.ok) {
        alert("Internship details submitted successfully!");
        navigate("/home");
      } else {
        const errorData = await res.json();
        alert("Submission failed: " + (errorData.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("An error occurred.");
    }
  };
    
  const fetchInternships = async () => {
    const query = buildQuery();
    try {
      const res = await axios.get(`http://localhost:8080/api/admin/internships/filter?${query}`);
      const data = Array.isArray(res.data) ? res.data : res.data.internships || [];
      setInternships(data);
  
      
      const companies = [...new Set(
        data.map(i => (i.organizationName || "").trim().toUpperCase())
      )].filter(Boolean).sort();
  
      setUniqueCompanies(companies);
      
  
    } catch (err) {
      console.error("Error fetching internships:", err);
      setInternships([]);
      setUniqueCompanies([]);
    }
  };
  

  return (
    <>
      <div className="header">
       <Header/>
      </div>
      <button className="back-btn btn btn-secondary my-1 mx-2" onClick={() => navigate('/home')}>
        ⬅ Back to Home
      </button>
      <div className="form-container">
        <h1>UG/PG Internship Portal</h1>
        <form className="internship-form" onSubmit={handleSubmit}>
          {["rollNo", "name", "branch", "section", "email", "phoneNo", "role", "organizationName", "hrEmail", "hrPhone", "duration", "package"].map((field) => (
            <div className="form-row" key={field}>
              <input
                type={field === "email" || field === "hrEmail" ? "email" : "text"}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={formData[field]}
                onChange={handleChange}
                required
              />
              {errors[field] && <span className="error">{errors[field]}</span>}
            </div>
          ))}

          <div className="form-row">
            <label>Semester</label>
            <select name="semester" value={formData.semester} onChange={handleChange} required>
              <option value="">Select Semester</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Internship Type</label>
            <select name="internshipType" value={formData.internshipType} onChange={handleChange} required>
              <option value="">Select Type</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          <div className="form-row">
            <label>Start-Date</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label>End-Date</label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Upload Offer Letter:(eg.rollno_offer.pdf)</label>
            <div className="custom-file-upload">
              <label htmlFor="offerFile" className="upload-btn">Choose File</label>
              <input id="offerFile" type="file" accept=".pdf" style={{ display: "none" }}
                onChange={(e) => setOfferFile(e.target.files[0])} required />
              <span className="file-name">
                {offerFile ? `${formData.rollNo || "ROLLNO"}_offer.pdf` : "No file chosen"}
              </span>
            </div>
          </div>

          <div className="form-row">
            <label>Upload Approval Letter:(eg.rollno_approval.pdf)</label>
            <div className="custom-file-upload">
              <label htmlFor="approvalFile" className="upload-btn">Choose File</label>
              <input id="approvalFile" type="file" accept=".pdf" style={{ display: "none" }}
                onChange={(e) => setApprovalFile(e.target.files[0])} required />
              <span className="file-name">
                {approvalFile ? `${formData.rollNo || "ROLLNO"}_approval.pdf` : "No file chosen"}
              </span>
            </div>
          </div>

          <div className="form-row">
            <label>Upload NOC:(eg.rollno_noc.pdf)</label>
            <div className="custom-file-upload">
              <label htmlFor="nocFile" className="upload-btn">Choose File</label>
              <input id="nocFile" type="file" accept=".pdf" style={{ display: "none" }}
                onChange={(e) => setNocFile(e.target.files[0])} required />
              <span className="file-name">
                {nocFile ? `${formData.rollNo || "ROLLNO"}_noc.pdf` : "No file chosen"}
              </span>
            </div>
          </div>

          <div className="submit-container">
            <button type="submit" className="submit-btn">Submit</button>
          </div>
        </form>
      </div>
    </>
  );
}

export default InternshipForm;
