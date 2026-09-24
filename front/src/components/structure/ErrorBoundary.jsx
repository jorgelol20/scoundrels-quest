import { Component } from "react";

/**
 * Boundary para capturar errores de render en componentes hijos (Card, Konva,
 * etc.) que el try/catch de GamePage no puede alcanzar. Muestra un fallback
 * estilizado como la pantalla de fin de partida y ofrece recargar o volver.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error capturado por ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="game">
                    <div className="gameOver-menu">
                        <h1 className="lose">ERROR</h1>
                        <p>Se ha producido un error inesperado durante la partida.</p>
                        <button onClick={() => window.location.assign("/")}>
                            INICIO
                        </button>
                        <button onClick={() => window.location.reload()}>
                            REINTENTAR
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
