import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fbf8fc] text-[#1b1b1e] antialiased flex flex-col font-['Plus_Jakarta_Sans']">
      
      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 w-full bg-[#fbf8fc] shadow-sm">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-4 md:px-8">
          
          {/* Logo */}
          <div className="font-['Space_Grotesk'] text-2xl font-bold text-[#1b1b1e]">
            DisasterLink
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            <a
              href="#home"
              className="border-b-2 border-[#4b41e1] pb-1 text-sm font-semibold text-[#4b41e1] transition-colors"
            >
              Home
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-semibold text-[#45464e] transition-colors hover:text-[#4b41e1]"
            >
              How It Works
            </a>

            <a
              href="#features"
              className="text-sm font-semibold text-[#45464e] transition-colors hover:text-[#4b41e1]"
            >
              Features
            </a>

            <a
              href="#about"
              className="text-sm font-semibold text-[#45464e] transition-colors hover:text-[#4b41e1]"
            >
              About
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center space-x-4 md:flex">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-[#45464e] transition-colors hover:text-[#4b41e1]"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="rounded bg-[#4b41e1] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4036d1]"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="text-[#1b1b1e] md:hidden">
            <span className="material-symbols-outlined">
              menu
            </span>
          </button>
        </div>
      </nav>


      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-grow">

        {/* ================= HERO SECTION ================= */}
        <section
          id="home"
          className="relative mx-auto max-w-[1440px] overflow-hidden px-4 pb-24 pt-20 md:px-8"
        >
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">

            {/* ================= HERO CONTENT ================= */}
            <div className="z-10 space-y-8">

              <h1 className="font-['Space_Grotesk'] text-4xl font-bold leading-tight tracking-tight text-[#1b1b1e] md:text-5xl">
                Connecting Communities When Every Second Matters.
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-[#45464e]">
                DisasterLink helps communities report disasters, receive
                real-time updates, coordinate volunteers, and connect emergency
                resources when they are needed most.
              </p>


              {/* Hero Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">

                <button
                  onClick={() => navigate("/register")}
                  className="flex items-center rounded-lg bg-[#4b41e1] px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-[#4036d1]"
                >
                  Get Started

                  <span className="material-symbols-outlined ml-2 text-[18px]">
                    arrow_forward
                  </span>
                </button>


                <button
                  onClick={() => navigate("/resident/map")}
                  className="flex items-center rounded-lg border border-[#0e1a39]/20 bg-transparent px-6 py-3 text-sm font-semibold text-[#1b1b1e] transition-colors duration-200 hover:bg-[#f0edf1]"
                >
                  <span className="material-symbols-outlined mr-2 text-[18px]">
                    map
                  </span>

                  Explore Live Incidents
                </button>

              </div>


              {/* ================= SYSTEM HIGHLIGHTS ================= */}
              <div className="flex flex-wrap items-center gap-6 pt-8 text-[#45464e]">

                <div className="flex items-center">
                  <span className="material-symbols-outlined mr-2 text-[20px] text-[#4b41e1]">
                    verified
                  </span>

                  <span className="text-xs font-bold uppercase tracking-wider">
                    24/7 Emergency Reporting
                  </span>
                </div>


                <div className="flex items-center">
                  <span className="material-symbols-outlined mr-2 text-[20px] text-[#4b41e1]">
                    update
                  </span>

                  <span className="text-xs font-bold uppercase tracking-wider">
                    Real-Time Incident Updates
                  </span>
                </div>


                <div className="flex items-center">
                  <span className="material-symbols-outlined mr-2 text-[20px] text-[#4b41e1]">
                    group
                  </span>

                  <span className="text-xs font-bold uppercase tracking-wider">
                    Community Driven Response
                  </span>
                </div>

              </div>

            </div>


            {/* ================= HERO MAP ================= */}
            <div className="relative flex h-[500px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#c6c6cf]/30 bg-white shadow-lg md:h-[600px]">

              {/* Background Image */}
              <img
                className="absolute inset-0 h-full w-full object-cover opacity-90"
                alt="Disaster response map of Kathmandu Valley"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD50iexCUExuSD67QO8KJ7vHb3rAyABMD38XjSsg4oFjocRtyJWZ6Va4lz4GWxNo0zZROu9_5iX4TyMBg-lduYuzRZnNe64YIKRTfSoasi3ES1qfwVwwyfIYw5aJJM46xPvDZW1MYASqNTmtr1eZjZuc59PMH91-mPPNrlRXDhjn8lzOU6ENQlJ6Ylj1DKHhWw_xtjo_EYPEM3nDpod2LADBFaqT0stNmtlFIovlNWaSUzhbhPg-JPe"
              />


              {/* Critical Flooding Card */}
              <div className="absolute left-4 top-6 w-64 rounded-xl border border-white/30 bg-white/70 p-4 shadow-lg backdrop-blur-md md:left-8 md:top-8">

                <div className="mb-2 flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full bg-[#BA1A1A]"></div>

                  <span className="text-sm font-semibold text-[#1b1b1e]">
                    Critical Flooding Teku
                  </span>
                </div>

                <p className="text-sm text-[#45464e]">
                  Response in Progress - 3 Units Dispatched
                </p>

              </div>


              {/* Volunteer Team Card */}
              <div className="absolute bottom-8 right-4 w-56 rounded-xl border border-white/30 bg-white/70 p-4 shadow-lg backdrop-blur-md md:bottom-12 md:right-8">

                <div className="mb-2 flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full bg-[#4B41E1]"></div>

                  <span className="text-sm font-semibold text-[#1b1b1e]">
                    Volunteer Team Alpha
                  </span>
                </div>

                <p className="text-sm text-[#45464e]">
                  En route to shelter - ETA 5 mins
                </p>

              </div>

            </div>

          </div>
        </section>

      </main>


      {/* ================= FOOTER ================= */}
      <footer
        id="about"
        className="w-full bg-[#0e1a39]"
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-4 py-12 md:grid-cols-4 md:px-8">

          {/* Footer Brand */}
          <div className="space-y-4">

            <div className="font-['Space_Grotesk'] text-xl font-bold text-white">
              DisasterLink
            </div>

            <p className="max-w-xs text-sm leading-relaxed text-[#7883a8]">
              Copyright 2026 DisasterLink. Connecting communities,
              information, and emergency response.
            </p>

          </div>


          {/* Platform Links */}
          <div className="flex flex-col space-y-3">

            <a
              href="#home"
              className="text-xs font-bold uppercase tracking-wider text-[#7883a8] transition-colors hover:text-[#655dfb]"
            >
              Home
            </a>

            <a
              href="#features"
              className="text-xs font-bold uppercase tracking-wider text-[#7883a8] transition-colors hover:text-[#655dfb]"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-xs font-bold uppercase tracking-wider text-[#7883a8] transition-colors hover:text-[#655dfb]"
            >
              How It Works
            </a>

          </div>


          {/* User Links */}
          <div className="flex flex-col space-y-3">

            <button
              onClick={() => navigate("/resident")}
              className="text-left text-xs font-bold uppercase tracking-wider text-[#7883a8] transition-colors hover:text-[#655dfb]"
            >
              Residents
            </button>

            <button
              onClick={() => navigate("/volunteer")}
              className="text-left text-xs font-bold uppercase tracking-wider text-[#7883a8] transition-colors hover:text-[#655dfb]"
            >
              Volunteers
            </button>

            <button
              onClick={() => navigate("/admin")}
              className="text-left text-xs font-bold uppercase tracking-wider text-[#7883a8] transition-colors hover:text-[#655dfb]"
            >
              Administrators
            </button>

          </div>


          {/* Support Links */}
          <div className="flex flex-col space-y-3">

            <a
              href="#emergency"
              className="text-xs font-bold uppercase tracking-wider text-[#7883a8] transition-colors hover:text-[#655dfb]"
            >
              Emergency Info
            </a>

            <a
              href="#contact"
              className="text-xs font-bold uppercase tracking-wider text-[#7883a8] transition-colors hover:text-[#655dfb]"
            >
              Contact
            </a>

            <a
              href="#privacy"
              className="text-xs font-bold uppercase tracking-wider text-[#7883a8] transition-colors hover:text-[#655dfb]"
            >
              Privacy
            </a>

          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;