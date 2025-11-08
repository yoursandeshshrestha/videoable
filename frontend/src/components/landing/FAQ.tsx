import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is Videoable and who is it for?",
    answer:
      "Videoable is an AI-powered video editing tool designed for content creators, marketers, and anyone who needs to quickly add and customize subtitles to their videos. It's perfect for social media creators, educators, and anyone looking to enhance their video content with professional subtitles without complex software.",
  },
  {
    question: "What video formats are supported?",
    answer:
      "Videoable supports common video formats including MP4, MOV, AVI, and WebM. You can upload videos of any resolution, and the AI will process them to add customizable subtitles. Export your final video with burned-in subtitles in MP4 format for universal compatibility.",
  },
  {
    question: "How does the AI subtitle generation work?",
    answer:
      "Our AI uses advanced speech recognition to automatically transcribe your video's audio into accurate subtitles. You can then use natural language commands to customize the style, position, font, color, and timing of your subtitles. The AI understands your requests and applies changes instantly.",
  },
  {
    question: "Can I customize subtitle styles?",
    answer:
      "Yes! You can fully customize subtitle appearance using natural language. Simply chat with the AI to change fonts, colors, sizes, positioning, background styles, animations, and more. You can also manually edit the subtitle text and timing for perfect accuracy.",
  },
  {
    question: "Is Videoable free to use? Do I need an account?",
    answer:
      "Videoable offers a free tier with basic features. Premium features like advanced customization options and higher resolution exports are available with a subscription. An account is required to save your projects and access the video editor.",
  },
  {
    question: "How do I export my finished videos?",
    answer:
      "Once you're happy with your video and subtitles, simply click the export button in the editor. Your video will be processed with the subtitles burned in, and you can download the final MP4 file. The export process typically takes a few minutes depending on video length.",
  },
];

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="w-full flex justify-center items-start bg-[#f7f5f3]">
      <div className="flex-1 px-4 md:px-8 py-16 md:py-20 flex flex-col lg:flex-row justify-start items-start gap-6 lg:gap-12 max-w-[1400px]">
        {/* Left Column - Header */}
        <motion.div
          className="w-full lg:flex-1 flex flex-col justify-center items-start gap-4 lg:py-5"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="w-full flex flex-col justify-center text-[#37322f] font-normal leading-tight md:leading-[44px] font-serif text-4xl tracking-tight">
            Frequently Asked Questions
          </div>
          <div className="w-full text-[#37322f]/80 text-lg font-medium leading-7 font-sans">
            Everything you need to know about editing your videos with
            AI-powered subtitles.
          </div>
        </motion.div>

        {/* Right Column - FAQ Items */}
        <div className="w-full lg:flex-1 flex flex-col justify-center items-center">
          <div className="w-full flex flex-col">
            {faqData.map((item, index) => {
              const isOpen = openItems.includes(index);
              return (
                <motion.div
                  key={index}
                  className="w-full border-b border-[#37322f]/10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                >
                  <motion.button
                    onClick={() => toggleItem(index)}
                    className="w-full px-5 py-[18px] flex justify-between items-center gap-5 text-left hover:bg-white/50 transition-colors duration-200"
                    aria-expanded={isOpen}
                  >
                    <div className="flex-1 text-[#37322f] text-base font-medium leading-6 font-sans">
                      {item.question}
                    </div>
                    <motion.div
                      className="flex justify-center items-center"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ChevronDown className="w-6 h-6 text-[#37322f]/60" />
                    </motion.div>
                  </motion.button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                          transition: {
                            height: {
                              duration: 0.4,
                              ease: [0.04, 0.62, 0.23, 0.98],
                            },
                            opacity: {
                              duration: 0.3,
                              delay: 0.1,
                            },
                          },
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                          transition: {
                            height: {
                              duration: 0.3,
                              ease: [0.04, 0.62, 0.23, 0.98],
                            },
                            opacity: {
                              duration: 0.2,
                            },
                          },
                        }}
                        className="overflow-hidden"
                      >
                        <motion.div
                          className="px-5 pb-[18px] pt-0 text-[#37322f]/80 text-base font-normal leading-6 font-sans"
                          initial={{ y: -10 }}
                          animate={{ y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          {item.answer}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
