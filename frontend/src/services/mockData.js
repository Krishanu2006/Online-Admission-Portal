export const mockApplication = {
  id: "IEM202600123",
  status: "Under Review",
  course: "B.Tech Computer Science & Engineering",
  student: {
    name: "Krishanu Das",
    email: "student@example.com",
    mobile: "+91 98765 43210",
    dob: "2006-08-12"
  },
  personal: {
    gender: "Male",
    fatherName: "Anil Das",
    motherName: "Madhuri Das",
    category: "General",
    nationality: "Indian"
  },
  address: "Kolkata, West Bengal, India",
  academic: {
    board: "WBCHSE",
    examination: "Higher Secondary",
    year: "2024",
    marks: "91.4%"
  },
  documents: [
    { name: "Class 10 Marksheet.pdf", type: "Class 10 Marksheet", size: "1.2 MB" },
    { name: "Class 12 Marksheet.pdf", type: "Class 12 Marksheet", size: "1.4 MB" },
    { name: "Photo.jpg", type: "Photograph", size: "420 KB" }
  ],
  payment: {
    amount: "₹1,500",
    status: "Paid",
    transactionId: "TXN-IEM-482910"
  },
  submittedAt: "03 October 2026, 05:40 PM"
};

export const mockAdminApplications = [
  {
    id: "IEM202600123",
    student: "Krishanu Das",
    course: "B.Tech CSE",
    status: "Under Review",
    submitted: "03 Oct 2026"
  },
  {
    id: "IEM202600124",
    student: "Aarav Sharma",
    course: "B.Tech CSE",
    status: "Submitted",
    submitted: "03 Oct 2026"
  },
  {
    id: "IEM202600125",
    student: "Riya Sen",
    course: "B.Tech IT",
    status: "Approved",
    submitted: "02 Oct 2026"
  },
  {
    id: "IEM202600126",
    student: "Aditya Roy",
    course: "B.Tech CSE",
    status: "Rejected",
    submitted: "01 Oct 2026"
  }
];