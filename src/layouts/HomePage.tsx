import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/dut/schedule");
  }, []);
  return <div></div>;
}

export default HomePage;
