import React, { Fragment, useEffect, useRef, useState } from "react";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import UserShow from "../UserShow";
import './AdminPanel.css'
import Loading from '../Loading.jsx';
import { useReportBugs } from "../../hooks/useReportBugs.js";

const ESTADOS = [
    { value: 'abierto', label: 'Abierto' },
    { value: 'en_revision', label: 'En revisión' },
    { value: 'solucionado', label: 'Solucionado' },
    { value: 'descartado', label: 'Descartado' },
    { value: 'duplicado', label: 'Duplicado' },
];

const AdminPanel = () => {
    const { user, getUsers } = useUser();
    const [users, setUsers] = useState([]);
    const [showList, setShowList] = useState([]);
    const searchRef = useRef(null);
    const navigate = useNavigate();

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
                    <input ref={searchRef} type="text" placeholder="Buscar usuario" onChange={search} />
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
                        <h3>Reportes de bugs ({reportes?.data?.length??0})</h3>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="">Todos los estados</option>
                            {ESTADOS.map((e) => (
                                <option key={e.value} value={e.value}>{e.label}</option>
                            ))}
                        </select>
                    </div>

                    {isLoadingReportes && <Loading />}
                    {reportesError && <p className="bug-reports-error">Error al cargar los reportes.</p>}

                    {!isLoadingReportes && reportes?.data?.length === 0 && (
                        <p>No hay reportes {filtroEstado ? `en estado "${filtroEstado}"` : ''}.</p>
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