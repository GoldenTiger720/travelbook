import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Carousel data
  const carouselData = [
    {
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop",
      title: "Reset Your Password Securely",
      description: "We'll send you a secure link to reset your password and get you back to planning your next adventure."
    },
    {
      image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=1920&h=1080&fit=crop",
      title: "Your Account Security Matters",
      description: "Our secure password reset process ensures your account remains protected while giving you easy access."
    },
    {
      image: "https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=1920&h=1080&fit=crop",
      title: "Back to Exploring Soon",
      description: "Reset your password in just a few steps and continue discovering amazing destinations around the world."
    }
  ]

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  const handleResend = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      alert("Reset link has been resent to your email")
    }, 1000)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Forgot Password Form (1/3 of screen) */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Back to Sign In Link */}
          <Link 
            to="/signin" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>

          {/* Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">TravelBook</h1>
            <p className="mt-2 text-sm text-muted-foreground">Reset Password</p>
          </div>

          {!isSubmitted ? (
            <>
              {/* Reset Instructions */}
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Forgot your password?</h2>
                <p className="text-sm text-muted-foreground">
                  No worries! Enter your email address below and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Remember your password? </span>
                  <Link to="/signin" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold">Check your email</h2>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to:
                  </p>
                  <p className="font-medium">{email}</p>
                </div>

                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    The link will expire in 1 hour. If you don't see the email, check your spam folder.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/signin')} 
                    className="w-full h-12 text-base"
                  >
                    Back to Sign In
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleResend}
                    className="w-full h-12 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? "Resending..." : "Resend Email"}
                  </Button>
                </div>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Need help? </span>
                  <Link to="/support" className="text-primary hover:underline font-medium">
                    Contact Support
                  </Link>
                </div>
              </div>
            </>
          )}
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
            
            {/* Quote */}
            <div className="mt-8 animate-fadeIn animation-delay-400">
              <p className="text-sm italic opacity-90">
                "The world is a book, and those who do not travel read only one page."
              </p>
              <p className="mt-2 text-sm font-medium">
                Saint Augustine
              </p>
            </div>
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

export default ForgotPasswordPage