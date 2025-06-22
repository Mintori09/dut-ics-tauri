import { ReactNode } from "react";
import { RouteType } from "../config";
import { Route } from "react-router-dom";
import PageWrapper from "../../components/layout/PageWrapper";
import { useDispatch } from "react-redux";
import { setAppState } from "../../redux/features/appStateSlice";

export const generateRoute = (routes: RouteType[]): ReactNode => {
    return routes.map((route, index) => {
        const element = (
            <PageWrapper appState={route.state} state={route.child ? undefined : route.state} >
                {route.element}
            </PageWrapper>
        );

        return route.index ? (
            <Route index
                element={element}
                key={route.state || route.path || index}
            >
            </Route>
        ) : (
            <Route
                path={route.path}
                element={element}
                key={route.state || route.path || index}
            >
                {route.child && (
                    generateRoute(route.child)
                )}
            </Route>
        );
    });
};
