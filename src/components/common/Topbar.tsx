import sizeConfigs from "../../configs/sizeConfigs";
import colorConfigs from "../../configs/colorConfigs";

const Topbar = () => {
  return (
    <div
      className="fixed top-0 right-0 h-14 flex items-center px-4 shadow-md rounded-lg"
      style={{
        width: `calc(100% - ${sizeConfigs.sidebar.width})`,
        marginLeft: sizeConfigs.sidebar.width,
        backgroundColor: colorConfigs.topbar.bg,
        color: colorConfigs.topbar.color,
        backgroundImage: "linear-gradient(to right, #f0f4c3, #dce775)",
      }}
    >
      <h1 className="font-bold text-lg">React sidebar</h1>
    </div>
  );
};

export default Topbar;
