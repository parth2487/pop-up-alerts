import { Bell, Zap, Shield, BarChart3, Check, Mail, Globe, MessageSquare, Send, Users, Timer, Star, Share2, Video, Cookie, ArrowRight, Play, HelpCircle} from 'lucide-react';
import { Link } from 'react-router-dom'; // <-- 1. Impor Link
import { useState } from "react";

function App() {
    const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState(""); // "success" | "error"

  const handleSubscribe = async () => {
    setMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setType("error");
        setMessage(data.message || "Something went wrong");
        return;
      }

      setType("success");
      setMessage(data.message);
      setEmail("");
    } catch (error) {
      setType("error"); 
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-orange-500 to-amber-400 text-white py-2 px-6 text-center text-sm font-medium">
        Limited Time: Get 50% off annual plans - Use code POPUP50
      </div>

      <nav className="sticky top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/Logo.svg" alt="Popupalerts" className="h-12 w-12" />
              <span className="text-xl font-semibold text-gray-900">Popupalerts</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Login</Link>
              <Link to="/register" className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-400 rounded-lg hover:from-orange-600 hover:to-amber-500 transition-all shadow-md hover:shadow-lg">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative pt-20 pb-32 px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 -z-10"></div>
          <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl -z-10"></div>

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-6 border border-orange-100">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-gray-700">200 sites using Popupalerts</span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                  Beautiful notifications
                  <br />
                  <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">that convert</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                  Engage your visitors with elegant, real-time popup alerts that boost conversions by 34% and build trust. Simple setup, powerful results.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                   <Link to="/register" className="group px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-orange-500 to-amber-400 rounded-lg hover:from-orange-600 hover:to-amber-500 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button className="group px-8 py-4 text-base font-medium text-gray-900 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 relative">
                  <div className="aspect-video bg-gradient-to-br from-orange-100 via-yellow-50 to-orange-50 rounded-xl flex items-center justify-center overflow-hidden">
                    <div className="text-center">
                      <Bell className="w-24 h-24 text-gray-900 mx-auto mb-4" strokeWidth={1.5} />
                      <p className="text-gray-600 text-sm font-medium">Live notification preview</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg border border-gray-100 p-4 max-w-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Sarah from NYC</p>
                        <p className="text-xs text-gray-600">Just signed up 2 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 lg:px-8 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-sm font-medium text-gray-500 mb-8">TRUSTED BY LEADING COMPANIES</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
              <div className="flex items-center justify-center h-12 text-gray-400 font-bold text-lg 
                                  grayscale opacity-60
              hover:grayscale-0 hover:opacity-100
                    hover:scale-105
                    transition-all duration-300 ease-in-out"><img alt="Shopify Logo" className="max-h-8 w-auto object-contain" src="/logos/shopify.svg"/></div>
              <div className="flex items-center justify-center h-12 text-gray-400 font-bold text-lg   grayscale opacity-60
              hover:grayscale-0 hover:opacity-100
                    hover:scale-105
                    transition-all duration-300 ease-in-out"><img alt="Stripe Logo" className="max-h-8 w-auto object-contain" src="/logos/stripe.svg"/></div>
              <div className="flex items-center justify-center h-12 text-gray-400 font-bold text-lg  grayscale opacity-60
              hover:grayscale-0 hover:opacity-100
                    hover:scale-105
                    transition-all duration-300 ease-in-out"><img alt="Notion Logo" className="max-h-8 w-auto object-contain" src="/logos/notion.svg"/></div>
              <div className="flex items-center justify-center h-12 text-gray-400 font-bold text-lg  grayscale opacity-60
              hover:grayscale-0 hover:opacity-100
                    hover:scale-105
                    transition-all duration-300 ease-in-out"><img alt="Webflow Logo" className="max-h-8 w-auto object-contain" src="/logos/webflow.svg"/></div>
              <div className="flex items-center justify-center h-12 text-gray-400 font-bold text-lg  grayscale opacity-60
              hover:grayscale-0 hover:opacity-100
                    hover:scale-105
                    transition-all duration-300 ease-in-out"><img alt="Figma Logo" className="max-h-8 w-auto object-contain" src="/logos/figma.svg"/></div>
              <div className="flex items-center justify-center h-12 text-gray-400 font-bold text-lg  grayscale opacity-60
              hover:grayscale-0 hover:opacity-100
                    hover:scale-105
                    transition-all duration-300 ease-in-out"><img alt="Vercel Logo" className="max-h-8 w-auto object-contain" src="/logos/vercel.svg"/></div>
            </div>
          </div>
        </section>

        <section id="features" className="relative py-24 px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-white -z-10"></div>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-4">
                Features
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Everything you need to succeed
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Turn visitors into customers with our powerful notification tools
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center group">
                <Mail className="w-8 h-8 text-gray-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Email</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center group">
                <Globe className="w-8 h-8 text-gray-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Webhook</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center group">
                <MessageSquare className="w-8 h-8 text-gray-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Slack</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center group">
                <MessageSquare className="w-8 h-8 text-gray-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Discord</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center group">
                <Send className="w-8 h-8 text-gray-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Telegram</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center group">
                <Users className="w-8 h-8 text-gray-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">MS Teams</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Powerful widget library
              </h2>
              <p className="text-lg text-gray-600">
                Choose from dozens of pre-built widgets to engage your visitors
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <Bell className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Informational Messages
                </h3>
                <p className="text-sm text-gray-600">
                  Custom notices and announcements for your users
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <svg className="w-8 h-8 text-gray-900 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Coupons
                </h3>
                <p className="text-sm text-gray-600">
                  Highlight ongoing offers and sales to drive conversions
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <Users className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Live Visitor Counter
                </h3>
                <p className="text-sm text-gray-600">
                  Build trust and urgency with real-time visitor counts
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <Mail className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Email & Request Collectors
                </h3>
                <p className="text-sm text-gray-600">
                  Capture leads with beautiful opt-in forms
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <BarChart3 className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Recent Conversions
                </h3>
                <p className="text-sm text-gray-600">
                  Show social proof with live conversion notifications
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <Timer className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Countdown Timers
                </h3>
                <p className="text-sm text-gray-600">
                  Create urgency for time-sensitive actions and offers
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <Star className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Reviews & Testimonials
                </h3>
                <p className="text-sm text-gray-600">
                  Increase credibility with customer feedback
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <Share2 className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Social Share & Feedback
                </h3>
                <p className="text-sm text-gray-600">
                  Encourage user interaction and content sharing
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <Video className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Video/Audio Widgets
                </h3>
                <p className="text-sm text-gray-600">
                  Share multimedia content more effectively
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <Cookie className="w-8 h-8 text-gray-900 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cookie Notifications
                </h3>
                <p className="text-sm text-gray-600">
                  Stay compliant with GDPR and privacy regulations
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="relative py-24 px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 -z-10"></div>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-4">
                How It Works
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Get started in minutes
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Three simple steps to start converting more visitors
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-400 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Add One Line of Code
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Copy and paste a single code snippet into your website. No technical expertise needed. Works with any platform.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700 border border-gray-200">
                    {'<script src="popupalerts.js"></script>'}
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-400 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Customize Your Popups
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Choose from our library of widgets, customize colors, timing, and triggers. Match your brand perfectly with our visual editor.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-400 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Watch Conversions Grow
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Track performance in real-time. See which notifications drive the most conversions and optimize for maximum impact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="old-features" className="py-24 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Everything you need
              </h2>
              <p className="text-lg text-gray-600">
                Powerful features designed for modern websites
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group">
                <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gray-100 transition-colors">
                    <Zap className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Lightning Fast
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Zero impact on page speed. Optimized delivery ensures your alerts appear instantly without slowing down your site.
                  </p>
                </div>
              </div>

              <div className="group">
                <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gray-100 transition-colors">
                    <Shield className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Privacy First
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    GDPR compliant and privacy-focused. No tracking cookies, no data collection, just pure notification delivery.
                  </p>
                </div>
              </div>

              <div className="group">
                <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gray-100 transition-colors">
                    <BarChart3 className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Smart Analytics
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Track views, clicks, and conversions. Get actionable insights to optimize your notification strategy.
                  </p>
                </div>
              </div>

              <div className="group">
                <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gray-100 transition-colors">
                    <Bell className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Real-time Updates
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Show live activity from your site. Recent purchases, sign-ups, or custom events as they happen.
                  </p>
                </div>
              </div>

              <div className="group">
                <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gray-100 transition-colors">
                    <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Full Customization
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Match your brand perfectly. Customize colors, fonts, animations, and positioning with ease.
                  </p>
                </div>
              </div>

              <div className="group">
                <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gray-100 transition-colors">
                    <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Easy Integration
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    One line of code and you're done. Works with any website, CMS, or platform. No technical expertise required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-24 px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 -z-10"></div>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-4">
                Social Proof
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Loved by thousands of businesses
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                See what our customers have to say
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Popupalerts increased our conversion rate by 47% in just two weeks. The setup was incredibly easy and the results speak for themselves."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold">
                    MJ
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Michael Johnson</p>
                    <p className="text-sm text-gray-600">CEO, TechStart</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "The social proof notifications have been a game-changer for building trust with new visitors. Our bounce rate dropped significantly."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold">
                    SC
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Chen</p>
                    <p className="text-sm text-gray-600">Marketing Director, ShopNow</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Simple, powerful, and effective. The countdown timers create perfect urgency for our flash sales. Highly recommended!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold">
                    DP
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">David Park</p>
                    <p className="text-sm text-gray-600">Founder, EcomPlus</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="relative py-24 px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-white -z-10"></div>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-4">
                Pricing
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-gray-600">
                Choose the plan that fits your needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-gray-300 transition-all">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Starter</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">$19</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Up to 10,000 views/month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">3 active campaigns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Basic analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Email support</span>
                  </li>
                </ul>
                <Link to="/login" className="w-full">
                <button className="w-full px-6 py-3 text-base font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Get Started
                </button>
                </Link>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl p-8 border-2 border-transparent relative transform md:scale-105 shadow-2xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-orange-600 text-sm font-bold rounded-full shadow-lg">
                  MOST POPULAR
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Pro</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">$49</span>
                    <span className="text-orange-100">/year</span>
                  </div>
                  <p className="text-orange-100 text-sm mt-2">Save 30% with annual billing</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">Up to 100,000 views/month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">Unlimited campaigns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">Priority support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white">Custom branding</span>
                  </li>
                </ul>
                <Link to="/login" className="w-full">
                <button className="w-full px-6 py-3 text-base font-bold text-orange-600 bg-white rounded-lg hover:bg-gray-50 transition-all shadow-lg">
                  Get Started Now
                </button>
                </Link>
              </div>

              <div className="bg-white rounded-xl p-8 border border-gray-200">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Unlimited views</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Unlimited campaigns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Custom integrations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Dedicated support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">SLA guarantee</span>
                  </li>
                </ul>
                <Link to="/contactus">
                <button className="w-full px-6 py-3 text-base font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Contact Sales
                </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="relative py-24 px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 -z-10"></div>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-4">
                FAQ
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Frequently asked questions
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to know about Popupalerts
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      How easy is it to install Popupalerts?
                    </h3>
                    <p className="text-gray-600">
                      Super easy! Just copy and paste one line of code into your website. No technical knowledge required. It works with all platforms including WordPress, Shopify, Webflow, and custom sites.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Will it slow down my website?
                    </h3>
                    <p className="text-gray-600">
                      Not at all! Popupalerts is optimized for performance with a lightweight script that loads asynchronously. Your page speed won't be affected.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Can I customize the notifications to match my brand?
                    </h3>
                    <p className="text-gray-600">
                      Yes! You have full control over colors, fonts, animations, positioning, and timing. Our visual editor makes it easy to match your brand perfectly.
                    </p>
                  </div>
                </div>
              </div>

              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Can I cancel anytime?
                    </h3>
                    <p className="text-gray-600">
                      Absolutely! You can cancel your subscription at any time with no questions asked. No hidden fees or commitments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-24 px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-400 -z-10"></div>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Turn visitors into customers today
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join 12,847 businesses using Popupalerts to boost conversions by an average of 34%. Start your free trial now and see results in minutes.
            </p>
            <Link to="/login" className="w-full">
            <button className="group px-8 py-4 text-base font-bold text-orange-600 bg-white rounded-lg hover:bg-gray-50 transition-all shadow-2xl hover:shadow-xl flex items-center justify-center gap-2 mx-auto">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            </Link>
            <p className="text-sm text-gray-600 mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                {/* <img src="/Logo-pop.svg" alt="Popupalerts" className="h-8 w-8" /> */}
                <img src="/Logo.svg" alt="Popupalerts" className="h-12 w-12" />
                <span className="text-xl font-bold text-gray-900">Popupalerts</span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Beautiful notifications that convert. Engage your visitors and boost conversions with elegant, real-time popup alerts.
              </p>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-900">Stay updated with our newsletter</p>
                {/* <div className="flex gap-2"> */}
                  {/* <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-400 rounded-lg hover:from-orange-600 hover:to-amber-500 transition-all shadow-md">
                    Subscribe
                  </button> */}

           <div className="flex gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />
        
        <button
          onClick={handleSubscribe}
          className="px-6 py-2.5 text-sm font-medium text-white 
                     bg-gradient-to-r from-orange-500 to-amber-400 
                     rounded-lg shadow hover:brightness-110 transition-all"
        >
          Subscribe
        </button>
      </div>

      {message && (
        <p
          className={`text-sm rounded-md px-3 py-2 animate-fade-in ${
            type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </p>
      )}


                {/* </div> */}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">API Docs</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Blog</a></li>
                <li><a href="/contactus" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">
                © 2025 Popupalerts. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
