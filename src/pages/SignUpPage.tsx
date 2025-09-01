import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"

const SignUpPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
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
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop",
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!")
      return
    }
    if (!agreeTerms) {
      alert("Please agree to the terms and conditions")
      return
    }
    // Handle sign up logic here
    console.log("Sign up:", formData)
    navigate("/signin")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Sign Up Form (1/3 of screen) */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">TravelBook</h1>
            <p className="mt-2 text-sm text-muted-foreground">Create Account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
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
            </div>

            <Button type="submit" className="w-full h-12 text-base">
              Create Account
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/signin" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </form>

          {/* Social Sign Up */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or sign up with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12"
              onClick={() => console.log("Google signup")}
            >
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mr-2">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              Google
            </Button>
          </div>
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

      <style jsx>{`
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