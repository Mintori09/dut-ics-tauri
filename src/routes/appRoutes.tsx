import { RouteType } from "./config";
import { Home, Languages, Video } from "lucide-react";

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
      icon: <Home className="w-5 h-5" />,
    },
  },
  {
    element: <DutLayout />,
    path: "dut",
    state: "dut",
    props: {
      displayText: "DUT",
      icon: <Home className="w-5 h-5" />,
    },
    child: [
      {
        index: true,
        element: <DutDefault />,
        state: "dut.default",
      },
      {
        element: <ScorePage />,
        path: "/dut/score",
        state: "dut.score",
        props: {
          displayText: "Score",
        },
      },
      {
        element: <SchedulePage />,
        path: "/dut/schedule",
        state: "dut.schedule",
        props: {
          displayText: "Schedule",
        },
      },
    ],
  },
  {
    element: <VideoDuration />,
    state: "video",
    path: "/video/duration",
    props: {
      displayText: "Video Duration",
      icon: <Video className="w-5 h-5" />,
    },
  },
  {
    element: <TranslateFilePage />,
    state: "translate.file",
    path: "/translate",
    props: {
      displayText: "Translate",
      icon: <Languages className="w-5 h-5" />,
    },
  },
];

export { mainLayout };
