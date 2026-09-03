import React, { Fragment, lazy, Suspense } from "react";
import { Routes, Route } from 'react-router-dom';


const LoginPage = lazy(() => import('../pages/LoginPage.jsx'));
const ProfilePage = lazy(() => import('../pages/ProfilePage.jsx'));
const ProfileEdit = lazy(() => import('../pages/ProfileEditPage.jsx'));
const MainPage = lazy(() => import('../pages/MainPage.jsx'));
const SignupPage = lazy(() => import('../pages/SignupPage.jsx'));
const GamePage = lazy(() => import('../pages/GamePage.jsx'));
const SettingsPage = lazy(() => import('../pages/SettingsPage.jsx'));
const MatchPage = lazy(() => import('../pages/MatchPage.jsx'));
const Tutorial = lazy(() => import('../pages/Tutorial.jsx'));
const CreditPage = lazy(()=> import("../pages/CreditPage.jsx"));
const PrivacyPage = lazy(()=> import("../pages/PrivacyPage.jsx"));
const CookiesPage = lazy(()=> import("../pages/CookiesPage.jsx"));
const TermsPage = lazy(()=> import("../pages/TermsPage.jsx"));
const LegalPage = lazy(()=> import("../pages/LegalPage.jsx"));
const AdminPanel = lazy(()=> import("../pages/AdminPanel.jsx"));
const GoogleCallback = lazy(()=> import("./GoogleCallback.jsx"));
const BugReportPage = lazy(()=> import("../pages/BugReportPage.jsx"));

const AppRoutes = () => {
    return (
        <Fragment>
            <Suspense fallback={<div>Cargando página...</div>}>
                <Routes>
                    <Route path="/perfil/:nick/editar" element={<ProfileEdit/>}/>
                    <Route path='/perfil/:nick' element={<ProfilePage/>}/>
                    <Route path='/perfil' element={<ProfilePage/>}/>

                    <Route path='/jugar/tutorial' element={<Tutorial/>}/>

                    <Route path='/partida/:matchId' element={<MatchPage/>}/>
                    
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/signup" element={<SignupPage/>}/>

                    <Route path="/" element={<MainPage/>}/>
                    <Route path="/jugar" element={<GamePage/>}/>
                    <Route path='/ajustes' element={<SettingsPage/>}/>
                    
                    <Route path="/creditos" element={<CreditPage/>}/>
                    <Route path="/privacy" element={<PrivacyPage/>}/>
                    <Route path="/cookies" element={<CookiesPage/>}/>
                    <Route path="/terms" element={<TermsPage/>}/>
                    <Route path="/legal" element={<LegalPage/>}/>

                    <Route path="/auth/callback" element={<GoogleCallback/>}/>

                    <Route path="/admin-panel" element={<AdminPanel/>}/>

                    <Route path="/reportes-bug/:id" element={<BugReportPage/>}/>

                    
                    
                    <Route path="/*" element={<MainPage/>}/>
                </Routes>
            </Suspense>
        </Fragment>
    )
}

export default AppRoutes;