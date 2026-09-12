import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from "../../context/AuthContext"

function Register() {
    const navigate = useNavigate()
    const { register } = useAuth()


    const [accountType, setAccountType] = useState('resident')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        district: '',
        password: '',
        confirmPassword: '',
        availability: 'available',
        skills: [],
        agreeTerms: false,
    })

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target

        setFormData((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleSkillChange = (skill) => {
        setFormData((previous) => ({
            ...previous,
            skills: previous.skills.includes(skill)
                ? previous.skills.filter((item) => item !== skill)
                : [...previous.skills, skill],
        }))
    }


    const validateForm = () => {
        // Name validation
        if (formData.fullName.trim().length < 2) {
            alert("Please enter your full name.");
            return false;
        }

        // Phone validation (simple check)
        const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
        if (!phoneRegex.test(formData.phone)) {
            alert("Please enter a valid phone number.");
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert("Please enter a valid email address.");
            return false;
        }

        // Password validation
        if (formData.password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return false;
        }

        return true;
    };


       const handleSubmit = async (event) => {
        event.preventDefault()

        if (!validateForm()) {
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.")
            return
        }

        if (!formData.agreeTerms) {
            alert("Please agree to the Terms of Service and Privacy Policy.")
            return
        }

        // package form inputs cleanly to map with our backend models
        const payload = {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            district: formData.district,
            password: formData.password,
            accountType: accountType,
            availability: accountType === "volunteer" ? formData.availability : "available",
            skills: accountType === "volunteer" ? formData.skills : []
        };

        // Submits the fields straight to Amazon Cognito in the cloud
        const user = await register(payload)

        if (user) {
            navigate("/login")
        }
    }

    const skills = [
        'First Aid',
        'Water Rescue',
        'Evacuation',
        'Logistics',
        'Medical',
        'Fire Rescue',
        'Traffic Management',
        'Cleanup',
        'Structural Assessment',
        'Heavy Equipment',
        'Emergency Response',
        'General Support'
    ]

    return (
        <div className="flex min-h-screen flex-col bg-[#f5f7fb] text-[#1b1b1e] md:flex-row">

            {/* LEFT BRANDING SECTION */}
            <div className="relative hidden w-[45%] overflow-hidden bg-[#0e1a39] p-12 text-white md:flex md:flex-col">

                {/* Background decoration */}
                <div className="pointer-events-none absolute inset-0 opacity-20">
                    <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#4648d4] blur-3xl" />
                    <div className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full bg-[#bac5ed] blur-3xl" />
                </div>

                <div className="relative z-10 flex h-full flex-col">

                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-[#e1e0ff]">
                            public
                        </span>

                        <span
                            className="text-2xl font-bold"
                            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                        >
                            DisasterLink
                        </span>
                    </div>

                    {/* Main content */}
                    <div className="my-auto">

                        <h1
                            className="mb-6 text-5xl font-bold leading-tight"
                            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                        >
                            Join the DisasterLink
                            <br />
                            Response Network
                        </h1>

                        <p className="mb-10 max-w-lg text-lg leading-relaxed text-[#bac5ed]">
                            Join a connected community prepared to report, respond, and
                            recover from disasters.
                        </p>

                        <ul className="space-y-5 text-base text-[#bac5ed]">

                            <li className="flex items-center gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b4667] text-[#e1e0ff]">
                                    <span className="material-symbols-outlined text-lg">
                                        report
                                    </span>
                                </div>

                                Report disasters in real-time
                            </li>

                            <li className="flex items-center gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b4667] text-[#e1e0ff]">
                                    <span className="material-symbols-outlined text-lg">
                                        notifications_active
                                    </span>
                                </div>

                                Receive emergency alerts
                            </li>

                            <li className="flex items-center gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b4667] text-[#e1e0ff]">
                                    <span className="material-symbols-outlined text-lg">
                                        location_on
                                    </span>
                                </div>

                                Find shelters and resources
                            </li>

                            <li className="flex items-center gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b4667] text-[#e1e0ff]">
                                    <span className="material-symbols-outlined text-lg">
                                        group
                                    </span>
                                </div>

                                Support community response
                            </li>

                        </ul>
                    </div>

                    {/* Bottom visual replacement */}
                    <div className="relative mt-10 h-40 overflow-hidden rounded-xl border border-[#3b4667] bg-gradient-to-br from-[#101f45] via-[#1b2a5c] to-[#4648d4] shadow-lg">

                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(186,197,237,0.35)_0%,transparent_20%),radial-gradient(circle_at_70%_60%,rgba(96,99,238,0.45)_0%,transparent_25%)]" />

                        <div className="absolute left-[20%] top-[30%] h-3 w-3 rounded-full bg-white shadow-[0_0_20px_white]" />
                        <div className="absolute left-[45%] top-[55%] h-3 w-3 rounded-full bg-[#bac5ed]" />
                        <div className="absolute right-[25%] top-[35%] h-3 w-3 rounded-full bg-white" />

                    </div>

                </div>
            </div>

            {/* RIGHT REGISTRATION SECTION */}
            <div className="flex w-full flex-col bg-[#fbf8fc] md:w-[55%]">

                {/* Mobile header */}
                <div className="flex items-center gap-2 bg-[#0e1a39] p-6 text-white md:hidden">
                    <span className="material-symbols-outlined text-xl text-[#e1e0ff]">
                        public
                    </span>

                    <span
                        className="text-xl font-bold"
                        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                        DisasterLink
                    </span>
                </div>

                <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col justify-center p-6 py-12 md:p-12 md:py-20">

                    {/* Heading */}
                    <div className="mb-8">

                        <h2
                            className="mb-2 text-3xl font-semibold"
                            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                        >
                            Create Your Account
                        </h2>

                        <p className="text-[#45464e]">
                            Register to access the community disaster-response platform.
                        </p>

                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* BASIC INFORMATION */}
                        <div className="space-y-6">

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                {/* Full Name */}
                                <div>
                                    <label
                                        htmlFor="fullName"
                                        className="mb-2 flex items-center gap-1 text-sm font-semibold"
                                    >
                                        <span className="material-symbols-outlined text-lg text-[#45464e]">
                                            person
                                        </span>

                                        Full Name
                                    </label>

                                    <input
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        required
                                        className="w-full rounded-xl bg-[#edf0f5] px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#4648d4]/30"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="mb-2 flex items-center gap-1 text-sm font-semibold"
                                    >
                                        <span className="material-symbols-outlined text-lg text-[#45464e]">
                                            phone
                                        </span>

                                        Phone Number
                                    </label>

                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter your phone number"
                                        required
                                        className="w-full rounded-xl bg-[#edf0f5] px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#4648d4]/30"
                                    />
                                </div>

                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 flex items-center gap-1 text-sm font-semibold"
                                >
                                    <span className="material-symbols-outlined text-lg text-[#45464e]">
                                        mail
                                    </span>

                                    Email Address
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email address"
                                    required
                                    className="w-full rounded-xl bg-[#edf0f5] px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#4648d4]/30"
                                />
                            </div>

                            {/* District */}
                            <div>
                                <label
                                    htmlFor="district"
                                    className="mb-2 flex items-center gap-1 text-sm font-semibold"
                                >
                                    <span className="material-symbols-outlined text-lg text-[#45464e]">
                                        location_on
                                    </span>

                                    District
                                </label>

                                <select
                                    id="district"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl bg-[#edf0f5] px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#4648d4]/30"
                                >
                                    <option value="">Select your district</option>
                                    <option value="kathmandu">Kathmandu</option>
                                    <option value="lalitpur">Lalitpur</option>
                                    <option value="bhaktapur">Bhaktapur</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                        </div>

                        {/* ACCOUNT TYPE */}
                        <div>

                            <label className="mb-3 block text-sm font-semibold">
                                Account Type
                            </label>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                {/* Resident */}
                                <button
                                    type="button"
                                    onClick={() => setAccountType('resident')}
                                    className={`rounded-2xl border p-5 text-left transition ${accountType === 'resident'
                                        ? 'border-[#4648d4] bg-[#fbf8fc] ring-1 ring-[#4648d4]'
                                        : 'border-[#c6c6cf] bg-white hover:border-[#4648d4]/50'
                                        }`}
                                >
                                    <div className="mb-4 flex items-center justify-between">

                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full ${accountType === 'resident'
                                                ? 'bg-[#e1e0ff] text-[#4648d4]'
                                                : 'bg-[#f0edf1] text-[#45464e]'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined">
                                                home
                                            </span>
                                        </div>

                                        <div
                                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${accountType === 'resident'
                                                ? 'border-[#4648d4] bg-[#4648d4]'
                                                : 'border-[#c6c6cf]'
                                                }`}
                                        >
                                            {accountType === 'resident' && (
                                                <div className="h-2 w-2 rounded-full bg-white" />
                                            )}
                                        </div>

                                    </div>

                                    <h3
                                        className="mb-1 text-lg font-semibold"
                                        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                                    >
                                        Resident
                                    </h3>

                                    <p className="text-sm leading-relaxed text-[#45464e]">
                                        Access resources, report incidents, and receive local
                                        alerts.
                                    </p>
                                </button>

                                {/* Volunteer */}
                                <button
                                    type="button"
                                    onClick={() => setAccountType('volunteer')}
                                    className={`rounded-2xl border p-5 text-left transition ${accountType === 'volunteer'
                                        ? 'border-[#4648d4] bg-[#fbf8fc] ring-1 ring-[#4648d4]'
                                        : 'border-[#c6c6cf] bg-white hover:border-[#4648d4]/50'
                                        }`}
                                >
                                    <div className="mb-4 flex items-center justify-between">

                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full ${accountType === 'volunteer'
                                                ? 'bg-[#e1e0ff] text-[#4648d4]'
                                                : 'bg-[#f0edf1] text-[#45464e]'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined">
                                                volunteer_activism
                                            </span>
                                        </div>

                                        <div
                                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${accountType === 'volunteer'
                                                ? 'border-[#4648d4] bg-[#4648d4]'
                                                : 'border-[#c6c6cf]'
                                                }`}
                                        >
                                            {accountType === 'volunteer' && (
                                                <div className="h-2 w-2 rounded-full bg-white" />
                                            )}
                                        </div>

                                    </div>

                                    <h3
                                        className="mb-1 text-lg font-semibold"
                                        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                                    >
                                        Volunteer
                                    </h3>

                                    <p className="text-sm leading-relaxed text-[#45464e]">
                                        Join response teams, manage tasks, and support
                                        coordination.
                                    </p>
                                </button>

                            </div>
                        </div>

                        {/* VOLUNTEER FIELDS */}
                        {accountType === 'volunteer' && (
                            <div className="space-y-6 rounded-2xl border border-[#e4e1e5] bg-[#f6f2f7] p-6">

                                <div className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-[#4648d4]">
                                        info
                                    </span>

                                    <p className="text-sm italic text-[#45464e]">
                                        Volunteer applications may require administrator
                                        verification before activation.
                                    </p>
                                </div>

                                {/* Skills - Updated with more options */}
                                <div>

                                    <label className="mb-3 block text-sm font-semibold">
                                        Volunteer Skills (Select all that apply)
                                    </label>

                                    <div className="flex flex-wrap gap-2">

                                        {skills.map((skill) => (
                                            <label key={skill} className="cursor-pointer">

                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={formData.skills.includes(skill)}
                                                    onChange={() => handleSkillChange(skill)}
                                                />

                                                <span className="inline-block rounded-full border border-[#c6c6cf] bg-white px-4 py-2 text-sm text-[#45464e] transition peer-checked:border-transparent peer-checked:bg-[#e1e0ff] peer-checked:text-[#07006c]">
                                                    {skill}
                                                </span>

                                            </label>
                                        ))}

                                    </div>
                                </div>

                                {/* Availability */}
                                <div>

                                    <label
                                        htmlFor="availability"
                                        className="mb-2 block text-sm font-semibold"
                                    >
                                        Availability
                                    </label>

                                    <select
                                        id="availability"
                                        name="availability"
                                        value={formData.availability}
                                        onChange={handleChange}
                                        className="w-full rounded-xl bg-[#edf0f5] px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#4648d4]/30"
                                    >
                                        <option value="available">Available (On-Call)</option>
                                        <option value="limited">
                                            Limited Availability
                                        </option>
                                    </select>

                                </div>

                            </div>
                        )}

                        {/* PASSWORD SECTION */}
                        <div className="space-y-4">

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                {/* Password */}
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="mb-2 flex items-center gap-1 text-sm font-semibold"
                                    >
                                        <span className="material-symbols-outlined text-lg text-[#45464e]">
                                            lock
                                        </span>

                                        Password
                                    </label>

                                    <div className="relative">

                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Create password"
                                            required
                                            minLength="8"
                                            className="w-full rounded-xl bg-[#edf0f5] px-4 py-3 pr-12 outline-none transition focus:ring-2 focus:ring-[#4648d4]/30"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#45464e]"
                                        >
                                            <span className="material-symbols-outlined">
                                                {showPassword
                                                    ? 'visibility_off'
                                                    : 'visibility'}
                                            </span>
                                        </button>

                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="mb-2 flex items-center gap-1 text-sm font-semibold"
                                    >
                                        <span className="material-symbols-outlined text-lg text-[#45464e]">
                                            lock_reset
                                        </span>

                                        Confirm Password
                                    </label>

                                    <div className="relative">

                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={
                                                showConfirmPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm password"
                                            required
                                            minLength="8"
                                            className="w-full rounded-xl bg-[#edf0f5] px-4 py-3 pr-12 outline-none transition focus:ring-2 focus:ring-[#4648d4]/30"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#45464e]"
                                        >
                                            <span className="material-symbols-outlined">
                                                {showConfirmPassword
                                                    ? 'visibility_off'
                                                    : 'visibility'}
                                            </span>
                                        </button>

                                    </div>
                                </div>

                            </div>

                            <p className="text-sm text-[#45464e]">
                                Requirement: At least 8 characters.
                            </p>

                        </div>

                        {/* TERMS */}
                        <label className="flex cursor-pointer items-start gap-3">

                            <input
                                type="checkbox"
                                name="agreeTerms"
                                checked={formData.agreeTerms}
                                onChange={handleChange}
                                className="mt-1 h-4 w-4 accent-[#4648d4]"
                            />

                            <span className="text-sm leading-relaxed text-[#45464e]">
                                I agree to the{' '}
                                <button
                                    type="button"
                                    className="font-medium text-[#4648d4] hover:underline"
                                >
                                    Terms of Service
                                </button>{' '}
                                and{' '}
                                <button
                                    type="button"
                                    className="font-medium text-[#4648d4] hover:underline"
                                >
                                    Privacy Policy
                                </button>.
                            </span>

                        </label>

                        {/* ACTIONS */}
                        <div className="space-y-5">

                            <button
                                type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4648d4] py-4 font-semibold text-white shadow-sm transition hover:bg-[#383ab8]"
                            >
                                Create Account

                                <span className="material-symbols-outlined text-xl">
                                    arrow_forward
                                </span>
                            </button>

                            <div className="text-center">

                                <p className="text-[#45464e]">
                                    Already have an account?{' '}

                                    <button
                                        type="button"
                                        onClick={() => navigate('/login')}
                                        className="font-bold text-[#4648d4] hover:underline"
                                    >
                                        Sign In
                                    </button>
                                </p>

                            </div>

                        </div>

                    </form>

                </div>
            </div>
        </div>
    )
}

export default Register