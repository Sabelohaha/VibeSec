import { Users, Target, Rocket, Quote } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#08070b] selection:bg-purple-500/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-varko-grid opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="varko-pill mb-8">
            <span className="varko-badge">About Us</span> Learn Something Us
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.1]">
            Transforming Ideas Into Intelligent <br />
            <span className="varko-gradient-text">Solutions</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            We are dedicated to transforming the way businesses operate through intelligent, data-driven solutions team combines innovation.
          </p>
        </div>
      </section>

      {/* Innovation Story */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="varko-pill">
              <span className="varko-badge">Our Story</span> From Vision To Reality
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              The Story Behind Our <br />
              <span className="varko-gradient-text">Innovation</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Our journey began with a simple idea: to create intelligent solutions that make businesses smarter and more efficient. From a small team of innovators to a thriving SaaS platform.
            </p>
            <ul className="space-y-4">
              {[
                { icon: <Target size={18} />, text: "Smart Automation Workflows" },
                { icon: <Rocket size={18} />, text: "Reliable Support & Updates" },
                { icon: <Users size={18} />, text: "Customizable Dashboards" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white font-medium">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                    {item.icon}
                  </div>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/10 blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 varko-glow-purple bg-gray-900">
              <img 
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200&h=800" 
                alt="Our Innovation Team"
                className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Empowering Teams */}
      <section className="py-24 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative group order-2 md:order-1">
            <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/20 to-purple-500/10 blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 varko-glow-blue">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200&h=800" 
                alt="Empowering Teams"
                className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
          <div className="space-y-8 order-1 md:order-2">
            <div className="varko-pill">
              <span className="varko-badge">What We Do</span> Innovation In Action
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Empowering Teams, <br />
              <span className="varko-gradient-text">Delivering Results</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              We help businesses streamline workflows, automate processes, unlock actionable insights with intelligent solutions. From advanced analytics to predictive decision-making.
            </p>
            <ul className="space-y-4">
              {["Scalable Cloud Infrastructure", "Team Collaboration Tools", "Behavior-Based Analytics"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <div className="varko-pill mb-8">
            <span className="varko-badge">Team</span> Meet Our Team Member
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-8">
            Our Team Is Made Up Of <span className="varko-gradient-text">Passionate</span> <br />
            Innovators, Experienced.
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Each member brings unique expertise and a commitment to excellence, working together to design tools that streamline workflows, drive growth.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            { name: "David Thompson", role: "CEO & Founder", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600&h=600" },
            { name: "James Anderson", role: "Web Developer", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600&h=600" },
            { name: "Sophia Martinez", role: "UX Designer", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=600&h=600" }
          ].map((member, i) => (
            <div key={i} className="varko-glass rounded-[2rem] p-4 group transition-all hover:border-purple-500/30">
              <div className="rounded-[1.5rem] overflow-hidden mb-6 aspect-square grayscale group-hover:grayscale-0 transition-all duration-500">
                <img src={member.img} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
              </div>
              <div className="px-4 pb-4">
                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-gray-500 font-medium">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <div className="varko-pill mb-8">
            <span className="varko-badge">Testimonials</span> Clients Feedback
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-8">
            Built With Our Users, Proven By Results <br />
            <span className="varko-gradient-text">Voices Behind The Success</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            10k+ global clients say about our SaaS solutions, Powering Success for Our Customers.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          {[
            { name: "Michelle Johnson", role: "Product Manager", text: "This platform completely transformed how our team worksthe automation and analytics saved us hours every week andhelped us make smarter decisions faster.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200" },
            { name: "Natalie Brooks", role: "Engineering Lead", text: "Simple to use, powerful under the hood. We saw immediate improvements in productivity and data visibility after switching.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200" }
          ].map((item, i) => (
            <div key={i} className="varko-glass rounded-3xl p-10 relative group hover:border-purple-500/30 transition-all text-left">
              <Quote className="absolute top-8 right-8 text-white/[0.03] group-hover:text-purple-500/10 transition-colors" size={80} />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500/20">
                  <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <p className="text-xl text-gray-300 leading-relaxed italic mb-8 relative z-10">
                "{item.text}"
              </p>
              <div className="relative z-10">
                <h4 className="text-lg font-bold text-white">{item.name}</h4>
                <p className="text-gray-500 font-medium">— {item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-varko-grid opacity-10 [mask-image:radial-gradient(ellipse_at_center,#000,transparent_80%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8">
            Let's Transform Ideas Into <br />
            <span className="varko-gradient-text text-purple-400">Intelligent Solutions</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            We turn innovative ideas into intelligent, data-driven solutions that drive real results by combining creativity, strategy, and cutting-edge technology.
          </p>
          <button className="px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all varko-glow-purple scale-110 active:scale-105">
            Get Started Now
          </button>
        </div>
      </section>

      {/* Basic Footer */}
      <footer className="py-12 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <span className="text-purple-400 font-mono text-sm tracking-tighter">VS</span>
            </div>
            <span className="text-white">Vibesec</span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Vibesec. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
