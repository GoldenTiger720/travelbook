import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useSignUp } from "@/lib/hooks/useAuth"
import { toast } from "sonner"

const SignUpPage = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [backendErrors, setBackendErrors] = useState<Record<string, string[]>>({})
  
  // Handle backend field errors
  const handleFieldErrors = (errors: Record<string, string[]>) => {
    setBackendErrors(errors)
  }
  
  const signUpMutation = useSignUp(handleFieldErrors)
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Carousel data
  const carouselData = [
    {
      image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1920&h=1080&fit=crop",
      title: "Join Our Travel Community",
      description: "Connect with fellow travelers and share your adventures. Discover hidden gems and create lasting friendships along the way."
    },
    {
      image: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1920&h=1080&fit=crop",
      title: "Exclusive Member Benefits",
      description: "Get access to special deals, early bird discounts, and personalized travel recommendations tailored to your preferences."
    },
    {
      image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&h=1080&fit=crop",
      title: "Start Your Journey Today",
      description: "Sign up now and unlock a world of possibilities. Your next adventure is just a few clicks away."
    }
  ]

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    // Clear backend error for this field when user starts typing
    if (backendErrors[name]) {
      setBackendErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const isFormComplete = (): boolean => {
    return (
      formData.fullName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.password !== "" &&
      formData.confirmPassword !== "" &&
      agreeTerms
    )
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Validate full name
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required"
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters"
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      errors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    // Validate phone number
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!phoneRegex.test(formData.phone.replace(/[\s\-()]/g, ''))) {
      errors.phone = "Please enter a valid phone number"
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }
    
    // Validate terms agreement
    if (!agreeTerms) {
      errors.terms = "You must agree to the terms and conditions"
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }
    
    // Submit to backend
    try {
      await signUpMutation.mutateAsync({
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        password: formData.password
      })
    } catch (error) {
      // Error is handled by the mutation hook
      console.error("Sign up error:", error)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Sign Up Form (1/3 of screen) */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-4 lg:p-6 bg-background overflow-y-auto">
        <div className="w-full max-w-md space-y-4">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-primary">TravelBook</h1>
            <p className="mt-1 text-sm text-muted-foreground">Create Account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={signUpMutation.isPending}
                  className={`h-10 ${validationErrors.fullName || backendErrors.fullName ? 'border-destructive' : ''}`}
                />
                {validationErrors.fullName && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.fullName}</p>
                )}
                {backendErrors.fullName && backendErrors.fullName.map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                ))}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={signUpMutation.isPending}
                  className={`h-10 ${validationErrors.email || backendErrors.email ? 'border-destructive' : ''}`}
                />
                {validationErrors.email && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.email}</p>
                )}
                {backendErrors.email && backendErrors.email.map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                ))}
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={signUpMutation.isPending}
                  className={`h-10 ${validationErrors.phone || backendErrors.phone ? 'border-destructive' : ''}`}
                />
                {validationErrors.phone && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.phone}</p>
                )}
                {backendErrors.phone && backendErrors.phone.map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                ))}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={signUpMutation.isPending}
                    className={`h-10 pr-10 ${validationErrors.password || backendErrors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={signUpMutation.isPending}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.password}</p>
                )}
                {backendErrors.password && backendErrors.password.map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive mt-1">{error}</p>
                ))}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={signUpMutation.isPending}
                    className={`h-10 pr-10 ${validationErrors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={signUpMutation.isPending}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                    disabled={signUpMutation.isPending}
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal cursor-pointer"
                  >
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms and Conditions
                    </Link>
                  </Label>
                </div>
                {validationErrors.terms && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.terms}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 text-sm"
              disabled={signUpMutation.isPending || !isFormComplete()}
            >
              {signUpMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/signin" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </form>

        </div>
      </div>

      {/* Right side - Carousel (2/3 of screen) */}
      <div className="hidden lg:block lg:w-2/3 relative overflow-hidden">
        {/* Animated Rising Squares */}
        <div className="absolute inset-0 z-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-rise"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            >
              <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-sm" />
            </div>
          ))}
        </div>

        {/* Carousel Images */}
        <div className="relative h-full">
          {carouselData.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>
          ))}

          {/* Carousel Text */}
          <div className="absolute bottom-20 left-10 right-10 z-20 text-white">
            <h2 className="text-4xl font-bold mb-4 animate-fadeIn">
              {carouselData[currentSlide].title}
            </h2>
            <p className="text-lg max-w-2xl animate-fadeIn animation-delay-200">
              {carouselData[currentSlide].description}
            </p>
            
            {/* Author */}
            <p className="mt-6 text-sm font-medium animate-fadeIn animation-delay-400">
              Christopher Columbus
            </p>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-10 left-10 flex gap-2 z-20">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-white"
                    : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes rise {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-rise {
          animation: rise linear infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  )
}

export default SignUpPage