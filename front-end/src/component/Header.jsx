import { Link } from "react-router-dom";
import React from "react";

const Header = () => {
    return (<>
        <nav className="navbar navbar-expand-lg navbar-light bg-dark ">
            <div className="container-fluid">
                <div className="mx-auto ">
                    <div className="collapse navbar-collapse" id="navbarSupportedContent ">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0" >
                        <li className="nav-item">
                            <Link className="nav-link active text-white" aria-current="page" to="/">Home</Link>
                        </li>
                        <li className="nav-item text-white">
                            <Link className="nav-link text-white" to="/data-sensor">Data sensor</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/action-history">Action History</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/profile">Profile</Link>
                        </li>
                    </ul>
                </div>
                </div>
                
            </div>
        </nav>
    </>);
}
export default Header;