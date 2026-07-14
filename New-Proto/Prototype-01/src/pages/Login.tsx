import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false); // <--- Controla el efecto físico de error
    const navigate = useNavigate();

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsShaking(false);

        console.log('Login intent:', { email, password });

        if (email === 'admin@admin.com' && password === 'admin1') {
            console.log('Autenticación exitosa');
            navigate('/dashboard');
        } else {
            // Dispara el efecto de sacudida idéntico al login de macOS
            setIsShaking(true);
            setError('Correo electrónico o contraseña incorrectos');

            // Apaga la clase de animación después de que termine (350ms) para que pueda repetirse en el siguiente intento
            setTimeout(() => {
                setIsShaking(false);
            }, 350);
        }
    };

    return (
        <div className="login-page">
            {/* Fondo decorativo con esferas de luz desenfocadas estilo macOS */}
            <div className="login-bg-glows">
                <div className="bg-glow blue"></div>
                <div className="bg-glow green"></div>
            </div>

            <div className={`login-container ${isShaking ? 'shake-error' : ''}`}>
                {/* Cabecera / Avatar simulado de macOS */}
                <div className="login-header">
                    <div className="login-avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="avatar-icon">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <h2>Iniciar Sesión</h2>
                    <p>Ingresa a tu cuenta para predecir tiempos con IA</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleLoginSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="tu@empresa.com"
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Banner de error estilizado estilo Notificación macOS */}
                    {error && (
                        <div className="login-error-banner">
                            <span className="error-dot"></span>
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className="btn-primary-large">
                        Ingresar al Sistema
                    </button>
                </form>

                <button className="btn-link" onClick={() => navigate('/')}>
                    <span className="arrow">←</span> Volver al Inicio
                </button>
            </div>
        </div>
    );
};