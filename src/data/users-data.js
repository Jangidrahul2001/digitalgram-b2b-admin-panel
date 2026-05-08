export const initialUsers = Array.from({ length: 50 }, (_, i) => {
  const statuses = ["active", "active", "active", "inactive"]; // MORE active than inactive
  const roles = ["Retailer", "Distributor", "Master Distributor", "State Head"];
  const indianFirstNames = ["Aarav", "Vihaan", "Aditya", "Sai", "Ishaan", "Shaurya", "Rohan", "Priya", "Ananya", "Diya", "Isha", "Riya", "Kavya", "Monika", "Shova", "Rishi", "Shyam", "Tonika", "Ashok"];
  const indianLastNames = ["Patel", "Sharma", "Singh", "Kumar", "Gupta", "Rao", "Jain", "Mehta", "Barman", "Jangid", "Rathore", "Saini"];
  
  const firstName = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
  const lastName = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
  const role = roles[Math.floor(Math.random() * roles.length)];
  
  // Package mapping
  const pkgMap = {
      "Retailer": "RT",
      "Distributor": "DT",
      "Master Distributor": "MD",
      "State Head": "ST"
  };

  return {
    id: "U" + Math.floor(100000 + Math.random() * 900000).toString(), // U + 6 digits
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
    mobile: "9" + Math.floor(100000000 + Math.random() * 900000000).toString(),
    role: role,
    package: pkgMap[role],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    kycStatus: ["Approved", "Pending", "Rejected"][Math.floor(Math.random() * 3)],
  };
});
