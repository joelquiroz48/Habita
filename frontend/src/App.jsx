import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Inicio from "./pages/Inicio/Inicio";
import MiPerfil from "./pages/MiPerfil/MiPerfil";
import Layout from "./components/Layout/Layout";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ----- Pantallas sin Layout ----- */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* ----- Pantallas con Layout ----- */}
                <Route path="/inicio" element={
                        <Layout>
                            <Inicio />
                        </Layout>
                    }
                />

                <Route path="/miPerfil" element={
                        <Layout>
                            <MiPerfil />
                        </Layout>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;