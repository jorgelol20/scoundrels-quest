import React, { Fragment, useEffect, useRef, useState } from "react";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import UserShow from "../UserShow";
import './AdminPanel.css'
import Loading from '../Loading.jsx';
import { useReportBugs } from "../../hooks/useReportBugs.js";

const AdminPanel = () => {
    const { user, getUsers } = useUser();
    const { t } = useTranslation('bugs');
    const [users, setUsers] = useState([]);
    const [showList, setShowList] = useState([]);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // `value` es el identificador que se envía al backend: NO se traduce.
    // Reutiliza las mismas claves compartidas que BugReportPage (`bugs:status.*`).
    const ESTADOS = [
        { value: 'abierto', label: t('bugs:status.abierto') },
        { value: 'en_revision', label: t('bugs:status.en_revision') },
        { value: 'solucionado', label: t('bugs:status.solucionado') },
        { value: 'descartado', label: t('bugs:status.descartado') },
        { value: 'duplicado', label: t('bugs:status.duplicado') },
    ];

    // Reportes de bugs
    const { useReportesList, updateEstadoReporte } = useReportBugs();
    const [filtroEstado, setFiltroEstado] = useState('');
    const {
        data: reportes,
        isLoading: isLoadingReportes,
        error: reportesError,
    } = useReportesList(filtroEstado ? { estado: filtroEstado } : {});

    const search = () => {
        const filteredUsers = users.filter(user => user.nick.toLowerCase().includes(searchRef.current.value.toLowerCase()))
        setShowList(filteredUsers)
    }

    const getUserList = async () => {
        const newUserList = await getUsers();
        setUsers(newUserList);
        setShowList(newUserList);
    }

    const handleEstadoChange = async (reporteId, nuevoEstado) => {
        try {
            await updateEstadoReporte(reporteId, { estado: nuevoEstado });
        } catch (error) {
            console.error("Error al actualizar el estado del reporte:", error.response?.data?.message);
        }
    };

    useEffect(() => {
        if (!user || !user?.es_admin) {
            navigate('/')
        }
        getUserList();
    }, [])

    return (
        <Fragment>
            <div className="admin-panel">
                <div className="users">
                    <input ref={searchRef} type="text" placeholder={t('bugs:admin.searchUsers')} onChange={search} />
                    {showList.length > 0 ?
                        <div className="users-panel">
                            {showList.map(user =>
                                <div key={user.id} className="user-row">
                                    <UserShow userInfo={user} admin={true} />
                                </div>
                            )}
                        </div>
                        : <Loading />
                    }
                </div>
                <div className="bug-reports">
                    <div className="bug-reports-header">
                        <h3>{t('bugs:admin.title', { count: reportes?.data?.length ?? 0 })}</h3>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="">{t('bugs:filters.allStates')}</option>
                            {ESTADOS.map((e) => (
                                <option key={e.value} value={e.value}>{e.label}</option>
                            ))}
                        </select>
                    </div>

                    {isLoadingReportes && <Loading />}
                    {reportesError && <p className="bug-reports-error">{t('bugs:admin.loadError')}</p>}

                    {!isLoadingReportes && reportes?.data?.length === 0 && (
                        <p>{t('bugs:admin.noReports', {
                            suffix: filtroEstado
                                ? t('bugs:admin.noReportsState', { estado: filtroEstado })
                                : '',
                        })}</p>
                    )}

                    {!isLoadingReportes && reportes?.data?.length > 0 && (
                        <div className="bug-reports-list">
                            {reportes.data.map((reporte) => (
                                <div key={reporte.id} className="bug-report-row"  onClick={()=>{navigate(`/reportes-bug/${reporte.id}`)}}>
                                    <div className="bug-report-info">
                                        <span className="bug-report-titulo">{reporte.titulo}</span>
                                        <div><span className={`bug-report-tipo tipo-${reporte.tipo}`}>{reporte.tipo}</span><span className={`bug-report-tipo ${reporte.estado}`}>{reporte.estado}</span></div>
                                        <p className="bug-report-descripcion">{reporte.descripcion}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    )
}
export default AdminPanel;