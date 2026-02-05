import Image from 'next/image'

interface CTAProps {
  title: string
  description?: string
  primaryButtonText: string
  primaryButtonLink: string
  secondaryButtonText?: string
  secondaryButtonLink?: string
  backgroundStyle?: 'gradient' | 'solid' | 'image'
  backgroundImage?: string
}

export default function CTA({
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  backgroundStyle = 'gradient',
  backgroundImage
}: CTAProps) {
  const backgroundClasses = {
    gradient: 'bg-gradient-premium from-gray-900 via-gray-700 to-gray-900',
    solid: 'bg-gray-900',
    image: 'relative overflow-hidden'
  }

  return (
    <section className={`${backgroundClasses[backgroundStyle]} section-padding`}>
      {/* Background image overlay if provided */}
      {backgroundStyle === 'image' && backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/80" />
        </div>
      )}

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Decorative element */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-1 bg-gradient-gold rounded-full" />
          </div>

          {/* Content */}
          <div className="space-y-6 animate-fade-up">
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white">
              {title}
            </h2>
            
            {description && (
              <p className="font-sans text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
                {description}
              </p>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <a
                href={primaryButtonLink}
                className="btn bg-gradient-gold text-white hover:shadow-glow hover:scale-105 transform transition-all duration-300 px-8 py-4 text-lg"
              >
                {primaryButtonText}
              </a>
              
              {secondaryButtonText && secondaryButtonLink && (
                <a
                  href={secondaryButtonLink}
                  className="btn border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
                >
                  {secondaryButtonText}
                </a>
              )}
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-12 border-t border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
              <div className="space-y-2">
                <p className="font-heading text-4xl text-brand-yellow">500+</p>
                <p className="font-sans text-sm uppercase tracking-wider">Events Delivered</p>
              </div>
              <div className="space-y-2">
                <p className="font-heading text-4xl text-brand-yellow">5.0★</p>
                <p className="font-sans text-sm uppercase tracking-wider">Customer Rating</p>
              </div>
              <div className="space-y-2">
                <p className="font-heading text-4xl text-brand-yellow">30min</p>
                <p className="font-sans text-sm uppercase tracking-wider">Average Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-austin-lake/10 rounded-full blur-3xl" />
    </section>
  )
}