import { createContext, Fragment, useState, useCallback } from "react";

import { useReportBugs } from "../hooks/useReportBugs.js";
import BugForm from "./../components/modals/BugForm.jsx";

const bugReportContext = createContext();

const BugReportProvider = (props) => {
    // Hooks de datos externos
    const {
        useReportesList,
        newReporte,
        deleteReporte,
        updateEstadoReporte,
    } = useReportBugs();

    // Estado del modal de reporte
    const [isOpen, setIsOpen] = useState(false);
    const [bugInfo, setBugInfo] = useState(null);

    // Estado de reportes recién enviados en esta sesión (para feedback tipo "reporte enviado")
    const [sentReports, setSentReports] = useState([]);

    /**
     * Abre el modal de reporte, opcionalmente con logs precargados
     * (ej. capturados automáticamente tras un crash/error de partida).
     *
     * @param {{ logs?: string }} info
     */
    const openBugReport = useCallback((info = null) => {
        setBugInfo(info);
        setIsOpen(true);
    }, []);

    /**
     * Cierra el modal y limpia los logs precargados.
     */
    const closeBugReport = useCallback(() => {
        setIsOpen(false);
        setBugInfo(null);
    }, []);

    /**
     * Envía un nuevo reporte de bug y lo guarda en la lista de enviados de la sesión.
     *
     * @param {FormData} dataToSend
     */
    const handleNewBugReport = async (dataToSend) => {
        try {
            const reporte = await newReporte(dataToSend);
            setSentReports((prev) => [...prev, reporte]);
            return reporte;
        } catch (error) {
            console.error("Error al enviar el reporte de bug:", error.response?.data?.message);
            throw error;
        }
    };

    /**
     * Elimina un reporte propio.
     *
     * @param {int} reporteId
     */
    const handleDeleteBugReport = async (reporteId) => {
        try {
            await deleteReporte(reporteId);
            setSentReports((prev) => prev.filter((reporte) => reporte.id !== reporteId));
            return true;
        } catch (error) {
            console.error("Error al eliminar el reporte de bug:", error.response?.data?.message);
            return false;
        }
    };

    /**
     * Cambia el estado de un reporte (uso admin).
     *
     * @param {int} reporteId
     * @param {Object} dataToSend
     */
    const handleUpdateEstado = async (reporteId, dataToSend) => {
        try {
            const reporte = await updateEstadoReporte(reporteId, dataToSend);
            return reporte;
        } catch (error) {
            console.error("Error al actualizar el estado del reporte:", error.response?.data?.message);
            throw error;
        }
    };

    const exports = {
        isOpen,
        bugInfo,
        sentReports,
        useReportesList,
        openBugReport,
        closeBugReport,
        handleNewBugReport,
        handleDeleteBugReport,
        handleUpdateEstado,
    };

    return (
        <Fragment>
            <bugReportContext.Provider value={exports}>
                {props.children}

                {isOpen && (
                    <BugForm bugInfo={bugInfo} onClose={closeBugReport} />
                )}
            </bugReportContext.Provider>
        </Fragment>
    );
};

export default BugReportProvider;
export { bugReportContext };