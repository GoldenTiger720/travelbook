// Helper function to generate avatar URL
export const generateAvatar = (name: string, seed?: string) => {
  const colors = ["6366f1", "22c55e", "ec4899", "f59e0b", "64748b", "8b5cf6", "14b8a6", "ef4444"];
  const colorIndex = seed ? seed.charCodeAt(0) % colors.length : Math.floor(Math.random() * colors.length);
  const bgColor = colors[colorIndex];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=fff&size=128&bold=true`;
};

// Get status badge color
export const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-success text-success-foreground"
    case "vip": return "bg-primary text-primary-foreground"
    case "inactive": return "bg-muted text-muted-foreground"
    default: return "bg-secondary text-secondary-foreground"
  }
}

// Initial customer form data
export const getInitialCustomerForm = () => ({
  name: "",
  id_number: "",
  email: "",
  phone: "",
  language: "",
  country: "",
  cpf: "",
  address: "",
  hotel: "",
  room: "",
  comments: ""
})

// Validate customer form
export const validateCustomerForm = (customer: any) => {
  const errors: Record<string, string> = {}

  // Validate full name
  if (!customer.name.trim()) {
    errors.name = "Full name is required"
  } else if (customer.name.trim().length < 2) {
    errors.name = "Full name must be at least 2 characters"
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!customer.email.trim()) {
    errors.email = "Email is required"
  } else if (!emailRegex.test(customer.email)) {
    errors.email = "Please enter a valid email address"
  }

  // Validate phone
  if (!customer.phone.trim()) {
    errors.phone = "Phone number is required"
  }

  // Validate ID/Passport
  if (!customer.id_number.trim()) {
    errors.id_number = "ID/Passport is required"
  }

  return errors
}
