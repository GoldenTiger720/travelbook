import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"

const SignInPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Carousel data
  const carouselData = [
    {
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=1080&fit=crop",
      title: "Discover Amazing Destinations",
      description: "Explore breathtaking locations around the world with our curated travel experiences. From mountains to beaches, we have it all."
    },
    {
      image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&h=1080&fit=crop",
      title: "Unforgettable Adventures Await",
      description: "Create memories that last a lifetime with our expertly guided tours and unique travel packages tailored just for you."
    },
    {
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop",
      title: "Travel with Confidence",
      description: "Join thousands of satisfied travelers who trust us to deliver exceptional service and unforgettable journeys worldwide."
    }
  ]

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle sign in logic here
    console.log("Sign in:", { email, password, rememberMe })
    navigate("/")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Sign In Form (1/3 of screen) */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">TravelBook</h1>
            <p className="mt-2 text-sm text-muted-foreground">Login</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail or user</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter e-mail or user"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base">
              Sign in
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </form>

          {/* Social Login */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12"
              onClick={() => console.log("Google login")}
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
              Mark Twain
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

export default SignInPage