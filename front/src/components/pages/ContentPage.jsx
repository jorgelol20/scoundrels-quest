import React, { Fragment, useContext, useEffect, useState } from "react";
import AppRoutes from "../structure/AppRoutes.jsx";
import AchievementNotifie from "../modals/AchievementNotifie.jsx";
import { matchContext } from "../../context/MatchProvider.jsx";
import { useUser } from "../../hooks/useUser.js";

const ContentPage = () => {
    const { newAchievements } = useContext(matchContext)

    // Derivado directamente del array, sin estado ni setTimeout intermedios
    const achievementToShow = newAchievements?.length ? newAchievements[0] : null;

    return (
        <Fragment>
            {achievementToShow != null &&
                <AchievementNotifie achievementInfo={achievementToShow} />
            }
            <AppRoutes />
        </Fragment>
    );
}
export default ContentPage;