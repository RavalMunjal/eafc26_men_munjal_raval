import { useFormik } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { loginUser, clearAuthError } from '../store/authSlice'
import { loginSchema } from '../utils/validators'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated, user } = useSelector((s) => s.auth)

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  // Show Redux error as toast
  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearAuthError())
    }
  }, [error, dispatch])

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      const result = await dispatch(loginUser(values))
      if (loginUser.fulfilled.match(result)) {
        toast.success('Welcome back! 🎯')
        const role = result.payload?.user?.role
        navigate(role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true })
      }
    },
  })

  return (
    <>
      <Helmet>
        <title>ConflictLens — Login</title>
        <meta name="description" content="Login to ConflictLens War Economic Impact Analytics Dashboard" />
      </Helmet>

      <div style={styles.page}>
        {/* Background grid pattern */}
        <div style={styles.gridBg} />

        <div style={styles.card}>
          {/* Logo */}
          <div style={styles.logoWrap}>
            <span style={styles.logoIcon}>⊕</span>
            <span style={styles.logoText}>ConflictLens</span>
          </div>

          <p style={styles.subtitle}>War Economic Impact Analytics</p>
          <h1 style={styles.heading}>Sign In</h1>

          <form onSubmit={formik.handleSubmit} style={styles.form} noValidate>
            {/* Email */}
            <div style={styles.field}>
              <label style={styles.label}>EMAIL ADDRESS</label>
              <input
                id="email"
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
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                style={{
                  ...styles.input,
                  ...(formik.touched.password && formik.errors.password ? styles.inputError : {}),
                }}
                autoComplete="current-password"
              />
              {formik.touched.password && formik.errors.password && (
                <span style={styles.errorMsg}>{formik.errors.password}</span>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading || !formik.isValid}
              style={{
                ...styles.btn,
                ...(loading ? styles.btnDisabled : {}),
              }}
            >
              {loading ? (
                <span style={styles.spinner}>⟳ Authenticating...</span>
              ) : (
                '→ Access Dashboard'
              )}
            </button>
          </form>

          <p style={styles.switchText}>
            No account?{' '}
            <Link to="/register" style={styles.link}>
              Register here
            </Link>
          </p>

          {/* Divider + demo hint */}
          <div style={styles.divider} />
          <p style={styles.hint}>
            🔐 Admin? Add your <code style={styles.code}>secretKey</code> on the register page.
          </p>
        </div>
      </div>
    </>
  )
}

// ─── Inline Styles (military dark) ───────────────────────────────────────────

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
    gap: '20px',
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
  },
  inputError: {
    borderColor: '#FF4B4B',
  },
  errorMsg: {
    color: '#FF4B4B',
    fontSize: '12px',
  },
  btn: {
    marginTop: '8px',
    background: 'linear-gradient(135deg, #E85D26, #F0A500)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '13px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.02em',
    transition: 'opacity 0.2s, transform 0.1s',
    fontFamily: "'Inter', sans-serif",
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
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
  divider: {
    height: '1px',
    background: '#30363D',
    margin: '20px 0',
  },
  hint: {
    textAlign: 'center',
    color: '#8B949E',
    fontSize: '12px',
    margin: 0,
  },
  code: {
    background: '#0D1117',
    color: '#F0A500',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
  },
}
