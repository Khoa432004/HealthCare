import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[url('https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQ6ftjDHMlNJtTSwjvNsy9RY_8tOmPhiLCphPfGLmXGAtvoqhsB')] bg-cover bg-center relative overflow-hidden">
      <div className="absolute top-4 bottom-4 left-4 right-1/2 bg-white/70 rounded-3xl sm:rounded-[2.5rem]"></div>

      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl hidden md:block animate-pulse"></div>
      <div
        className="absolute top-32 right-32 w-20 h-20 bg-cyan-200/40 rounded-full blur-2xl hidden lg:block animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-20 right-20 w-24 h-24 bg-teal-200/35 rounded-full blur-3xl hidden md:block animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-10 left-20 w-28 h-28 bg-slate-200/20 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: "3s" }}
      ></div>

      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-center min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2rem)]">
          {/* Left Content - Login Form */}
          <div className="space-y-8 order-2 lg:order-1">
            <LoginForm />
          </div>

          {/* Right Image */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative z-10 w-full max-w-md lg:max-w-full">
              <div className="relative">
                <img
                  src="/clean-female-doctor.png"
                  alt="Bác sĩ chuyên nghiệp"
                  className="w-full h-auto object-contain max-h-[400px] sm:max-h-[500px] lg:max-h-none rounded-3xl sm:rounded-[2.5rem] shadow-soft-xl hover:shadow-soft-2xl transition-all duration-500 hover:scale-[1.05]"
                />
                {/* Image overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent rounded-3xl sm:rounded-[2.5rem]"></div>
              </div>
            </div>
            {/* Background decorative circles */}
            <div className="absolute -top-8 -right-8 lg:-top-12 lg:-right-12 w-32 h-32 lg:w-40 lg:h-40 bg-blue-200/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div
              className="absolute -bottom-6 -left-6 w-24 h-24 bg-cyan-200/25 rounded-full blur-2xl -z-10 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div className="absolute top-1/2 -left-4 w-20 h-20 sm:w-28 sm:h-28 bg-slate-200/20 rounded-full blur-xl -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  )
}