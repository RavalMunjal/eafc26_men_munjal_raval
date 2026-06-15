import { useFormik } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { registerUser, clearAuthError } from '../../store/authSlice'
import { registerSchema } from '../../utils/validators'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated, user } = useSelector((s) => s.auth)
  const [showSecret, setShowSecret] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearAuthError())
    }
  }, [error, dispatch])

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', secretKey: '' },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      // Strip empty secretKey
      const payload = { ...values }
      if (!payload.secretKey) delete payload.secretKey

      const result = await dispatch(registerUser(payload))
      if (registerUser.fulfilled.match(result)) {
        toast.success('Account created! Welcome to ConflictLens 🎯')
        const role = result.payload?.user?.role
        navigate(role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true })
      }
    },
  })

  return (
    <>
      <Helmet>
        <title>ConflictLens — Register</title>
        <meta name="description" content="Create your ConflictLens account to access War Economic Impact Analytics" />
      </Helmet>

      <div style={styles.page}>
        <div style={styles.gridBg} />

        <div style={styles.card}>
          {/* Logo */}
          <div style={styles.logoWrap}>
            <span style={styles.logoIcon}>⊕</span>
            <span style={styles.logoText}>ConflictLens</span>
          </div>
          <p style={styles.subtitle}>War Economic Impact Analytics</p>
          <h1 style={styles.heading}>Create Account</h1>

          <form onSubmit={formik.handleSubmit} style={styles.form} noValidate>
            {/* Name */}
            <div style={styles.field}>
              <label style={styles.label}>FULL NAME</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="John Analyst"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                style={{
                  ...styles.input,
                  ...(formik.touched.name && formik.errors.name ? styles.inputError : {}),
                }}
              />
              {formik.touched.name && formik.errors.name && (
                <span style={styles.errorMsg}>{formik.errors.name}</span>
              )}
            </div>

            {/* Email */}
            <div style={styles.field}>
              <label style={styles.label}>EMAIL ADDRESS</label>
              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="analyst@conflictlens.io"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                style={{
                  ...styles.input,
                  ...(formik.touched.email && formik.errors.email ? styles.inputError : {}),
                }}
                autoComplete="email"
              />
              {formik.touched.email && formik.errors.email && (
                <span style={styles.errorMsg}>{formik.errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div style={styles.field}>
              <label style={styles.label}>PASSWORD</label>
              <input
                id="register-password"
                type="password"
                name="password"
                placeholder="Min 6 characters"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                style={{
                  ...styles.input,
                  ...(formik.touched.password && formik.errors.password ? styles.inputError : {}),
                }}
                autoComplete="new-password"
              />
              {formik.touched.password && formik.errors.password && (
                <span style={styles.errorMsg}>{formik.errors.password}</span>
              )}
            </div>

            {/* Admin Secret Key (collapsible) */}
            <div style={styles.secretToggleWrap}>
              <button
                type="button"
                id="toggle-secret"
                onClick={() => setShowSecret((p) => !p)}
                style={styles.secretToggle}
              >
                {showSecret ? '▾' : '▸'} Admin Secret Key{' '}
                <span style={styles.optional}>(optional)</span>
              </button>
            </div>
            {showSecret && (
              <div style={{ ...styles.field, marginTop: '-8px' }}>
                <input
                  id="secretKey"
                  type="password"
                  name="secretKey"
                  placeholder="Enter admin secret key"
                  value={formik.values.secretKey}
                  onChange={formik.handleChange}
                  style={styles.input}
                />
              </div>
            )}

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading || !formik.isValid}
              style={{
                ...styles.btn,
                ...(loading || !formik.isValid ? styles.btnDisabled : {}),
              }}
            >
              {loading ? '⟳ Creating Account...' : '→ Create Account'}
            </button>
          </form>

          <p style={styles.switchText}>
            Already registered?{' '}
            <Link to="/login" style={styles.link}>
              Sign in here
            </Link>
          </p>

          {/* Strength indicator */}
          {formik.values.password && (
            <div style={styles.strengthWrap}>
              <div
                style={{
                  ...styles.strengthBar,
                  width:
                    formik.values.password.length >= 12
                      ? '100%'
                      : formik.values.password.length >= 8
                      ? '66%'
                      : '33%',
                  background:
                    formik.values.password.length >= 12
                      ? '#23D18B'
                      : formik.values.password.length >= 8
                      ? '#F0A500'
                      : '#FF4B4B',
                }}
              />
              <span style={styles.strengthLabel}>
                {formik.values.password.length >= 12
                  ? 'Strong'
                  : formik.values.password.length >= 8
                  ? 'Medium'
                  : 'Weak'}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Inline Styles ───────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0D1117',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  gridBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(232,93,38,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,93,38,0.04) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  card: {
    background: '#161B22',
    border: '1px solid #30363D',
    borderRadius: '16px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    boxShadow: '0 0 60px rgba(232,93,38,0.08)',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  logoIcon: {
    fontSize: '28px',
    color: '#E85D26',
    filter: 'drop-shadow(0 0 8px rgba(232,93,38,0.6))',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#E6EDF3',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    textAlign: 'center',
    color: '#8B949E',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '24px',
    marginTop: 0,
  },
  heading: {
    textAlign: 'center',
    fontSize: '26px',
    fontWeight: 600,
    color: '#E6EDF3',
    letterSpacing: '-0.02em',
    marginBottom: '28px',
    marginTop: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#8B949E',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  input: {
    background: '#0D1117',
    border: '1px solid #30363D',
    borderRadius: '8px',
    padding: '12px 14px',
    color: '#E6EDF3',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: "'Inter', sans-serif",
    width: '100%',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: '#FF4B4B',
  },
  errorMsg: {
    color: '#FF4B4B',
    fontSize: '12px',
  },
  secretToggleWrap: {
    marginTop: '-6px',
  },
  secretToggle: {
    background: 'none',
    border: 'none',
    color: '#8B949E',
    fontSize: '13px',
    cursor: 'pointer',
    padding: 0,
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  optional: {
    color: '#30363D',
    fontSize: '11px',
  },
  btn: {
    marginTop: '4px',
    background: 'linear-gradient(135deg, #E85D26, #F0A500)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '13px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.02em',
    transition: 'opacity 0.2s',
    fontFamily: "'Inter', sans-serif",
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  switchText: {
    textAlign: 'center',
    color: '#8B949E',
    fontSize: '13px',
    marginTop: '20px',
  },
  link: {
    color: '#E85D26',
    textDecoration: 'none',
    fontWeight: 500,
  },
  strengthWrap: {
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  strengthBar: {
    height: '4px',
    borderRadius: '2px',
    transition: 'width 0.3s, background 0.3s',
    flex: 1,
    maxWidth: '200px',
    background: '#FF4B4B',
  },
  strengthLabel: {
    fontSize: '11px',
    color: '#8B949E',
  },
}
