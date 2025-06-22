import { ReactNode } from "react";
import { mainLayout } from "./appRoutes";
import { generateRoute } from "./helpers/generateRoute";


export const routes: ReactNode = generateRoute(mainLayout);
