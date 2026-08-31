import React, { Fragment, useEffect, useRef, useState } from "react";
import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import UserShow from "../UserShow";
import './AdminPanel.css'
import Loading from '../Loading.jsx';

const AdminPanel = () => {
    const { user, getUsers } = useUser();
    const [users, setUsers] = useState([]);
    const [showList, setShowList] = useState([]);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    const search = () => {
        const filteredUsers = users.filter(user => user.nick.toLowerCase().includes(searchRef.current.value.toLowerCase()))
        setShowList(filteredUsers)
    }


    const getUserList = async () => {
        const newUserList = await getUsers();
        setUsers(newUserList);
        setShowList(newUserList);
    }



    useEffect(() => {
        if (!user || !user?.es_admin) {
            navigate('/')
        }
        getUserList();
    }, [])
    return (
        <Fragment>
            <div className="admin-panel">
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
        </Fragment>
    )
}
export default AdminPanel;