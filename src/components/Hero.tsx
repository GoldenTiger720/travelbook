import { cn } from "@/lib/utils"

interface HeroProps {
  title: string
  subtitle?: string
  backgroundImage: string
  className?: string
}

export function Hero({ title, subtitle, backgroundImage, className }: HeroProps) {
  return (
    <div 
      className={cn(
        "relative w-full h-64 bg-cover bg-center bg-no-repeat flex items-center justify-center",
        "before:absolute before:inset-0 before:bg-black/50",
        className
      )}
      style={{
        backgroundImage: `url('${backgroundImage}')`
      }}
    >
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">{title}</h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-white/90">{subtitle}</p>
        )}
      </div>
    </div>
  )
}