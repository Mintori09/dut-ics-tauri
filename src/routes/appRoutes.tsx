import HomePage from "../features/home/HomePage";
import { RouteType } from "./config";
import { HomeOutlined, Translate, VideocamOutlined } from "@mui/icons-material";
import { IcsCalendarPage } from "../features/calendar/IcsCalendarPage";
import DutLayout from "../components/layout/DutLayout";
import DutDefault from "../pages/Dut/DutDefault";
import VideoDuration from "../pages/Video/pages/VideoDuration";
import TranslateFilePage from "../pages/Translate/pages/TranslateFilePage";

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
    {
        element: <VideoDuration />,
        state: "video",
        path: "/video/duration",
        props: {
            displayText: "Video Duration",
            icon: <VideocamOutlined />
        }
    },
    {
        element: < TranslateFilePage />,
        state: "translate.file",
        path: "/transale",
        props: {
            displayText: "Translate",
            icon: <Translate />
        }
    },
];

export { mainLayout };
