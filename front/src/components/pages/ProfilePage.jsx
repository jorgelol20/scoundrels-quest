import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { useUser } from '../../hooks/useUser.js';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

import { settingsContext } from '../../context/SettingsProvider.jsx';

import Placeholder from '/images/placeholder.webp'
import ReportUserIcon from '/images/report_user.svg'
import './ProfilePage.css'
import Banner from '../structure/Banner.jsx';
import Loading from '../Loading.jsx';
import Match from '../Match.jsx';
import DeleteIcon from '/images/delete-icon.svg'
import { useAchievements } from '../../hooks/useAchievements.js';
import Achievement from '../Achievement.jsx';
import { bugReportContext } from '../../context/BugReportProvider.jsx';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { startButtonSound, setBannerImage } = useContext(settingsContext)
    const {openBugReport} = useContext(bugReportContext);

    const { user, getUsuario, logout, isLoading, isError, error, update, deleteProfilePhoto, isDeletingProfilePhoto } = useUser();
    const { achievements } = useAchievements();
    const { nick } = useParams();
    const [canEdit, setEdit] = useState(false);
    const [userInfo, setUserInfo] = useState({});
    const [isGettingUser, setIsGettingUser] = useState(true)
    const [userMatchs, setUserMatchs] = useState([]);
    const [userAchievements, setUserAchievements] = useState([])

    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (user == undefined && !isLoading) {
            navigate('/login');
        }
        if (isError) {
            if (error.response?.status === 401) {
                localStorage.removeItem('auth_token');
                navigate('/login');
            } else {
                return <p>Error al conectar con el servidor</p>
            }
        }
    }, [isLoading, nick])




    const checking = async () => {
        //Comprueba si es el dueño de este perfil.
        user?.nick == nick ? setEdit(true) : setEdit(false)

        //Comprobamos si el nick de los parámetros es distintos de `undefined`.
        if (nick !== undefined) {
            let temp = await getUsuario(nick)
            setUserInfo(temp[0])
            setIsGettingUser(false)
        }
        //Si nick es undefined, le mandamos a su perfil 
        else if (user !== undefined) {
            navigate(`/perfil/${user.nick}`)
        }
        else {
            navigate('/')
        }
    }
    const [showMatches, setShowMatches] = useState(true)

    const handleDelete = () => {
        deleteProfilePhoto(nick);
    }
    useEffect(() => {
        if (!isDeletingProfilePhoto) {
            checking();
        }
    }, [isDeletingProfilePhoto])


    const handleOrderChange = (e) => {
        setShowMatches(false)
        let temp = userMatchs
        let temp_final = []
        temp_final = temp.reverse()
        setUserMatchs(temp_final)
    }
    const handleFilterChange = (e) => {
        setShowMatches(false)
        setFilter(e)
    }

    // Use effect para que, cada vez que se cambia el estado de "mostrar partidas" vuelva a true y vuelvan a renderizarse
    // Se hace para que al cambiar el orden de la lista oblique a React a renderizar los cambios.
    useEffect(() => {
        if (!showMatches) {
            setShowMatches(true)
        }
    }, [showMatches])

    // Controlar y formatear la fecha de la última vez que el usuario se conectó.
    const handleLastTimeConnected = (lastTimeConnected) => {

        if (!lastTimeConnected) return "Desconectado";

        // Convertir la fecha de la BD (ultima_vez_visto) a milisegundos
        const formatedDate = lastTimeConnected.replace(' ', 'T') + 'Z';
        const sendedDate = new Date(formatedDate).getTime();
        const now = Date.now();

        // Pasa la hora a milisegundos y se comprueba la diferencia.
        const diferenceInSeconds = Math.floor((now - sendedDate) / 1000);

        // Menos de 60 segundos
        if (diferenceInSeconds < 60) {
            return "En línea";
        }

        // Menos de 1 hora
        const diferenceInMinutes = Math.floor(diferenceInSeconds / 60);
        if (diferenceInMinutes < 60) {
            return `Hace ${diferenceInMinutes} ${diferenceInMinutes === 1 ? 'minuto' : 'minutos'}`;
        }

        // Menos de 24 horas
        const diferenceInHours = Math.floor(diferenceInMinutes / 60);
        if (diferenceInHours < 24) {
            return `Hace ${diferenceInHours} ${diferenceInHours === 1 ? 'hora' : 'horas'}`;
        }

        // Más de 24 horas
        const diferenceInDays = Math.floor(diferenceInHours / 24);
        if (diferenceInDays === 1) {
            return "Ayer";
        } else {
            return `Hace ${diferenceInDays} días`;
        }
    };



    // Si cambia el nick (/perfil/nick) se realiza de nuevo el checking.
    useEffect(() => {
        if (!isLoading) {
            checking()
        }
    }, [isLoading, nick]);

    //Cuando se detecta un cambio en userInfo, se comprueba sus partidas jugadas y se ponen en el historial.
    useEffect(() => {
        if (userInfo?.tiene_jugadas) {
            setUserMatchs(userInfo?.tiene_jugadas.reverse())
        }
        if (userInfo?.logros) {
            const tempAchievements = achievements.map((achievement) => {
                // Buscamos si el usuario tiene este logro específico
                const userAchievement = userInfo.logros.find((ul) => ul.id === achievement.id);

                return {
                    ...achievement,
                    obtained: userAchievement ? userAchievement.pivot?.obtenido : false,
                    progreso: userAchievement ? userAchievement.pivot?.progreso : 0,
                    created_at: userAchievement ? userAchievement.pivot?.created_at : null
                };
            });

            setUserAchievements(tempAchievements);
        }
        if(userInfo?.banner){
            setBannerImage(userInfo?.banner);
        }
    }, [userInfo])

    if (isLoading | isGettingUser) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loading />
            </div>
        );
    }
    return (
        <Fragment>
            <div className='profile-container' style={{ display: "flex", justifyContent: 'center' }}>
                <button 
                className='report-user-button' 
                title={`Reportar a ${userInfo?.nick}`}
                onClick={()=>openBugReport(null,true,userInfo)}
                >
                    <img src={ReportUserIcon} alt="Reportar usuario"/>
                </button>
                <div className='user-background'>
                    <div className='userInfo'>
                        <div className='user-profile'>
                            <div className='user-basic' style={{ position: 'relative' }}>
                                <img className='user-avatar' style={{ borderColor: userInfo?.color }} src={userInfo?.avatar !== "" && userInfo?.avatar ? userInfo?.avatar : Placeholder} alt={`Avatar de ${userInfo?.nick}`} />
                                {user.es_admin ? <button className="delete-button" onClick={() => { confirm("Se eliminará la foto de perfil") ? handleDelete() : null }}><img className="delete-icon" src={DeleteIcon} alt="" /></button> : <></>}
                                <h1 className={userInfo?.es_admin ? 'admin userNick' : userInfo.is_tester ? 'tester userNick' : 'user userNick'}>{userInfo.nick}</h1>
                                <div className='titles'>
                                    {userInfo?.es_admin ? <h3 title='Título por ser admin'>➤ <span className='admin'>Administrador</span></h3> : <></>}
                                    {userInfo?.is_tester ? <h3 title='Título por ser tester' >➤ <span className='tester'>{userInfo.nick === "krm2707" ? 'Beater' : 'Tester'}</span></h3> : <></>}
                                </div>
                            </div>
                            <div>
                                <p>Desde: {new Date(userInfo.created_at).toLocaleDateString('es-ES')}</p>
                                <p>Última vez visto: {handleLastTimeConnected(userInfo?.ultima_vez_visto)}</p>
                                <p>Partidas jugadas: {userInfo?.tiene_jugadas?.length}</p>
                            </div>
                            <div className='user-buttons'>
                                {canEdit ?
                                    <>
                                        <button onClick={(event) => { startButtonSound(true); navigate(`/perfil/${userInfo.nick}/editar`) }}>Editar perfil</button>
                                        <button onClick={(event) => { startButtonSound(true); logout() }}>Cerrar sesión</button>
                                    </>
                                    : <></>}
                            </div>
                        </div>
                        <div className='user-history'>
                            <h1>Historial de partidas</h1>
                            <section className='match-history'>
                                {userMatchs?.length > 0 && showMatches ?
                                    userMatchs?.map((match, index) => {
                                        if (filter === "all") {
                                            return <div key={index + crypto.randomUUID()} onClick={() => { navigate(`/partida/${match.id}`) }}><Match key={index + crypto.randomUUID()} match={match} /></div>
                                        } else if (filter === "victory" && match.victoria == 1) {
                                            return <div key={index + crypto.randomUUID()} onClick={() => { navigate(`/partida/${match.id}`) }}><Match key={index + crypto.randomUUID()} match={match} /></div>
                                        } else if (filter === "lose" && match.victoria == 0) {
                                            return <div key={index + crypto.randomUUID()} onClick={() => { navigate(`/partida/${match.id}`) }}><Match key={index + crypto.randomUUID()} match={match} /></div>
                                        }
                                    })
                                    : <h1>Sin partidas jugadas</h1>}
                            </section>
                            <form style={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                                <select name="show" id="show" onChange={(e) => { handleFilterChange(e.currentTarget.value) }}>
                                    <option value="all">Todas</option>
                                    <option style={{ color: 'var(--main-gold)' }} value="victory">Victorias</option>
                                    <option style={{ color: 'var(--main-red)' }} value="lose">Derrotas</option>
                                </select>
                                <select defaultValue={0} name="order" id="order" onChange={(e) => { handleOrderChange(e.currentTarget.value) }}>
                                    <option value="1-0">Más reciente a más antigua</option>
                                    <option value="0-1">Más antigua a más reciente</option>
                                </select>
                            </form>
                        </div>
                        <div className='achievements'>
                            <h1>Logros</h1>
                            <div className='user-achievements'>
                                {userAchievements.length > 0 && userAchievements.sort((a, b) => a.codigo.localeCompare(b.codigo)).map(achievement => <Achievement key={achievement.nombre} achievementInfo={achievement} />)}
                            </div>
                        </div>
                    </div>
                    {canEdit || user?.es_admin && userInfo.reportes_bug.lenth > 0 ?
                        <div className='user-reports'>
                            <h1>Reportes de usuario</h1>
                            <div className='user-reports-list'>
                                {userInfo.reportes_bug.map((reporte) => (
                                <div key={reporte.id} className="bug-report-row"  onClick={()=>{navigate(`/reportes-bug/${reporte.id}`)}}>
                                    <div className="bug-report-info">
                                        <span className="bug-report-titulo">{reporte.titulo}</span>
                                        <div><span className={`bug-report-tipo tipo-${reporte.tipo}`}>{reporte.tipo}</span><span className={`bug-report-tipo ${reporte.estado}`}>{reporte.estado}</span></div>
                                        <p className="bug-report-descripcion">{reporte.descripcion}</p>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                        : <></>}
                </div>
            </div>
        </Fragment>
    );
};

export default ProfilePage;