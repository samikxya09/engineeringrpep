import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { ENGINEERING_FACULTIES, PLATFORM_FEATURES } from "../utils/constants";
import { facultyService } from "../services/api";

const Home = () => {
  const [faculties, setFaculties] = useState(ENGINEERING_FACULTIES);
  const [loadingFaculties, setLoadingFaculties] = useState(true);

  useEffect(() => {
    const loadFaculties = async () => {
      try {
        const res = await facultyService.getAll();
        const list = res.faculties || res.data || (Array.isArray(res) ? res : []);
        if (list && list.length > 0) {
          setFaculties(list);
        }
      } catch (err) {
        console.warn("Using fallback faculties for homepage:", err.message);
      } finally {
        setLoadingFaculties(false);
      }
    };
    loadFaculties();
  }, []);
  return (
    <div className="space-y-24 py-12 md:py-20 text-[var(--text-primary)] transition-colors duration-200">
      
      {/* 1. Hero Section: Editorial & Spacious */}
      <section className="max-w-4xl mx-auto px-6 text-center space-y-8">
        
        {/* Subtle pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[12px] text-[var(--text-secondary)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)]" />
          <span>Nepal Engineering Council Exam Preparation</span>
        </div>

        {/* Editorial Serif Headline */}
        <h1 className="font-editorial text-5xl sm:text-6xl md:text-[68px] leading-[1.08] tracking-normal text-[var(--text-primary)]">
          Prepare for the license exam with clarity<span className="text-[var(--accent-coral)]">.</span>
        </h1>

        {/* Calm Body Subtitle */}
        <p className="text-[17px] sm:text-[19px] leading-relaxed text-[var(--text-secondary)] max-w-2xl mx-auto font-normal">
          A focused repository of discipline-specific MCQs, timed mock examinations, and syllabus-guided modules designed for Nepali engineers.
        </p>

        {/* Restrained Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/register" className="btn-primary px-5 h-[40px] text-[14px]">
            Start practicing
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Link>
          <Link to="/dashboard" className="btn-secondary px-5 h-[40px] text-[14px]">
            View dashboard
          </Link>
        </div>

        {/* Micro Exam Specifications */}
        <div className="pt-8 border-t border-[var(--border-color)] max-w-xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="font-editorial text-2xl text-[var(--text-primary)]">100</p>
            <p className="text-[12px] text-[var(--text-secondary)]">Total MCQs</p>
          </div>
          <div>
            <p className="font-editorial text-2xl text-[var(--text-primary)]">2 Hours</p>
            <p className="text-[12px] text-[var(--text-secondary)]">Exam Duration</p>
          </div>
          <div>
            <p className="font-editorial text-2xl text-[var(--text-primary)]">50%</p>
            <p className="text-[12px] text-[var(--text-secondary)]">Passing Benchmark</p>
          </div>
        </div>

      </section>

      {/* 2. Sample Exam Simulation Frame */}
      <section className="max-w-3xl mx-auto px-6">
        <div className="card-minimal p-6 sm:p-8 space-y-6 shadow-none">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                Sample Simulation
              </span>
              <h3 className="font-editorial text-xl text-[var(--text-primary)]">
                Section A: Basic Engineering Concepts
              </h3>
            </div>
            <span className="text-[12px] font-medium text-[var(--text-secondary)] px-2.5 py-1 rounded-[6px] bg-[var(--bg-canvas)] border border-[var(--border-color)]">
              1 Mark
            </span>
          </div>

          <div className="space-y-4 text-left">
            <p className="text-[15px] leading-relaxed text-[var(--text-primary)] font-normal">
              According to the Nepal National Building Code (NBC), what is the minimum compressive strength specified for structural grade concrete in seismic zones?
            </p>

            <div className="space-y-2 pt-1">
              {[
                { label: "A", text: "15 N/mm² (M15)" },
                { label: "B", text: "20 N/mm² (M20)", correct: true },
                { label: "C", text: "25 N/mm² (M25)" },
                { label: "D", text: "30 N/mm² (M30)" },
              ].map((opt, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-[8px] text-[13px] border flex items-center justify-between transition-colors ${
                    opt.correct
                      ? "bg-[var(--bg-canvas)] border-[var(--text-primary)] text-[var(--text-primary)] font-medium"
                      : "bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-secondary)]"
                  }`}
                >
                  <span>
                    <span className="font-mono mr-2 text-[var(--text-primary)]">{opt.label}.</span>
                    {opt.text}
                  </span>
                  {opt.correct && (
                    <span className="text-[11px] text-[var(--accent-success)] font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Correct
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[12px] text-[var(--text-secondary)] border-t border-[var(--border-color)]">
            <span>Explanations included for all questions</span>
            <Link to="/register" className="btn-link">
              Explore all past papers →
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Engineering Disciplines Grid */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[12px] font-medium tracking-wide uppercase text-[var(--text-secondary)]">
            Disciplines
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[var(--text-primary)]">
            Curated streams for council exams<span className="text-[var(--accent-coral)]">.</span>
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Select your discipline to access subject-specific question banks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {faculties.map((fac) => (
            <Link
              key={fac.id}
              to={typeof fac.id === "number" ? `/faculties/${fac.id}/subjects` : "/faculties"}
              className="card-minimal p-6 flex flex-col justify-between space-y-6 hover:border-[var(--text-primary)] transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono">
                    {fac.code || "NEC"}
                  </span>
                  <span className="text-[12px] text-[var(--text-secondary)]">
                    {fac.totalQuestions || "100"} Questions
                  </span>
                </div>

                <h3 className="font-editorial text-2xl text-[var(--text-primary)] group-hover:text-[var(--accent-coral)] transition-colors">
                  {fac.name}
                </h3>

                <p className="text-[13px] leading-relaxed text-[var(--text-secondary)] line-clamp-3">
                  {fac.description || "Core syllabus topics, model questions, and mock exams for council license."}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-[13px]">
                <span className="text-[var(--text-secondary)]">Passing: {fac.passingMarks || 50}%</span>
                <span className="btn-link flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Open syllabus →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Editorial Features / Architecture */}
      <section className="max-w-5xl mx-auto px-6 space-y-10">
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <span className="text-[12px] font-medium tracking-wide uppercase text-[var(--text-secondary)]">
            Design Principles
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[var(--text-primary)]">
            Built for uninterrupted focus<span className="text-[var(--accent-coral)]">.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PLATFORM_FEATURES.map((feature, idx) => (
            <div key={idx} className="card-minimal p-6 space-y-2">
              <h4 className="font-editorial text-xl text-[var(--text-primary)]">
                {feature.title}
              </h4>
              <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Minimal CTA Card */}
      <section className="max-w-3xl mx-auto px-6">
        <div className="card-minimal p-8 sm:p-12 text-center space-y-5">
          <h2 className="font-editorial text-3xl sm:text-4xl text-[var(--text-primary)]">
            Ready to test your readiness<span className="text-[var(--accent-coral)]">?</span>
          </h2>
          <p className="text-[15px] text-[var(--text-secondary)] max-w-md mx-auto">
            Create an account to track your answers, evaluate weak areas, and practice with timed tests.
          </p>
          <div className="pt-2">
            <Link to="/register" className="btn-primary px-6 h-[40px] text-[14px]">
              Create an account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
