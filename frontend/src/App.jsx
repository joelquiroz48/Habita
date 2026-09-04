import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Residente/Login/Login";
import Register from "./pages/Residente/Register/Register";

import Inicio from "./pages/Residente/Inicio/Inicio";
import Expensas from "./pages/Residente/Expensas/Expensas";
import Reservas from "./pages/Residente/Reservas/Reservas";
import Avisos from "./pages/Residente/Avisos/Avisos";
import Documentos from "./pages/Residente/Documentos/Documentos";
import Perfil from "./pages/Residente/Perfil/Perfil";
import Configuracion from "./pages/Residente/Configuracion/Configuracion";

import Layout from "./components/Layout/Layout";
import LayoutAdministrador from "./components/LayoutAdministrador/LayoutAdministrador";

import InicioAdmin from "./pages/Administrador/Inicio/inicio";
import ResidentesAdmin from "./pages/Administrador/Residentes/Residentes";
import UnidadesAdmin from "./pages/Administrador/Unidades/Unidades";
import ExpensasAdmin from "./pages/Administrador/Expensas/Expensas";
import PagosAdmin from "./pages/Administrador/Pagos/Pagos";
import ReclamosAdmin from "./pages/Administrador/Reclamos/Reclamos";
import ComunicadosAdmin from "./pages/Administrador/Comunicados/Comunicados";
import ReservasAdmin from "./pages/Administrador/Reservas/Reservas";
import DocumentosAdmin from "./pages/Administrador/Documentos/Documentos";
import ReportesAdmin from "./pages/Administrador/Reportes/Reportes";
import ConfiguracionAdmin from "./pages/Administrador/Configuracion/Configuracion";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ----- Pantallas sin Layout ----- */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* ----- Pantallas con Layout (Residente) ----- */}
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

                        <Route path="/administrador/residentes" element={
                <LayoutAdministrador>
                    <ResidentesAdmin />
                </LayoutAdministrador>
            }
        />
            <Route path="/administrador/pagos" element={
            <LayoutAdministrador>
                <PagosAdmin />
            </LayoutAdministrador>
        }
    />
            <Route path="/administrador/reclamos" element={
            <LayoutAdministrador>
                <ReclamosAdmin />
            </LayoutAdministrador>
        }
    />
            <Route path="/administrador/expensas" element={
            <LayoutAdministrador>
                <ExpensasAdmin />
            </LayoutAdministrador>
        }
    />

    <Route path="/administrador/unidades" element={
            <LayoutAdministrador>
                <UnidadesAdmin />
            </LayoutAdministrador>
        }
    />

    <Route path="/administrador/comunicados" element={
            <LayoutAdministrador>
                <ComunicadosAdmin />
            </LayoutAdministrador>
        }
    />  
        <Route path="/administrador/reservas" element={
            <LayoutAdministrador>
                <ReservasAdmin />
            </LayoutAdministrador>
        }
    />

        <Route path="/administrador/documentos" element={
            <LayoutAdministrador>
                <DocumentosAdmin />
            </LayoutAdministrador>
        }
    />
        <Route path="/administrador/reportes" element={
            <LayoutAdministrador>
                <ReportesAdmin />
            </LayoutAdministrador>
        }
    />

        <Route path="/administrador/configuracion" element={
            <LayoutAdministrador>
                <ConfiguracionAdmin />
            </LayoutAdministrador>
        }
    />


                    {/* ----- Pantallas con Layout (Administrador) ----- */}
                <Route path="/administrador/inicio" element={
                        <LayoutAdministrador>
                            <InicioAdmin />
                        </LayoutAdministrador>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
export default App;