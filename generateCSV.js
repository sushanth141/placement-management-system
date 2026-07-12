const fs = require('fs');

const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Siddharth', 'Rohan', 'Pranav', 'Ishaan', 'Shaurya', 'Kabir', 'Aryan', 'Dhruv', 'Rishi', 'Karan', 'Rahul', 'Sneha', 'Priya', 'Anjali', 'Kavya', 'Neha', 'Pooja', 'Shruti', 'Swati', 'Aditi', 'Riya', 'Ishita', 'Tanvi', 'Ananya', 'Aisha', 'Meera', 'Ritu', 'Simran'];
const lastNames = ['Sharma', 'Reddy', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Rao', 'Deshmukh', 'Joshi', 'Chauhan', 'Verma', 'Yadav', 'Iyer', 'Nair', 'Menon', 'Bose', 'Das', 'Sen', 'Kapoor', 'Malhotra', 'Bhat', 'Shetty'];

let csvContent = 'Name,Email,Role,RollNumber\n';

for (let i = 1; i <= 100; i++) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  
  // Create a realistic email like aarav.sharma26@gmail.com or v.reddy@student.in
  const randomNum = Math.floor(Math.random() * 99) + 1;
  const domains = ['gmail.com', 'student.edu.in', 'college.ac.in', 'yahoo.in'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@${domain}`;
  
  // Create a realistic Roll Number like 2024CS001
  const branch = ['CS', 'IT', 'EC', 'ME', 'CE'][Math.floor(Math.random() * 5)];
  const roll = `2024${branch}${i.toString().padStart(3, '0')}`;
  
  csvContent += `${name},${email},student,${roll}\n`;
}

// Add 5 sample companies
csvContent += 'TCS HR,careers@tcs.com,company,\n';
csvContent += 'Infosys Recruitment,talent@infosys.com,company,\n';
csvContent += 'Wipro Hiring,jobs@wipro.com,company,\n';
csvContent += 'Tech Mahindra,hr@techmahindra.com,company,\n';
csvContent += 'HCL Technologies,careers@hcl.com,company,\n';

fs.writeFileSync('sample_students.csv', csvContent);
console.log('✅ Generated sample_students.csv with 105 records (100 students, 5 companies)!');
