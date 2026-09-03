import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from "react";
import './Navbar.css';
import { useUser } from '../../hooks/useUser.js';
import Placeholder from './../../../public//images/placeholder.webp'
import { NavLink, useLocation } from "react-router-dom";

import { settingsContext } from "../../context/SettingsProvider.jsx";

import FPSCounter from "./FPSCounter.jsx";
import UserShow from "../UserShow.jsx";
import ConfirmationModal from "./../modals/ConfirmationModal.jsx";
import GameIcon from '/images/banner_menu.webp';

const Navbar = () => {
    const { user, searchUsuario, isLoading, activePlayers } = useUser();
    const { showFPS } = useContext(settingsContext);
    const [userAvatar, setUserAvatar] = useState('');
    const [userColor, setUserColor] = useState('');

    const [userList, setUserList] = useState([]);
    const [isActiveSearch, setIsActiveSearch] = useState(false);

    const [toPage, setToPage] = useState(null)
    const searchRef = useRef(null);
    
    const location = useLocation()


    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleConfirmAction = async () => {
        setIsModalOpen(false);
        const eventoSalir = new CustomEvent('interrumpirPartida', { detail: { destino: toPage } });
        window.dispatchEvent(eventoSalir);
    };

    const handleCancelAction = async () => {
        setIsModalOpen(false);
    };

    const handleNavClick = (e, to) => {
        if (location.pathname === '/jugar') {
            e.preventDefault();
            setToPage(to)
            setIsModalOpen(true);
        }
    };

    useEffect(() => {
        if (!isLoading && user) {
            setUserAvatar(user.avatar);
            setUserColor(user.color);
        }
    }, [user, isLoading]);

    const handleSearchUser = async (search) => {
        if (search.trim() === "") {
            setUserList([]);
            return;
        }
        const users = await searchUsuario(search);
        setUserList(users);
    };

    // Función para resetear todo tras el clic
    const handleResultClick = () => {
        setIsActiveSearch(false);
        setUserList([]);
        if (searchRef.current) {
            searchRef.current.value = "";
        }
    };

    return (
        <Fragment>
            <nav>
                {showFPS && <FPSCounter />}
                <NavLink
                    onClick={(e) => handleNavClick(e, `/`)}
                    to={`/`}
                >
                    <img className="game-icon" alt="Icono juego" src={GameIcon} />
                </NavLink>

                <div className="navbar-items">
                    {!isLoading && user && (
                        <div className="navbar-active-players">
                            <span style={{ width: '8px', height: '8px', backgroundColor: '#2ecc71', borderRadius: '50%' }}></span>
                            {activePlayers} activos
                        </div>
                    )}
                    {!isLoading && user && (
                        <div className="search">
                            <input
                                ref={searchRef}
                                type="search"
                                className="search-input"
                                placeholder="Buscar usuario"
                                onFocus={() => setIsActiveSearch(true)}
                                onChange={(e) => handleSearchUser(e.target.value)}
                            />
                            {isActiveSearch && userList.length > 0 && (
                                <div className="searc-list">
                                    {userList.map((userInfo) => (
                                        <NavLink
                                            key={userInfo.nick}
                                            to={`/perfil/${userInfo.nick}`}
                                            onClick={(e) => {
                                                handleNavClick(e, `/perfil/${userInfo.nick}`);
                                                if (!e.defaultPrevented) handleResultClick();
                                            }}
                                        >
                                            <UserShow userInfo={userInfo} />
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {user && user.es_admin ?
                        <NavLink
                            onClick={(e) => handleNavClick(e, `/admin-panel`)}
                            to={`/admin-panel`}
                            className={({ isActive }) => isActive ? 'menu_link menu_link--active' : 'menu_link'}
                        >
                            Panel Admin
                        </NavLink>
                        : <></>}

                    <NavLink
                        to="/"
                        className={({ isActive }) => isActive ? 'menu_link menu_link--active' : 'menu_link'}
                        onClick={(e) => handleNavClick(e, '/')}
                    >
                        Inicio
                    </NavLink>

                    {!isLoading ? (
                        user ? (
                            <NavLink
                                onClick={(e) => handleNavClick(e, `/perfil/${user.nick}`)}
                                to={`/perfil/${user.nick}`}
                                className={({ isActive }) => isActive ? 'menu_link menu_link--active' : 'menu_link'}
                            >
                                <img
                                    className="navbar-avatar"
                                    src={userAvatar || Placeholder}
                                    alt="avatar"
                                    style={{ borderColor: userColor }}
                                    onError={(e) => {
                                        e.currentTarget.src = Placeholder;
                                    }}
                                />
                            </NavLink>
                        ) : (
                            <>
                                <NavLink to="/login" className={({ isActive }) => isActive ? 'menu_link menu_link--active' : 'menu_link'}>Iniciar sesión</NavLink>
                                <NavLink to="/signup" className={({ isActive }) => isActive ? 'menu_link menu_link--active' : 'menu_link'}>Registrarse</NavLink>
                            </>
                        )
                    ) : null}
                </div>
            </nav>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={handleCancelAction}
                onConfirm={handleConfirmAction}
                title="Salir de la Partida"
                message="Si sales, la partida contará como derrota."
            />
        </Fragment>
    );
};
export default Navbar