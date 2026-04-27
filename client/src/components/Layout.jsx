import React, {useState} from "react";
import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import "../styles/layout.css";
import { Outlet } from "react-router-dom";


export default function Layout({children}){
    const [isCollapsed, setIsCollapsed] = useState(false);

    return(
        <div className="dashboard-container">
            <TopNav onToggleSidebar={()=> setIsCollapsed((s)=> !s)}/>
            <div className="main-layout">
                <Sidebar isCollapsed={isCollapsed} onToggle={()=> setIsCollapsed((s)=> !s)}/>
                <div className={`content-area ${isCollapsed ?" sidebar-collapsed":""}`}>
                    {children ?? <Outlet/>}
                </div>
            </div>
        </div>
    )
}