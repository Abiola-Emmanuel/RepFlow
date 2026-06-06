"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import {
  FiActivity,
  FiArrowRight,
  FiDroplet,
  FiMessageCircle,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { IoFootstepsOutline } from "react-icons/io5";
import { MdFitnessCenter } from "react-icons/md";

const featureCards = [
  {
    title: "Water tracker",
    copy: "Hit your daily hydration goal with quick-log buttons and live progress rings.",
    icon: FiDroplet,
    accent: "#60a5fa",
    number: "01",
  },
  {
    title: "Push-up & sit-up log",
    copy: "Track sets and reps, then watch your bests climb week over week.",
    icon: MdFitnessCenter,
    accent: "#f97316",
    number: "02",
  },
  {
    title: "Step counter",
    copy: "Log your daily steps and see progress toward your 10k goal at a glance.",
    icon: IoFootstepsOutline,
    accent: "#b7ff00",
    number: "03",
  },
  {
    title: "AI coach",
    copy: "Chat with your AI coach about activity patterns and get personalized advice.",
    icon: FiMessageCircle,
    accent: "#b7ff00",
    number: "04",
  },
];

const steps = [
  {
    title: "Log your movement",
    description: "Water, reps, and steps in a few quick taps.",
    icon: FiZap,
  },
  {
    title: "Get AI insights",
    description: "Your Groq coach spots patterns and gives real advice.",
    icon: FiTrendingUp,
  },
  {
    title: "Flow daily",
    description: "Small wins stack up while your streak keeps growing.",
    icon: FiActivity,
  },
];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    let frameId;

    function raf(time) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#030303] text-white">
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.025]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9Ii45IiBudW1PY3RhdmVzPSI0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')] bg-repeat mix-blend-overlay" />
      </div>

      <div className="pointer-events-none fixed left-0 top-0 z-0 h-[500px] w-[500px] rounded-full bg-[#b7ff00]/10 blur-[120px]" />
      {/* <div className="pointer-events-none fixed -bottom-64 -right-64 z-0 h-[600px] w-[600px] rounded-full bg-fuchsia-600/10 blur-[140px]" /> */}

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-2xl"
      >
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="group relative text-2xl font-black tracking-normal">
            Rep<span className="text-[#b7ff00]">Flow</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-white/60 md:flex">
            <a href="#features" className="transition hover:text-[#b7ff00]">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-[#b7ff00]">
              How it works
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth" className="hidden text-sm font-semibold text-white/70 transition hover:text-white sm:inline">
              Log in
            </Link>
            <Link
              href="/auth"
              className="group relative overflow-hidden rounded-full border border-[#b7ff00]/30 bg-[#b7ff00] px-5 py-2 text-sm font-bold text-black transition "
            >
              Get started
            </Link>
          </div>
        </nav>
      </motion.header>

      <section ref={heroRef} className="relative min-h-screen overflow-hidden pt-16">
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#b7ff00]/30 bg-black/40 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#b7ff00] backdrop-blur-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#b7ff00] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#b7ff00]" />
            </span>
            Your personal fitness OS
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mx-auto max-w-6xl text-6xl font-black leading-[0.92] tracking-normal sm:text-7xl md:text-8xl lg:text-9xl"
          >
            <span className="block">Track your reps.</span>
            <span className="bg-gradient-to-r from-[#b7ff00] via-[#d4ff4d] to-[#b7ff00] bg-clip-text text-transparent">
              Flow
            </span>{" "}
            your life.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl"
          >
            Water, push-ups, sit-ups, and steps in one beautiful flow. With an AI coach that understands your data.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-[#b7ff00] px-8 py-4 text-sm font-black text-black transition hover:scale-105 "
            >
              Start flowing free
              <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="relative z-10 overflow-hidden border-y border-white/10 bg-[#b7ff00] py-3 text-black">
        <div className="flex animate-[scrollMarquee_20s_linear_infinite] whitespace-nowrap">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex items-center gap-8 pr-8 text-sm font-black uppercase tracking-wider">
              <span>Track reps</span>
              <span>*</span>
              <span>Log water</span>
              <span>*</span>
              <span>Count steps</span>
              <span>*</span>
              <span>AI coaching</span>
              <span>*</span>
              <span>Build streaks</span>
              <span>*</span>
            </div>
          ))}
        </div>
      </div>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-32">
        <div className="mb-20 text-center">
          <p className="mb-4 text-sm font-black uppercase tracking-wider text-[#b7ff00]">Features</p>
          <h2 className="text-5xl font-black tracking-normal md:text-7xl">
            Everything to
            <br />
            <span >
              keep flowing
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-500 hover:border-white/20"
              >
                <div
                  className="absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                  style={{ backgroundColor: feature.accent }}
                />
                <div className="mb-8 flex items-start justify-between">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
                    style={{ color: feature.accent }}
                  >
                    <Icon className="text-2xl" />
                  </div>
                  <span className="text-5xl font-black text-white/[0.04] transition-colors group-hover:text-white/[0.08]">
                    {feature.number}
                  </span>
                </div>
                <h3 className="text-xl font-black">{feature.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/45">{feature.copy}</p>
                <div
                  className="mt-6 h-1 w-0 rounded-full transition-all duration-500 group-hover:w-full"
                  style={{ backgroundColor: feature.accent }}
                />
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 mx-auto max-w-7xl px-6 py-32">
        <div className="mb-20 text-center">
          <p className="mb-4 text-sm font-black uppercase tracking-wider text-[#b7ff00]">How it works</p>
          <h2 className="text-5xl font-black tracking-normal md:text-7xl">
            From log to{" "}
            <span>
              flow
            </span>
          </h2>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3">
          <div className="absolute left-0 top-1/2 hidden h-px w-full bg-gradient-to-r from-transparent via-[#b7ff00]/30 to-transparent md:block" />
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, type: "spring" }}
                className="relative rounded-3xl border border-white/10 bg-black/60 p-8 text-center backdrop-blur-xl"
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full border border-[#b7ff00]/30 bg-black px-4 py-2 text-sm font-black text-[#b7ff00]">
                  0{index + 1}
                </div>
                <div className="mx-auto mb-6 mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#b7ff00]/10 text-3xl text-[#b7ff00]">
                  <Icon />
                </div>
                <h3 className="text-2xl font-black">{step.title}</h3>
                <p className="mt-4 leading-relaxed text-white/45">{step.description}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] border border-white bg-gradient-to-br from-[#b7ff00]/10 via-white/[0.03]  p-12 backdrop-blur-xl md:p-16"
        >
          <h2 className="text-4xl font-black tracking-normal md:text-6xl">Ready to flow?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/50">
            Start tracking today. Your future self is already cheering.
          </p>
          <Link
            href="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#b7ff00] px-8 py-4 text-sm font-black text-black transition hover:scale-105"
          >
            Get started free
            <FiArrowRight />
          </Link>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div>
              <Link href="/" className="text-2xl font-black tracking-normal">
                Rep<span className="text-[#b7ff00]">Flow</span>
              </Link>
              <p className="mt-2 text-sm text-white/40">Built for humans who want to move more.</p>
            </div>
            <div className="flex gap-8 text-sm text-white/50">
              <a href="#features" className="hover:text-[#b7ff00]">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-[#b7ff00]">
                How it works
              </a>
              <Link href="/auth" className="hover:text-[#b7ff00]">
                Get started
              </Link>
            </div>
          </div>
          <div className="mt-10 text-center text-xs text-white/30">
            &copy; {new Date().getFullYear()} RepFlow - your kinetic OS.
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes scrollMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        ::selection {
          background: #b7ff00;
          color: black;
        }
      `}</style>
    </main>
  );
}
