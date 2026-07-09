import Image from "next/image";
import { Sparkles, GraduationCap, Trophy, ArrowRight } from "lucide-react";

const stories = [
  {
    name: "Priya Sharma",
    achievement: "Secured AIR 42 in JEE Advanced",
    story: "Career Guru's structured solutions helped me master Physics and Chemistry concepts. The step-by-step approach made complex problems easy to understand.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    field: "Engineering",
  },
  {
    name: "Rahul Patil",
    achievement: "Admitted to AIIMS Delhi",
    story: "The biology solutions and concept notes on Career Guru were a game changer for my NEET preparation. I could revise entire chapters in hours.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    field: "Medical",
  },
  {
    name: "Ananya Gupta",
    achievement: "98.2% in Class 10 ICSE",
    story: "I used Career Guru daily for all subjects. The chapter-wise solutions and important questions covered everything I needed for board exams.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    field: "Academics",
  },
  {
    name: "Mohammed Aadil",
    achievement: "Full Stack Developer at Microsoft",
    story: "After 10th, the career guidance tools helped me discover my passion for Computer Science. The roadmap was clear and actionable.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    field: "Technology",
  },
  {
    name: "Sneha Deshmukh",
    achievement: "Chartered Accountant, AIR 18",
    story: "The commerce stream guidance and career flowchart gave me clarity when I was confused after 10th. Today I'm living my dream career.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    field: "Commerce",
  },
  {
    name: "Arjun Nair",
    achievement: "Design Lead at a unicorn startup",
    story: "Career Guru helped me explore non-traditional paths after 12th. The arts & design roadmap was exactly what I needed to convince my parents.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    field: "Design",
  },
];

export default function SuccessStoriesPage() {
  return (
    <div className="bg-brand-bg min-h-screen">
      {/* Hero */}
      <section className="relative bg-brand-navy py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative container-custom text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-sky/15 border border-brand-sky/30 text-brand-sky text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Real Stories, Real Impact
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-sora text-white mb-4">
            Our Success Stories
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Thousands of students have used Career Guru to achieve their academic and career goals. Here are some of their journeys.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-white border-y border-slate-200">
        <div className="container-custom py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "50,000+", label: "Happy Students" },
            { value: "95%", label: "Satisfaction Rate" },
            { value: "100+", label: "Top College Admits" },
            { value: "4.8/5", label: "Student Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl md:text-3xl font-bold font-sora text-brand-royal">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stories grid */}
      <section className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div key={story.name} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-brand-royal/30 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative h-14 w-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-brand-royal/20">
                  <Image src={story.image} alt={story.name} fill className="object-cover" sizes="56px" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{story.name}</h3>
                  <p className="text-xs text-brand-sky font-medium">{story.field}</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium mb-3">
                <Trophy className="h-3 w-3" />
                {story.achievement}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{story.story}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-br from-brand-royal to-brand-navy rounded-3xl p-10 md:p-14 text-white">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-brand-sky" />
          <h2 className="text-2xl md:text-3xl font-bold font-sora mb-3">Ready to Write Your Own Success Story?</h2>
          <p className="text-white/70 mb-6 max-w-lg mx-auto">
            Join thousands of students who are achieving their academic and career goals with Career Guru.
          </p>
          <a
            href="/academic"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-royal rounded-xl font-semibold hover:bg-brand-sky hover:text-brand-navy transition-all"
          >
            Start Learning Free
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
