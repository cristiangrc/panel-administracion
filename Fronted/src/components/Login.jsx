import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recordarme, setRecordarme] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const [modoRegistro, setModoRegistro] = useState(false);
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmar, setRegConfirmar] = useState('');
  const [errorRegistro, setErrorRegistro] = useState('');
  const [cargandoRegistro, setCargandoRegistro] = useState(false);

  // Estado del flujo de recuperación: null = login normal, 'solicitar', 'verificar', 'restablecer'
  const [modoRecuperacion, setModoRecuperacion] = useState(null);
  const [recuperacionEmail, setRecuperacionEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState('');
  const [cargandoRecuperacion, setCargandoRecuperacion] = useState(false);

  // ========== LOGIN ==========
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Credenciales inválidas');
        setCargando(false);
        return;
      }

      if (recordarme) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('usuario', JSON.stringify(data.user));
      }

      onLogin(data.token, data.user);
    } catch (err) {
      setError('Error de conexión con el servidor');
      setCargando(false);
    }
  };

  // ========== RECUPERACIÓN: PASO 1 - Solicitar código ==========
  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    setMensajeRecuperacion('');
    setCargandoRecuperacion(true);

    try {
      const res = await fetch('/api/recuperacion/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recuperacionEmail })
      });

      const data = await res.json();

      if (!res.ok) {
        setMensajeRecuperacion(data.error || 'Error al solicitar el código');
        setCargandoRecuperacion(false);
        return;
      }

      setMensajeRecuperacion(data.message);
      setModoRecuperacion('verificar');
      setCargandoRecuperacion(false);
    } catch (err) {
      setMensajeRecuperacion('Error de conexión con el servidor');
      setCargandoRecuperacion(false);
    }
  };

  // ========== RECUPERACIÓN: PASO 2 - Verificar código ==========
  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    setMensajeRecuperacion('');
    setCargandoRecuperacion(true);

    try {
      const res = await fetch('/api/recuperacion/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recuperacionEmail, codigo })
      });

      const data = await res.json();

      if (!res.ok) {
        setMensajeRecuperacion(data.error || 'Código inválido');
        setCargandoRecuperacion(false);
        return;
      }

      setModoRecuperacion('restablecer');
      setCargandoRecuperacion(false);
    } catch (err) {
      setMensajeRecuperacion('Error de conexión con el servidor');
      setCargandoRecuperacion(false);
    }
  };

  // ========== RECUPERACIÓN: PASO 3 - Restablecer contraseña ==========
  const handleRestablecer = async (e) => {
    e.preventDefault();
    setMensajeRecuperacion('');
    setCargandoRecuperacion(true);

    if (nuevaPassword !== confirmarPassword) {
      setMensajeRecuperacion('Las contraseñas no coinciden');
      setCargandoRecuperacion(false);
      return;
    }

    if (nuevaPassword.length < 6) {
      setMensajeRecuperacion('La contraseña debe tener al menos 6 caracteres');
      setCargandoRecuperacion(false);
      return;
    }

    try {
      const res = await fetch('/api/recuperacion/restablecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recuperacionEmail,
          codigo,
          nuevaPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMensajeRecuperacion(data.error || 'Error al restablecer');
        setCargandoRecuperacion(false);
        return;
      }

      // Éxito: volver al login
      setModoRecuperacion(null);
      setRecuperacionEmail('');
      setCodigo('');
      setNuevaPassword('');
      setConfirmarPassword('');
      setMensajeRecuperacion('');
      setEmail(recuperacionEmail);
      setPassword('');
    } catch (err) {
      setMensajeRecuperacion('Error de conexión con el servidor');
      setCargandoRecuperacion(false);
    }
  };

  const cancelarRecuperacion = () => {
    setModoRecuperacion(null);
    setRecuperacionEmail('');
    setCodigo('');
    setNuevaPassword('');
    setConfirmarPassword('');
    setMensajeRecuperacion('');
  };

  // ========== REGISTRO ==========
  const handleRegistro = async (e) => {
    e.preventDefault();
    setErrorRegistro('');
    setCargandoRegistro(true);

    if (regPassword !== regConfirmar) {
      setErrorRegistro('Las contraseñas no coinciden');
      setCargandoRegistro(false);
      return;
    }

    if (regPassword.length < 6) {
      setErrorRegistro('La contraseña debe tener al menos 6 caracteres');
      setCargandoRegistro(false);
      return;
    }

    try {
      const res = await fetch('/api/login/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: regNombre, email: regEmail, password: regPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorRegistro(data.error || 'Error al registrarse');
        setCargandoRegistro(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.user));
      onLogin(data.token, data.user);
    } catch (err) {
      setErrorRegistro('Error de conexión con el servidor');
      setCargandoRegistro(false);
    }
  };

  // ========== RENDERIZADO ==========
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>StockApp</h1>
          {!modoRecuperacion && !modoRegistro && <p>Iniciá sesión para continuar</p>}
          {modoRegistro && <p>Creá tu cuenta</p>}
          {modoRecuperacion === 'solicitar' && <p>Recuperá tu contraseña</p>}
          {modoRecuperacion === 'verificar' && <p>Ingresá el código que recibiste</p>}
          {modoRecuperacion === 'restablecer' && <p>Definí tu nueva contraseña</p>}
        </div>

        {/* ===== LOGIN NORMAL ===== */}
        {!modoRecuperacion && !modoRegistro && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="login-options">
              <label className="login-checkbox">
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                />
                Recordarme
              </label>
              <a href="#" className="login-forgot" onClick={(e) => { e.preventDefault(); setModoRecuperacion('solicitar'); setRecuperacionEmail(email); }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {error && <p className="feedback feedback-error">{error}</p>}

            <button type="submit" className="btn btn-primary login-btn" disabled={cargando}>
              {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>

            <p className="login-register-link">
              ¿No tenés cuenta?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setModoRegistro(true); setRegEmail(email); }}>
                Registrate
              </a>
            </p>
          </form>
        )}

        {/* ===== REGISTRO ===== */}
        {modoRegistro && (
          <form onSubmit={handleRegistro}>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={regNombre}
                onChange={(e) => setRegNombre(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                placeholder="Repetí tu contraseña"
                value={regConfirmar}
                onChange={(e) => setRegConfirmar(e.target.value)}
                required
              />
            </div>

            {errorRegistro && <p className="feedback feedback-error">{errorRegistro}</p>}

            <button type="submit" className="btn btn-primary login-btn" disabled={cargandoRegistro}>
              {cargandoRegistro ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>

            <p className="login-register-link">
              ¿Ya tenés cuenta?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setModoRegistro(false); setErrorRegistro(''); }}>
                Iniciá sesión
              </a>
            </p>
          </form>
        )}

        {/* ===== PASO 1: SOLICITAR CÓDIGO ===== */}
        {modoRecuperacion === 'solicitar' && (
          <form onSubmit={handleSolicitarCodigo}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={recuperacionEmail}
                onChange={(e) => setRecuperacionEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {mensajeRecuperacion && (
              <p className="feedback feedback-success">{mensajeRecuperacion}</p>
            )}

            <button type="submit" className="btn btn-primary login-btn" disabled={cargandoRecuperacion}>
              {cargandoRecuperacion ? 'Enviando...' : 'Enviar Código'}
            </button>

            <button type="button" className="btn btn-secondary login-btn" style={{ marginTop: '8px' }} onClick={cancelarRecuperacion}>
              Volver al Login
            </button>
          </form>
        )}

        {/* ===== PASO 2: VERIFICAR CÓDIGO ===== */}
        {modoRecuperacion === 'verificar' && (
          <form onSubmit={handleVerificarCodigo}>
            <div className="form-group">
              <label>Código de 6 dígitos</label>
              <input
                type="text"
                placeholder="000000"
                maxLength="6"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
                className="login-code-input"
              />
            </div>

            {mensajeRecuperacion && (
              <p className="feedback feedback-error">{mensajeRecuperacion}</p>
            )}

            <button type="submit" className="btn btn-primary login-btn" disabled={cargandoRecuperacion}>
              {cargandoRecuperacion ? 'Verificando...' : 'Verificar Código'}
            </button>

            <button type="button" className="btn btn-secondary login-btn" style={{ marginTop: '8px' }} onClick={cancelarRecuperacion}>
              Cancelar
            </button>
          </form>
        )}

        {/* ===== PASO 3: NUEVA CONTRASEÑA ===== */}
        {modoRecuperacion === 'restablecer' && (
          <form onSubmit={handleRestablecer}>
            <div className="form-group">
              <label>Nueva Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                placeholder="Repetí tu contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
              />
            </div>

            {mensajeRecuperacion && (
              <p className="feedback feedback-error">{mensajeRecuperacion}</p>
            )}

            <button type="submit" className="btn btn-primary login-btn" disabled={cargandoRecuperacion}>
              {cargandoRecuperacion ? 'Guardando...' : 'Restablecer Contraseña'}
            </button>

            <button type="button" className="btn btn-secondary login-btn" style={{ marginTop: '8px' }} onClick={cancelarRecuperacion}>
              Cancelar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
