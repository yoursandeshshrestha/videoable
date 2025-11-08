import { motion } from "framer-motion";
import { Button } from "../ui/Button";

interface HeroProps {
  onGetStartedClick: () => void;
  uploading?: boolean;
}

export function Hero({ onGetStartedClick, uploading }: HeroProps) {
  return (
    <section className="relative pt-24 pb-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex items-center">
          {/* Hero Content */}
          <div className="flex flex-col gap-8 max-w-2xl">
            <div className="flex flex-col gap-6">
              <motion.h1
                className="text-[#37322f] text-5xl md:text-6xl font-normal leading-tight md:leading-[70px] font-serif"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
              >
                Transform videos with AI-powered editing
              </motion.h1>
              <motion.p
                className="text-[#37322f]/80 text-lg font-medium leading-7 font-sans"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
              >
                Upload your video and use natural language to add and customize
                subtitles. Chat with AI to style your video exactly how you want it.
              </motion.p>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                ease: [0.25, 0.4, 0.25, 1],
              }}
            >
              <Button 
                onClick={onGetStartedClick}
                disabled={uploading}
                className="h-10 px-12 bg-[#37322f] hover:bg-[#37322f]/90 text-white rounded-full font-medium text-sm shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Get Started by Uploading the Video"}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
