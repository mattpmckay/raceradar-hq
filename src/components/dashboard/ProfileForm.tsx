'use client'

import { useRef, useState } from 'react'
import { Camera, CheckCircle, Loader2, X } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/supabase'

type Profile = Tables<'profiles'>

// ─── Data ─────────────────────────────────────────────────────────────────────

const SPORTS = [
  'HYROX', 'CrossFit', 'Deka Fit', 'Spartan Race', 'Tough Mudder',
  'Ironman', 'Ironman 70.3', 'Marathon', 'Road Racing', 'Trail Running',
] as const

const GENDERS = [
  { value: 'male',              label: 'Male' },
  { value: 'female',            label: 'Female' },
  { value: 'non_binary',        label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const

const COUNTRIES = [
  'Australia', 'New Zealand', 'Singapore', 'Japan', 'South Korea',
  'Thailand', 'Malaysia', 'Philippines', 'Indonesia', 'Vietnam',
  'Hong Kong', 'China', 'Taiwan', 'India',
  'United States', 'United Kingdom', 'Canada',
  'Germany', 'France', 'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark',
  'United Arab Emirates', 'South Africa',
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileForm({
  profile,
  email,
}: {
  profile: Profile | null
  email: string
}) {
  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]]
    .filter(Boolean).join('').toUpperCase() || email[0]?.toUpperCase() || '?'

  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
    || profile?.full_name || email

  // ── Photo state ──────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoUrl,       setPhotoUrl]       = useState<string | null>(
    profile?.profile_photo_url ?? profile?.avatar_url ?? null,
  )
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError,     setPhotoError]     = useState('')

  // ── Form state ───────────────────────────────────────────────────────────
  const [firstName,       setFirstName]       = useState(profile?.first_name ?? '')
  const [lastName,        setLastName]        = useState(profile?.last_name ?? '')
  const [dateOfBirth,     setDateOfBirth]     = useState(profile?.date_of_birth ?? '')
  const [gender,          setGender]          = useState<string>(profile?.gender ?? '')
  const [country,         setCountry]         = useState(profile?.country ?? '')
  const [state,           setState]           = useState(profile?.state ?? '')
  const [city,            setCity]            = useState(profile?.city ?? '')
  const [preferredSports, setPreferredSports] = useState<string[]>(profile?.preferred_sports ?? [])
  const [username,        setUsername]        = useState(profile?.username ?? '')

  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error,  setError]  = useState('')

  // ── Photo upload ──────────────────────────────────────────────────────────
  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!fileInputRef.current) return
    fileInputRef.current.value = ''

    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setPhotoError('Please upload a JPEG, PNG, WebP, or GIF image.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setPhotoError('Image must be under 5 MB.')
      return
    }

    setPhotoError('')
    setPhotoUploading(true)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${profile!.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) {
        setPhotoError(uploadError.message)
        setPhotoUploading(false)
        return
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      // Bust cache by appending a timestamp
      const url = `${data.publicUrl}?t=${Date.now()}`

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_photo_url: url }),
      })

      if (res.ok) {
        setPhotoUrl(url)
      } else {
        const body = await res.json() as { error?: string }
        setPhotoError(body.error ?? 'Failed to save photo.')
      }
    } catch {
      setPhotoError('Network error. Please try again.')
    } finally {
      setPhotoUploading(false)
    }
  }

  async function handleRemovePhoto() {
    setPhotoError('')
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_photo_url: null }),
    })
    if (res.ok) setPhotoUrl(null)
  }

  // ── Sports toggle ─────────────────────────────────────────────────────────
  function toggleSport(sport: string) {
    setPreferredSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport],
    )
    setStatus('idle')
  }

  // ── Save all fields ───────────────────────────────────────────────────────
  async function handleSave() {
    setStatus('saving')
    setError('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name:       firstName.trim()  || null,
          last_name:        lastName.trim()   || null,
          date_of_birth:    dateOfBirth       || null,
          gender:           gender            || null,
          country:          country           || null,
          state:            state.trim()      || null,
          city:             city.trim()       || null,
          preferred_sports: preferredSports.length ? preferredSports : null,
          username:         username.trim()   || null,
        }),
      })

      if (res.ok) {
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 3500)
      } else {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* ── Avatar header ──────────────────────────────────────────────── */}
      <div className="card flex items-center gap-5">

        {/* Avatar circle — photo if uploaded, else initials */}
        <div className="relative shrink-0">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-mint/15 ring-2 ring-mint/30">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={displayName}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <span className="font-heading text-xl font-bold text-mint">{initials}</span>
            )}
          </div>
          {photoUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-canvas/70">
              <Loader2 className="h-5 w-5 animate-spin text-mint" />
            </div>
          )}
        </div>

        {/* Name / email */}
        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg font-semibold text-ink truncate">{displayName}</p>
          <p className="text-sm text-ink-muted truncate">{email}</p>
        </div>

        {/* Photo actions */}
        <div className="ml-auto flex shrink-0 flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={photoUploading}
            className="flex items-center gap-1.5 rounded-lg border border-wire px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-wire-bright hover:text-ink disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5" />
            {photoUrl ? 'Change photo' : 'Upload photo'}
          </button>
          {photoUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="flex items-center gap-1 text-xs text-ink-subtle transition-colors hover:text-red-400"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handlePhotoSelect}
          className="sr-only"
          aria-label="Upload profile photo"
        />
      </div>

      {/* Photo upload error */}
      {photoError && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {photoError}
        </p>
      )}

      {/* ── Personal Details ────────────────────────────────────────────── */}
      <section className="card space-y-5">
        <div className="border-b border-wire pb-4">
          <h2 className="font-heading font-semibold text-ink">Personal Details</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Your name and basic information.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First Name" htmlFor="first-name" required>
            <input
              id="first-name"
              type="text"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setStatus('idle') }}
              autoComplete="given-name"
              placeholder="Matt"
              className="input"
            />
          </Field>
          <Field label="Last Name" htmlFor="last-name">
            <input
              id="last-name"
              type="text"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setStatus('idle') }}
              autoComplete="family-name"
              placeholder="McKay"
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Date of Birth" htmlFor="dob">
            <input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => { setDateOfBirth(e.target.value); setStatus('idle') }}
              max={new Date().toISOString().split('T')[0]}
              className="input"
            />
          </Field>
          <Field label="Gender" htmlFor="gender">
            <div className="relative">
              <select
                id="gender"
                value={gender}
                onChange={(e) => { setGender(e.target.value); setStatus('idle') }}
                className="input w-full cursor-pointer appearance-none pr-9"
              >
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </Field>
        </div>
      </section>

      {/* ── Location ────────────────────────────────────────────────────── */}
      <section className="card space-y-5">
        <div className="border-b border-wire pb-4">
          <h2 className="font-heading font-semibold text-ink">Location</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Used to surface nearby events and personalise recommendations.</p>
        </div>

        <Field label="Country" htmlFor="country">
          <div className="relative">
            <select
              id="country"
              value={country}
              onChange={(e) => { setCountry(e.target.value); setState(''); setStatus('idle') }}
              className="input w-full cursor-pointer appearance-none pr-9"
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="State / Region" htmlFor="state">
            <input
              id="state"
              type="text"
              value={state}
              onChange={(e) => { setState(e.target.value); setStatus('idle') }}
              autoComplete="address-level1"
              placeholder="New South Wales"
              className="input"
            />
          </Field>
          <Field label="City" htmlFor="city">
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); setStatus('idle') }}
              autoComplete="address-level2"
              placeholder="Sydney"
              className="input"
            />
          </Field>
        </div>
      </section>

      {/* ── Preferred Sports ────────────────────────────────────────────── */}
      <section className="card space-y-5">
        <div className="border-b border-wire pb-4">
          <h2 className="font-heading font-semibold text-ink">Preferred Sports</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Select the disciplines you compete in or follow. Used to personalise event recommendations.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SPORTS.map((sport) => {
            const checked = preferredSports.includes(sport)
            return (
              <label
                key={sport}
                className={`flex cursor-pointer select-none items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                  checked
                    ? 'border-mint/40 bg-mint/10 text-mint'
                    : 'border-wire bg-panel text-ink-muted hover:border-wire-bright hover:text-ink'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSport(sport)}
                  className="sr-only"
                />
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    checked ? 'border-mint bg-mint' : 'border-wire-bright'
                  }`}
                  aria-hidden
                >
                  {checked && (
                    <svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5">
                      <path d="M1 4l3 3 5-6" stroke="#0A0E14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {sport}
              </label>
            )
          })}
        </div>
      </section>

      {/* ── Account ─────────────────────────────────────────────────────── */}
      <section className="card space-y-5">
        <div className="border-b border-wire pb-4">
          <h2 className="font-heading font-semibold text-ink">Account</h2>
        </div>

        <Field label="Username" htmlFor="username" hint="Letters, numbers, underscores. 2–30 characters.">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-muted select-none">@</span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setStatus('idle') }}
              autoComplete="username"
              placeholder="yourhandle"
              className="input pl-7"
            />
          </div>
        </Field>

        <Field label="Email address" htmlFor="email-display" hint="Contact support to change your email address.">
          <input
            id="email-display"
            type="email"
            value={email}
            disabled
            className="input cursor-not-allowed opacity-60"
          />
        </Field>
      </section>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* ── Save ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pb-2">
        <button
          onClick={handleSave}
          disabled={status === 'saving'}
          className="btn-primary disabled:opacity-60"
        >
          {status === 'saving' ? 'Saving…' : 'Save Changes'}
        </button>

        {status === 'saved' && (
          <span className="flex items-center gap-1.5 text-sm text-mint animate-fade-in">
            <CheckCircle className="h-4 w-4" />
            Profile updated
          </span>
        )}
      </div>

    </div>
  )
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && <span className="ml-1 text-mint" aria-hidden>*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-subtle">{hint}</p>}
    </div>
  )
}

function ChevronIcon() {
  return (
    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
