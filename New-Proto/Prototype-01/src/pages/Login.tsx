import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        // Aquí iría la lógica de autenticación con tu API en el futuro
        console.log('Login intent:', { email, password });
        if (email === 'admin@admin.com' && password === 'admin1') {
            console.log('Autenticación exitosa');
            navigate('/dashboard');
        } else {
            setError('Correo electrónico o contraseña incorrectos');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>Iniciar Sesión</h2>
                <p>Ingresa a tu cuenta para predecir tiempos con IA</p>

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
                        />
                    </div>

                    <button type="submit" className="btn-primary-large">
                        Ingresar al Sistema
                    </button>
                </form>

                <button className="btn-link" onClick={() => navigate('/')}>
                    ← Volver al Inicio
                </button>
            </div>
        </div>
    );
};