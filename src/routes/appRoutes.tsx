import HomePage from "../features/home/HomePage";
import { RouteType } from "./config";
import { HomeOutlined } from "@mui/icons-material";
import { IcsCalendarPage } from "../features/calendar/IcsCalendarPage";
import DutLayout from "../components/layout/DutLayout";
import DutDefault from "../pages/Dut/DutDefault";

const mainLayout: RouteType[] = [
    {
        index: true,
        element: <HomePage />,
        state: "home",
        props: {
            displayText: "Home Page",
            icon: <HomeOutlined />
        }
    },
    {
        element: <DutLayout />,
        path: "dut",
        state: "dut",
        props: {
            displayText: "DUT",
            icon: <HomeOutlined />
        },
        child: [
            {
                index: true,
                element: <DutDefault />,
                state: "dut.default"
            },
            {
                element: <IcsCalendarPage />,
                path: "/dut/calendar",
                state: "dut.calendar",
                props: {
                    displayText: "Extract Calendar",
                }
            }
        ],
    },
];

export { mainLayout };
