import { Outlet } from "react-router-dom";

const DutLayout = () => {
  return (
    <div className="bg-white h-7">
      <Outlet />
    </div>
  );
};

export default DutLayout;
