import React from "react";
import { useNavigate } from "react-router-dom";

export const Home: React.FC = () => {

    const navigate = useNavigate();

    const handleStart = () => {
        navigate("/login");
    }

    return (

        // <div>

        //     <h1>Sistema de Predicción</h1>

        //     {/* <Link to="/prediction">
        //         Ir a Predicción
        //     </Link> */}

        // </div>

        <div className="landing-page">
            {/* --- HERO SECTION --- */}
            <header className="hero-section">
                <h1>Predice Tiempos de Producción con IA</h1>
                <p className="hero-subtitle">
                    Sistema inteligente basado en Machine Learning para optimizar tu clínica.
                    Reduce retrasos, mejora la planificación y aumenta la rentabilidad.
                </p>
                <div className="hero-actions">
                    <button className="btn-primary" onClick={handleStart}>
                        Iniciar Sesion
                    </button>
                </div>
            </header>

            {/* --- CARACTERÍSTICAS PRINCIPALES --- */}
            <section className="features-section">
                <h2>Características Principales</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <h3>Predicción en Tiempo Real</h3>
                        <p>IA que predice tiempos de producción con 92% de precisión.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Optimización Automática</h3>
                        <p>Mejora continua con Machine Learning a partir de tus datos.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Análisis Profundo</h3>
                        <p>Reportes y dashboards con métricas clave del negocio.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Gestión de Tiempos</h3>
                        <p>Controla cada etapa del proceso de producción.</p>
                    </div>
                </div>
            </section>

            {/* --- RESULTADOS PROBADOS --- */}
            <section className="stats-section">
                <h2>Resultados Probados</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-icon">📉</span>
                        <h3>35%</h3>
                        <p>Reducción de retrasos</p>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">⏱️</span>
                        <h3>50h/mes</h3>
                        <p>Tiempo ahorrado</p>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">🎯</span>
                        <h3>92%</h3>
                        <p>Precisión del ML</p>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">💰</span>
                        <h3>10x</h3>
                        <p>ROI en 6 meses</p>
                    </div>
                </div>
            </section>

            {/* --- TESTIMONIOS --- */}
            <section className="testimonials-section">
                <h2>Lo que dicen nuestros clientes</h2>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <div className="testimonial-user">
                            <span className="user-icon">👤</span>
                            <div>
                                <h4>Carlos Mendez</h4>
                                <span>Gerente de Producción @ PrintFlow Solutions</span>
                            </div>
                        </div>
                        <p>"La clínica redujo nuestros retrasos en 40%. El ML predice con increíble precisión."</p>
                        <div className="stars">⭐⭐⭐⭐⭐</div>
                    </div>

                    <div className="testimonial-card">
                        <div className="testimonial-user">
                            <span className="user-icon">👩‍💼</span>
                            <div>
                                <h4>Maria Garcia</h4>
                                <span>CEO @ Gráficos Premium</span>
                            </div>
                        </div>
                        <p>"Es como tener un experto en planificación 24/7. Ha transformado nuestra operación."</p>
                        <div className="stars">⭐⭐⭐⭐⭐</div>
                    </div>

                    <div className="testimonial-card">
                        <div className="testimonial-user">
                            <span className="user-icon">👨‍💼</span>
                            <div>
                                <h4>Roberto Silva</h4>
                                <span>Director Operativo @ Industrial Print Co</span>
                            </div>
                        </div>
                        <p>"La mejor inversión que hicimos. Ya no tenemos sorpresas con los tiempos."</p>
                        <div className="stars">⭐⭐⭐⭐⭐</div>
                    </div>
                </div>
            </section>

            {/* --- PREGUNTAS FRECUENTES (FAQ) --- */}
            <section className="faq-section">
                <h2>Preguntas Frecuentes</h2>
                <div className="faq-list">
                    <details className="faq-item">
                        <summary>¿Cómo funciona la predicción de ML?</summary>
                        <p>Nuestro modelo Random Forest analiza 4 variables clave: tipo de impresión, tamaño, cantidad y material. Con tus datos históricos mejora constantemente.</p>
                    </details>
                    <details className="faq-item">
                        <summary>¿Qué nivel de precisión tiene?</summary>
                        <p>Actualmente el sistema cuenta con un 92% de precisión media ponderada, optimizándose dinámicamente con cada nuevo lote de datos de producción registrado.</p>
                    </details>
                    <details className="faq-item">
                        <summary>¿Se integra con mi sistema actual?</summary>
                        <p>Sí, contamos con soporte nativo para webhooks y nuestra nueva integración directa con Zapier para conectar tus flujos de trabajo sin escribir código.</p>
                    </details>
                    <details className="faq-item">
                        <summary>¿Qué soporte ofrecen?</summary>
                        <p>Ofrecemos soporte técnico vía chat y correo electrónico 24/7 para planes corporativos, y documentación completa de la API para desarrolladores.</p>
                    </details>
                </div>
            </section>

            {/* --- CALL TO ACTION FINAL --- */}
            <section className="cta-final-section">
                <h2>¿Listo para transformar tu producción?</h2>
                <p>Únete a 500+ empresas que ya optimizan con Impresiones Express</p>
                <button className="btn-primary-large" onClick={handleStart}>
                    Comenzar Gratis Hoy
                </button>
            </section>

            {/* --- FOOTER --- */}
            <footer className="landing-footer">
                <div className="footer-brand">
                    <h3>Impresiones Express</h3>
                    <p>Optimización de producción con IA</p>
                </div>
                <div className="footer-links-container">
                    <div className="footer-links-column">
                        <h4>Producto</h4>
                        <a href="#features">Características</a>
                        <a href="#pricing">Precios</a>
                        <a href="#blog">Blog</a>
                    </div>
                    <div className="footer-links-column">
                        <h4>Empresa</h4>
                        <a href="#features">Características</a>
                        <a href="#pricing">Precios</a>
                        <a href="#blog">Blog</a>
                    </div>
                    <div className="footer-links-column">
                        <h4>Legal</h4>
                        <a href="#features">Características</a>
                        <a href="#pricing">Precios</a>
                        <a href="#blog">Blog</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Impresiones Express. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}