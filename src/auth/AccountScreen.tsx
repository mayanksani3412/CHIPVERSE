import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useChipverseStore } from '../store'
import { useAuth } from './AuthContext'
import { rememberLocalProgressImport, supabase, supabaseConfigured } from './supabase'

type AuthMode = 'login' | 'signup'
type AuthMethod = 'email' | 'phone'

export function AccountScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, authLoading, profileStatus, profileError, retryProfile } = useAuth()
  const [mode, setMode] = useState<AuthMode>('signup')
  const [method, setMethod] = useState<AuthMethod>('email')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [consent, setConsent] = useState(false)
  const [importProgress, setImportProgress] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [recoveryComplete, setRecoveryComplete] = useState(false)

  const searchParams = new URLSearchParams(location.search)
  const isRecovery = searchParams.get('mode') === 'recovery'
  const isOAuthReturn = searchParams.get('oauth') === '1'
  const wasAccountDeleted = (location.state as { accountDeleted?: boolean } | null)?.accountDeleted === true

  useEffect(() => {
    if (session && profileStatus === 'ready' && isOAuthReturn) {
      navigate('/dashboard', { replace: true })
    }
  }, [session, profileStatus, navigate, isOAuthReturn])

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await action()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The request could not be completed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const checkConsent = () => {
    if (!consent) throw new Error('Review and accept the account data notice before creating an account.')
  }

  const rememberImport = (identifier: string) => {
    if (importProgress) rememberLocalProgressImport(identifier.trim())
  }

  const submitEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const client = supabase
    if (!client) return

    void run(async () => {
      if (mode === 'signup') {
        checkConsent()
        if (displayName.trim().length < 2) throw new Error('Enter a display name with at least two characters.')
        rememberImport(email)
        const { data, error: authError } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName.trim() },
            emailRedirectTo: `${window.location.origin}/account?oauth=1`,
          },
        })
        if (authError) throw authError
        if (!data.session) {
          setMessage('Check your email for the verification link. Your CHIPVERSE account will be ready after verification.')
          return
        }
        navigate('/dashboard')
        return
      }

      const { error: authError } = await client.auth.signInWithPassword({ email: email.trim(), password })
      if (authError) throw authError
      navigate('/dashboard')
    })
  }

  const sendOrVerifyPhone = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const client = supabase
    if (!client) return

    void run(async () => {
      const normalizedPhone = phone.trim()
      if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
        throw new Error('Enter a valid phone number in international format, such as +14155550123.')
      }

      if (!otpSent) {
        if (mode === 'signup') {
          checkConsent()
          if (displayName.trim().length < 2) throw new Error('Enter a display name with at least two characters.')
          rememberImport(normalizedPhone)
        }
        const { error: otpError } = await client.auth.signInWithOtp({
          phone: normalizedPhone,
          options: {
            shouldCreateUser: mode === 'signup',
            ...(mode === 'signup' ? { data: { display_name: displayName.trim() } } : {}),
          },
        })
        if (otpError) throw otpError
        setOtpSent(true)
        setMessage('A verification code was requested from your configured SMS provider.')
        return
      }

      const { error: verifyError } = await client.auth.verifyOtp({
        phone: normalizedPhone,
        token: otp.trim(),
        type: 'sms',
      })
      if (verifyError) throw verifyError
      navigate('/dashboard')
    })
  }

  const signInWithGoogle = () => {
    const client = supabase
    if (!client) return
    void run(async () => {
      if (mode === 'signup') {
        checkConsent()
        if (importProgress && !email.trim()) {
          throw new Error('To import local progress with Google, enter your Google email in the Email tab first.')
        }
        rememberImport(email)
      }
      const { error: authError } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/account?oauth=1`,
          ...(email.trim() ? { queryParams: { login_hint: email.trim() } } : {}),
        },
      })
      if (authError) throw authError
    })
  }

  const requestPasswordReset = () => {
    const client = supabase
    if (!client) return
    void run(async () => {
      if (!email.trim()) throw new Error('Enter the email address for your account first.')
      const { error: resetError } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/account?mode=recovery`,
      })
      if (resetError) throw resetError
      setMessage('If that email belongs to an account, a password recovery link has been sent.')
    })
  }

  const updatePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const client = supabase
    if (!client) return
    void run(async () => {
      if (newPassword.length < 8) throw new Error('Choose a password with at least eight characters.')
      const { error: updateError } = await client.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError
      setRecoveryComplete(true)
      setMessage('Password updated securely. You can continue to your player dashboard.')
    })
  }

  if (!supabaseConfigured) {
    return (
      <section className="panel-card wide-panel auth-panel">
        <p className="eyebrow">ACCOUNT SETUP REQUIRED</p>
        <h2>Connect CHIPVERSE to Supabase</h2>
        <p>Authentication is not simulated. Add the Supabase project URL and publishable/anon key to <code>.env.local</code>, then restart Vite.</p>
        <p className="auth-config-hint">Copy <code>.env.example</code>, configure the database migration and authentication providers, then reload this page.</p>
      </section>
    )
  }

  if (isRecovery) {
    return (
      <section className="panel-card auth-panel">
        <p className="eyebrow">ACCOUNT RECOVERY</p>
        <h2>Set a new password</h2>
        {authLoading && <div className="route-loading-panel" role="status"><span className="scene-loading-spinner" /><span>Verifying recovery link…</span></div>}
        {!session && !authLoading && <p className="auth-error">This recovery session is missing or expired. Request a new link from the sign-in screen.</p>}
        {session && (
          <form className="form-stack" onSubmit={updatePassword}>
            <label>
              New password
              <input type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            </label>
            <button type="submit" className="primary-btn" disabled={busy || recoveryComplete}>{recoveryComplete ? 'Password updated' : busy ? 'Updating…' : 'Update password'}</button>
          </form>
        )}
        {message && <p className="auth-success" role="status">{message}</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        {recoveryComplete && <button type="button" className="secondary-btn" onClick={() => navigate('/dashboard')}>Continue to dashboard</button>}
      </section>
    )
  }

  if (session) {
    if (profileStatus === 'loading' || profileStatus === 'idle') {
      return <div className="route-loading-panel" role="status"><span className="scene-loading-spinner" /><span>Loading your cloud player profile…</span></div>
    }
    if (profileStatus === 'error') {
      return (
        <section className="panel-card auth-panel">
          <p className="eyebrow">PLAYER PROFILE</p>
          <h2>Cloud profile unavailable</h2>
          <p className="auth-error" role="alert">{profileError}</p>
          <button type="button" className="primary-btn" onClick={retryProfile}>Retry profile loading</button>
        </section>
      )
    }

    return <SignedInAccount identifier={session.user.email ?? session.user.phone ?? 'Authenticated player'} />
  }

  return (
    <section className="panel-card wide-panel auth-panel">
      <div className="panel-header auth-header">
        <div>
          <p className="eyebrow">PLAYER ACCOUNT</p>
          <h2>{mode === 'signup' ? 'Create your CHIPVERSE account' : 'Sign in to CHIPVERSE'}</h2>
          <p>Your developer credit is separate from your player display name.</p>
        </div>
      </div>

      <div className="auth-mode-tabs" role="tablist" aria-label="Account action">
        <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setOtpSent(false); setError(''); setMessage('') }}>Create account</button>
        <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setOtpSent(false); setError(''); setMessage('') }}>Sign in</button>
      </div>

      <div className="auth-method-tabs" aria-label="Authentication method">
        <button type="button" className={method === 'email' ? 'active' : ''} onClick={() => { setMethod('email'); setOtpSent(false); setError(''); setMessage('') }}>Email</button>
        <button type="button" className={method === 'phone' ? 'active' : ''} onClick={() => { setMethod('phone'); setOtpSent(false); setError(''); setMessage('') }}>Mobile OTP</button>
      </div>

      {method === 'email' ? (
        <form className="form-stack auth-form" onSubmit={submitEmail}>
          {mode === 'signup' && <label>Player display name<input autoComplete="nickname" maxLength={32} required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>}
          <label>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {mode === 'signup' && <ProgressImportConsent enabled={importProgress} onChange={setImportProgress} />}
          {mode === 'signup' && <PrivacyConsent checked={consent} onChange={setConsent} />}
          <button type="submit" className="primary-btn" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account with email' : 'Sign in with email'}</button>
          {mode === 'login' && <button type="button" className="text-button" disabled={busy} onClick={requestPasswordReset}>Forgot password?</button>}
        </form>
      ) : (
        <form className="form-stack auth-form" onSubmit={sendOrVerifyPhone}>
          {mode === 'signup' && !otpSent && <label>Player display name<input autoComplete="nickname" maxLength={32} required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>}
          <label>
            Mobile number with country code
            <input type="tel" autoComplete="tel" inputMode="tel" placeholder="+14155550123" required disabled={otpSent} value={phone} onChange={(event) => setPhone(event.target.value)} />
          </label>
          {otpSent && <label>Verification code<input autoComplete="one-time-code" inputMode="numeric" required value={otp} onChange={(event) => setOtp(event.target.value)} /></label>}
          {mode === 'signup' && !otpSent && <ProgressImportConsent enabled={importProgress} onChange={setImportProgress} />}
          {mode === 'signup' && !otpSent && <PrivacyConsent checked={consent} onChange={setConsent} />}
          <button type="submit" className="primary-btn" disabled={busy}>{busy ? 'Please wait…' : otpSent ? 'Verify and continue' : mode === 'signup' ? 'Send registration OTP' : 'Send sign-in OTP'}</button>
          {otpSent && <button type="button" className="text-button" onClick={() => { setOtpSent(false); setOtp(''); setMessage('') }}>Change phone number</button>}
        </form>
      )}

      <div className="auth-divider"><span>or</span></div>
      <button type="button" className="google-auth-btn" disabled={busy} onClick={signInWithGoogle}>Continue with Google</button>
      <p className="auth-privacy-note">Authentication is handled by Supabase. CHIPVERSE stores your account identifier, display name, and game progress; passwords and OTPs are not stored by this app.</p>
      {message && <p className="auth-success" role="status">{message}</p>}
      {error && <p className="auth-error" role="alert">{error}</p>}
      {!session && profileError && <p className="auth-error" role="alert">{profileError}</p>}
      <p className="auth-config-hint">Google login, email verification, password recovery, and SMS OTP require the matching providers and redirect URLs to be enabled in your Supabase project.</p>
      {wasAccountDeleted && <p className="auth-success" role="status">Your CHIPVERSE account and cloud profile were deleted.</p>}
    </section>
  )
}

function SignedInAccount({ identifier }: { identifier: string }) {
  const navigate = useNavigate()
  const profile = useChipverseStore((state) => state.profile)
  const setProfile = useChipverseStore((state) => state.setProfile)
  const resetProfile = useChipverseStore((state) => state.resetProfile)
  const { signOut, saveCloudProfile, profileError } = useAuth()
  const [editName, setEditName] = useState(profile.name)
  const [editAvatar, setEditAvatar] = useState(profile.avatar)
  const [editSuit, setEditSuit] = useState(profile.suit)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await action()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The request could not be completed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void run(async () => {
      if (editName.trim().length < 2) throw new Error('Enter a display name with at least two characters.')
      const nextProfile = {
        ...profile,
        name: editName.trim(),
        avatar: editAvatar.trim() || 'AI',
        suit: editSuit.trim() || 'Neon Pulse',
      }
      setProfile(nextProfile)
      await saveCloudProfile(nextProfile)
      setMessage('Your cloud profile was saved.')
    })
  }

  const deleteAccount = () => {
    const client = supabase
    if (!client || !window.confirm('Permanently delete your CHIPVERSE account and cloud progress? This cannot be undone.')) return
    void run(async () => {
      const { error: deleteError } = await client.functions.invoke('delete-account', { method: 'POST' })
      if (deleteError) throw new Error(`Account deletion failed: ${deleteError.message}. Confirm the delete-account Edge Function is deployed.`)
      const { error: signOutError } = await client.auth.signOut({ scope: 'local' })
      if (signOutError) throw new Error(`Your account was deleted, but this device could not clear its sign-in session: ${signOutError.message}`)
      resetProfile()
      navigate('/account', { replace: true, state: { accountDeleted: true } })
    })
  }

  const copyPlayerId = () => {
    if (!profile.playerId) return
    if (!navigator.clipboard) {
      setError('Clipboard access is unavailable. Select and copy the Player ID manually.')
      return
    }
    void navigator.clipboard.writeText(profile.playerId)
      .then(() => setMessage('Player ID copied.'))
      .catch(() => setError('Could not copy the Player ID. Select and copy it manually.'))
  }

  return (
    <section className="panel-card wide-panel auth-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">SECURE PLAYER PROFILE</p>
          <h2>{profile.name}</h2>
        </div>
        <span className="cloud-status">Cloud profile connected</span>
      </div>
      <div className="player-id-card">
        <div><span>Permanent Player ID</span><strong>{profile.playerId}</strong></div>
        <button type="button" className="secondary-btn" onClick={copyPlayerId}>Copy ID</button>
      </div>
      <p className="auth-email">{identifier}</p>
      <form className="form-stack auth-profile-form" onSubmit={saveProfile}>
        <label>Player display name<input maxLength={32} required value={editName} onChange={(event) => setEditName(event.target.value)} /></label>
        <label>Avatar code<input maxLength={8} value={editAvatar} onChange={(event) => setEditAvatar(event.target.value.toUpperCase())} /></label>
        <label>Suit style<input maxLength={32} value={editSuit} onChange={(event) => setEditSuit(event.target.value)} /></label>
        <button type="submit" className="primary-btn" disabled={busy}>{busy ? 'Saving…' : 'Save cloud profile'}</button>
      </form>
      {profileError && <p className="auth-error" role="alert">{profileError}</p>}
      {message && <p className="auth-success" role="status">{message}</p>}
      {error && <p className="auth-error" role="alert">{error}</p>}
      <div className="auth-account-actions">
        <button type="button" className="secondary-btn" disabled={busy} onClick={() => void run(signOut)}>Sign out</button>
        <button type="button" className="danger-btn" disabled={busy} onClick={deleteAccount}>Delete account</button>
      </div>
    </section>
  )
}

function PrivacyConsent({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="auth-consent">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>I agree that Supabase will process my email or phone number and CHIPVERSE will save my player profile and game progress.</span>
    </label>
  )
}

function ProgressImportConsent({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) {
  return (
    <label className="auth-consent">
      <input type="checkbox" checked={enabled} onChange={(event) => onChange(event.target.checked)} />
      <span>Import this device's previous local progress into my new account. This is optional and is never imported without consent.</span>
    </label>
  )
}
