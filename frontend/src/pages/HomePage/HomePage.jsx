import Feed from "../../components/feed/feed";
import Header from "../../components/header/header";
import HeaderSidebarSwitch from "../../components/headerSidebarSwitch/headerSidebarSwitch";
import SideBar from "../../components/sideBar/sideBar";

function HomePage() {
  return (
    <>
      <HeaderSidebarSwitch />
      <Feed />
    </>
  );
}

export default HomePage;
