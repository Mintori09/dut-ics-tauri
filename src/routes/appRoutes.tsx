import { RouteType } from "./config";
import { HomeOutlined, Translate, VideocamOutlined } from "@mui/icons-material";
import DutLayout from "../components/layout/DutLayout";
import DutDefault from "../pages/Dut/DutDefault";
import VideoDuration from "../pages/Video/pages/VideoDuration";
import TranslateFilePage from "../pages/Translate/pages/TranslateFilePage";
import ScorePage from "../pages/Dut/ScorePage";
import SchedulePage from "../pages/Dut/SchedulePage";
import HomePage from "../layouts/HomePage";

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
                element: <ScorePage />,
                path: "/dut/score",
                state: "dut.score",
                props: {
                    displayText: "Score"
                }
            },
            {
                element: <SchedulePage />,
                path: "/dut/schedule",
                state: "dut.schedule",
                props: {
                    displayText: "Schedule"
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
