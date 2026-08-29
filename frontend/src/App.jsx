import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

import Inicio from "./pages/Inicio/Inicio";
import Expensas from "./pages/Expensas/Expensas";
import Reservas from "./pages/Reservas/Reservas";
import Avisos from "./pages/Avisos/Avisos";
import Documentos from "./pages/Documentos/Documentos";

import Perfil from "./pages/Perfil/Perfil";
import Configuracion from "./pages/Configuracion/Configuracion";

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

                <Route path="/expensas" element={
                        <Layout>
                            <Expensas />
                        </Layout>
                    }
                />

                <Route path="/reservas" element={
                        <Layout>
                            <Reservas />
                        </Layout>
                    }
                />

                <Route path="/avisos" element={
                        <Layout>
                            <Avisos />
                        </Layout>
                    }
                />

                <Route path="/documentos" element={
                        <Layout>
                            <Documentos />
                        </Layout>
                    }
                />

                <Route path="/perfil" element={
                        <Layout>
                            <Perfil />
                        </Layout>
                    }
                />

                <Route path="/configuracion" element={
                        <Layout>
                            <Configuracion />
                        </Layout>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;