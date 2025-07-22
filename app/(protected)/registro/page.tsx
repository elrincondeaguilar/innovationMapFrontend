/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import { ArticuladorService } from "../../services/nuevasEntidadesService";
import { EmpresaService } from "../../services/backendService";
import {
  Articulador,
  CreateEmpresaRequest,
  CreateArticuladorRequest,
} from "../../types/api";

interface ScrapedArticulador {
  a_o?: string;
  c_digo?: string;
  sector?: string;
  entidad?: string;
  instrumentos_ofertados?: string;
  antig_edad_oferta?: string;
  p_gina?: string;
  descripci_n?: string;
  contacto?: string;

  usuarios_emprendedores?: string;
  usuarios_mipymes?: string;
  usuarios_grandes_empresas?: string;
  usuarios_academia?: string;
  usuarios_entidades_gobierno?: string;
  usuarios_organizaciones_de?: string;
  usuarios_personas_naturales?: string;

  tipo_de_apoyo_apoyo_financiero?: string;
  tipo_de_apoyo_asistencia?: string;
  tipo_de_apoyo_formaci_n_de?: string;
  tipo_de_apoyo_incentivos?: string;
  tipo_de_apoyo_eventos?: string;
  tipo_de_apoyo_compra_p_blica?: string;
  tipo_de_apoyo_redes_de?: string;
  tipo_de_apoyo_bonos_y_bouchers?: string;
  tipo_de_apoyo_sistemas_de?: string;
  tipo_de_apoyo_premios_y?: string;
  tipo_de_apoyo_instrumentos?: string;

  fecha_apertura?: string;
  fecha_cierre?: string;
  cobertura?: string;
  departamentos_y_municipios?: string;

  objetivo_formaci_n_del_capital?: string;
  objetivo_dedicaci_n_a_formaci?: string;
  objetivo_comercio_electronico?: string;
  objetivo_dedicaci_n_a_comercio?: string;
  objetivo_innovaci_n?: string;
  objetivo_de_dedicaci_n_a?: string;
  objetivo_emprendimiento?: string;
  objetivo_de_dedicaci_n_a_1?: string;
  objetivo_transferencia_de?: string;
  objetivo_de_dedicacion_a?: string;
  objetivo_investigaci_n?: string;
  objetivo_de_dedicaci_n_a_2?: string;
  objetivo_calidad?: string;
  objetivo_de_dedicaci_n_a_3?: string;
  objetivos_cl_ster_o?: string;
  objetivo_de_dedicaci_n_a_4?: string;
  objetivo_financiaci_n?: string;
  objetivo_de_dedicaci_n_a_5?: string;
  objetivo_comercializaci_n?: string;
  objetivo_de_dedicaci_n_a_6?: string;
  objetivo_formalizaci_n?: string;
  objetivo_de_dedicaci_n_a_7?: string;
  objetivo_crecimiento?: string;
  objetivo_de_dedicaci_n_a_8?: string;
  objetivo_inclusi_n_financiera?: string;
  objetivo_de_dedicaci_n_a_9?: string;
  recursos_pgn?: string;
  recursos_cooperaci_n?: string;
  recursos_sgr?: string;
  recursos_esfuerzo_fiscal?: string;
  recursos_parafiscales?: string;
  recursos_otros?: string;
  recursos_privado?: string;
  el_instrumento_se_dise_a?: string;
  el_instrumento_se_dise_a_1?: string;
  el_instrumento_est_descrito?: string;
  origen_del_instrumento?: string;
  el_instrumento_soluciona?: string;
  existen_otras_alternativas?: string;
  objetivos_que_orientan_la?: string;
  el_instrumento_tiene_marco?: string;
  insumos_necesarios_para_la?: string;
  actividades_que_se_deben?: string;
  principales_productos?: string;
  resultados_e_impactos?: string;
  poblaci_n_objetivo_del?: string;
  criterios_de_focalizaci_n?: string;
  el_instrumento_contempla?: string;
  selecci_n_de_los_beneficiarios?: string;
  acceso_de_los_potenciales?: string;
  se_tiene_trazabilidad_de?: string;
  disponibilidad_de_recursos?: string;
  gesti_n_organizativa_del?: string;
  personal_de_apoyo_para_la?: string;
  gesti_n_de_la_informaci_n?: string;
  monitoreo_y_evaluaci_n_m?: string;
  gesti_n_de_aprendizajes_para?: string;
  relaci_n_con_otros?: string;
  el_instrumento_considera?: string;
  barreras_que_afecten_el?: string;
}

type TabType = "scraping" | "registro";

export default function AdminEntidadesPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("registro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [scrapingYear, setScrapingYear] = useState<string>("");
  const [scrapedData, setScrapedData] = useState<ScrapedArticulador[]>([]);
  const [scrapingLoading, setLoadingScrape] = useState(false); // Renombrado para evitar conflicto con loading general
  const [scrapingError, setScrapingError] = useState<string>("");

  const [logoLoading, setLogoLoading] = useState(false);
  const [tipoEntidad, setTipoEntidad] = useState<"empresa" | "articulador">(
    "empresa"
  );
  const [formData, setFormData] = useState<CreateEmpresaRequest>({
    name: "",
    url: "",
    logoUrl: "",
    sector: "",
    department: "",
    description: "",
  });

  const [manualArticuladorData, setManualArticuladorData] =
    useState<CreateArticuladorRequest>({
      nombre: "",
      tipo: "",
      region: "",
      contacto: "",
      Ciudad: undefined,
      Departamento: undefined,
      Latitud: undefined,
      Longitud: undefined,
      Anio: undefined,
      Codigo: undefined,
      Sector: undefined,
      Entidad: undefined,
      InstrumentosOfertados: undefined,
      AntiguedadOferta: undefined,
      Pagina: undefined,
      Descripcion: undefined,
      UsuariosEmprendedores: undefined,
      UsuariosMiPymes: undefined,
      UsuariosGrandesEmpresas: undefined,
      UsuariosAcademia: undefined,
      UsuariosEntidadesGobierno: undefined,
      UsuariosOrganizacionesSoporte: undefined,
      UsuariosPersonasNaturales: undefined,
      ApoyoFinanciero: undefined,
      AsistenciaTecnica: undefined,
      FormacionTalentoHumano: undefined,
      IncentivosTributarios: undefined,
      Eventos: undefined,
      CompraPublica: undefined,
      RedesColaboracion: undefined,
      BonosBouchers: undefined,
      SistemasInformacion: undefined,
      PremiosReconocimientos: undefined,
      InstrumentosRegulatorios: undefined,
      FechaApertura: undefined,
      FechaCierre: undefined,
      Cobertura: undefined,
      DepartamentosMunicipios: undefined,
      ObjetivoFormacionCapitalHumano: undefined,
      PorcentajeFormacionCapitalHumano: undefined,
      ObjetivoComercioElectronico: undefined,
      PorcentajeComercioElectronico: undefined,
      ObjetivoInnovacion: undefined,
      PorcentajeInnovacion: undefined,
      ObjetivoEmprendimiento: undefined,
      PorcentajeEmprendimiento: undefined,
      ObjetivoTransferenciaConocimientoTecnologia: undefined,
      PorcentajeTransferenciaConocimientoTecnologia: undefined,
      ObjetivoInvestigacion: undefined,
      PorcentajeInvestigacion: undefined,
      ObjetivoCalidad: undefined,
      PorcentajeCalidad: undefined,
      ObjetivoClusterEncadenamientos: undefined,
      PorcentajeClusterEncadenamientos: undefined,
      ObjetivoFinanciacion: undefined,
      PorcentajeFinanciacion: undefined,
      ObjetivoComercializacion: undefined,
      PorcentajeComercializacion: undefined,
      ObjetivoFormalizacion: undefined,
      PorcentajeFormalizacion: undefined,
      ObjetivoCrecimientoSostenible: undefined,
      PorcentajeCrecimientoSostenible: undefined,
      ObjetivoInclusionFinanciera: undefined,
      PorcentajeInclusionFinanciera: undefined,
      RecursosPGN: undefined,
      RecursosCooperacion: undefined,
      RecursosSGR: undefined,
      RecursosEsfuerzoFiscal: undefined,
      RecursosParafiscales: undefined,
      RecursosOtros: undefined,
      RecursosPrivado: undefined,
      DisenadoPorLeyOJuez: undefined,
      DisenadoPorPolitica: undefined,
      DescritoDocumentoInterno: undefined,
      OrigenInstrumento: undefined,
      SolucionaFallaMercadoGobiernoArticulacion: undefined,
      ExistenAlternativasInstrumento: undefined,
      ObjetivosFormulacionInstrumento: undefined,
      TieneMarcoLogico: undefined,
      InsumosFormulacionImplementacion: undefined,
      ActividadesFormulacionImplementacion: undefined,
      ProductosGeneradosInstrumento: undefined,
      ResultadosImpactosEsperados: undefined,
      PoblacionObjetivo: undefined,
      CriteriosFocalizacionBeneficiarios: undefined,
      AdaptaDiferenciasTerritorios: undefined,
      SeleccionBeneficiarios: undefined,
      AccesoBeneficiarios: undefined,
      TrazabilidadBeneficiarios: undefined,
      DisponibilidadRecursos: undefined,
      GestionOrganizativa: undefined,
      PersonalApoyoFormulacionImplementacion: undefined,
      GestionInformacionInstrumento: undefined,
      MonitoreoEvaluacionInstrumento: undefined,
      GestionAprendizajesInstrumento: undefined,
      RelacionConOtrosInstrumentos: undefined,
      ConsideraCoordinacionOtrasEntidades: undefined,
      BarrerasFuncionamientoInstrumento: undefined,
    });

  // Helper para truncar cadenas de forma segura
  const truncateString = (
    str: string | undefined,
    maxLength: number
  ): string | undefined => {
    if (str === undefined || str === null) return undefined;
    const s = String(str);
    return s.length > maxLength ? s.substring(0, maxLength) : s;
  };

  // Helper para mapear "Si"/"No" a string (para C# string?)
  const mapSiNoToString = (value: string | undefined): string | undefined => {
    if (value === undefined || value === null) return undefined;
    const lowerValue = value.toLowerCase();
    if (lowerValue === "si") return "Si";
    if (lowerValue === "no") return "No";
    return undefined;
  };

  const crearArticulador = async (
    articuladorData: CreateArticuladorRequest
  ) => {
    if (!articuladorData.nombre || articuladorData.nombre.trim() === "") {
      setError("El nombre es requerido");
      return;
    }

    setLoading(true); // Usa el loading general para esta operación de guardado
    try {
      const resultado = await ArticuladorService.create(articuladorData);
      if (resultado.success) {
        setSuccess("Articulador creado exitosamente");
        setManualArticuladorData({
          ...manualArticuladorData,
          nombre: "",
          tipo: "",
          region: "",
          contacto: "",
          Ciudad: undefined,
          Departamento: undefined,
          Descripcion: undefined,
        });
        router.push(`/mapa?lastUpdate=${Date.now()}`);
      } else {
        console.error("Error detallado al crear articulador:", resultado);
        setError(
          resultado.message ||
            resultado.details ||
            "Error creando articulador (ver consola para detalles)"
        );
      }
    } catch (err) {
      console.error("Error de red/conexión al crear articulador:", err);
      setError("Error de red o conexión al intentar crear el articulador");
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    setLoadingScrape(true); // Usa el loading específico de scrape
    setScrapingError("");
    setScrapedData([]);
    limpiarMensajes();
    try {
      const response = await fetch(`/api/scrape/arco?year=${scrapingYear}`);
      const result = response.ok
        ? await response.json()
        : { success: false, message: `HTTP error! Status: ${response.status}` };

      if (result.success) {
        if (result.data && result.data.length > 0) {
          setScrapedData(result.data);
          setScrapingError("");
        } else {
          setScrapingError(
            `No se encontraron datos para el año ${scrapingYear}.`
          );
          setScrapedData([]);
        }
      } else {
        setScrapingError(
          result.message || result.details || "Error en el scraping"
        );
      }
    } catch (err) {
      console.error("Error en handleScrape:", err);
      setScrapingError("Error de red o en el servidor al realizar el scrapeo.");
    } finally {
      setLoadingScrape(false);
    }
  };

  const handleSelectScrapedArticuladorForRegistration = (
    scrapedItem: ScrapedArticulador
  ) => {
    limpiarMensajes();
    const prefilledArticulador: CreateArticuladorRequest = {
      nombre:
        truncateString(scrapedItem.instrumentos_ofertados, 190) ||
        "Sin Nombre de Instrumento",
      tipo: "N/A", // Default "N/A" as this field does not appear in ScrapedArticulador from API
      region: truncateString(scrapedItem.cobertura, 90) || "N/A",
      contacto:
        truncateString(scrapedItem.contacto, 400) ||
        truncateString(scrapedItem.p_gina, 400) ||
        "N/A",

      Anio: scrapedItem.a_o ? parseInt(scrapedItem.a_o, 10) : undefined,
      Codigo: truncateString(scrapedItem.c_digo, 90) || "N/A",
      Sector: truncateString(scrapedItem.sector, 90) || "N/A",
      Entidad: truncateString(scrapedItem.entidad, 190) || "N/A",
      InstrumentosOfertados: scrapedItem.instrumentos_ofertados || "N/A",
      AntiguedadOferta: scrapedItem.antig_edad_oferta
        ? parseInt(scrapedItem.antig_edad_oferta, 10)
        : undefined,
      Pagina: truncateString(scrapedItem.p_gina, 190) || "N/A",
      Descripcion: scrapedItem.descripci_n || "N/A",

      UsuariosEmprendedores: mapSiNoToString(
        scrapedItem.usuarios_emprendedores
      ),
      UsuariosMiPymes: mapSiNoToString(scrapedItem.usuarios_mipymes),
      UsuariosGrandesEmpresas: mapSiNoToString(
        scrapedItem.usuarios_grandes_empresas
      ),
      UsuariosAcademia: mapSiNoToString(scrapedItem.usuarios_academia),
      UsuariosEntidadesGobierno: mapSiNoToString(
        scrapedItem.usuarios_entidades_gobierno
      ),
      UsuariosOrganizacionesSoporte: mapSiNoToString(
        scrapedItem.usuarios_organizaciones_de
      ),
      UsuariosPersonasNaturales: mapSiNoToString(
        scrapedItem.usuarios_personas_naturales
      ),

      ApoyoFinanciero:
        (scrapedItem.tipo_de_apoyo_apoyo_financiero || "").toLowerCase() ===
        "si",
      AsistenciaTecnica:
        (scrapedItem.tipo_de_apoyo_asistencia || "").toLowerCase() === "si",
      FormacionTalentoHumano:
        (scrapedItem.tipo_de_apoyo_formaci_n_de || "").toLowerCase() === "si",
      IncentivosTributarios:
        (scrapedItem.tipo_de_apoyo_incentivos || "").toLowerCase() === "si",
      Eventos: (scrapedItem.tipo_de_apoyo_eventos || "").toLowerCase() === "si",
      CompraPublica:
        (scrapedItem.tipo_de_apoyo_compra_p_blica || "").toLowerCase() === "si",
      RedesColaboracion:
        (scrapedItem.tipo_de_apoyo_redes_de || "").toLowerCase() === "si",
      BonosBouchers:
        (scrapedItem.tipo_de_apoyo_bonos_y_bouchers || "").toLowerCase() ===
        "si",
      SistemasInformacion:
        (scrapedItem.tipo_de_apoyo_sistemas_de || "").toLowerCase() === "si",
      PremiosReconocimientos:
        (scrapedItem.tipo_de_apoyo_premios_y || "").toLowerCase() === "si",
      InstrumentosRegulatorios:
        (scrapedItem.tipo_de_apoyo_instrumentos || "").toLowerCase() === "si",

      FechaApertura:
        scrapedItem.fecha_apertura && scrapedItem.fecha_apertura !== "N/A"
          ? (() => {
              const date = new Date(scrapedItem.fecha_apertura);
              return isNaN(date.getTime()) ? undefined : date;
            })()
          : undefined,
      FechaCierre:
        scrapedItem.fecha_cierre && scrapedItem.fecha_cierre !== "N/A"
          ? (() => {
              const date = new Date(scrapedItem.fecha_cierre);
              return isNaN(date.getTime()) ? undefined : date;
            })()
          : undefined,

      Cobertura: truncateString(scrapedItem.cobertura, 400) || "N/A",
      DepartamentosMunicipios:
        truncateString(scrapedItem.departamentos_y_municipios, 400) || "N/A",

      Ciudad: undefined,
      Departamento: undefined,
      Latitud: undefined,
      Longitud: undefined,

      ObjetivoFormacionCapitalHumano:
        scrapedItem.objetivo_formaci_n_del_capital || undefined,
      PorcentajeFormacionCapitalHumano:
        scrapedItem.objetivo_dedicaci_n_a_formaci
          ? parseFloat(scrapedItem.objetivo_dedicaci_n_a_formaci)
          : undefined,
      ObjetivoComercioElectronico:
        scrapedItem.objetivo_comercio_electronico || undefined,
      PorcentajeComercioElectronico: scrapedItem.objetivo_dedicaci_n_a_comercio
        ? parseFloat(scrapedItem.objetivo_dedicaci_n_a_comercio)
        : undefined,
      ObjetivoInnovacion: scrapedItem.objetivo_innovaci_n || undefined,
      PorcentajeInnovacion: scrapedItem.objetivo_de_dedicaci_n_a
        ? parseFloat(scrapedItem.objetivo_de_dedicaci_n_a)
        : undefined,
      ObjetivoEmprendimiento: scrapedItem.objetivo_emprendimiento || undefined,
      PorcentajeEmprendimiento: scrapedItem.objetivo_de_dedicaci_n_a_1
        ? parseFloat(scrapedItem.objetivo_de_dedicaci_n_a_1)
        : undefined,
      ObjetivoTransferenciaConocimientoTecnologia:
        scrapedItem.objetivo_transferencia_de || undefined,
      PorcentajeTransferenciaConocimientoTecnologia:
        scrapedItem.objetivo_de_dedicacion_a
          ? parseFloat(scrapedItem.objetivo_de_dedicacion_a)
          : undefined,
      ObjetivoInvestigacion: scrapedItem.objetivo_investigaci_n || undefined,
      PorcentajeInvestigacion: scrapedItem.objetivo_de_dedicaci_n_a_2
        ? parseFloat(scrapedItem.objetivo_de_dedicaci_n_a_2)
        : undefined,
      ObjetivoCalidad: scrapedItem.objetivo_calidad || undefined,
      PorcentajeCalidad: scrapedItem.objetivo_de_dedicaci_n_a_3
        ? parseFloat(scrapedItem.objetivo_de_dedicaci_n_a_3)
        : undefined,
      ObjetivoClusterEncadenamientos:
        scrapedItem.objetivos_cl_ster_o || undefined,
      PorcentajeClusterEncadenamientos: scrapedItem.objetivo_de_dedicaci_n_a_4
        ? parseFloat(scrapedItem.objetivo_de_dedicaci_n_a_4)
        : undefined,
      ObjetivoFinanciacion: scrapedItem.objetivo_financiaci_n || undefined,
      PorcentajeFinanciacion: scrapedItem.objetivo_de_dedicaci_n_a_5
        ? parseFloat(scrapedItem.objetivo_de_dedicaci_n_a_5)
        : undefined,
      ObjetivoComercializacion:
        scrapedItem.objetivo_comercializaci_n || undefined,
      PorcentajeComercializacion: scrapedItem.objetivo_de_dedicaci_n_a_6
        ? parseFloat(scrapedItem.objetivo_de_dedicaci_n_a_6)
        : undefined,
      ObjetivoFormalizacion: scrapedItem.objetivo_formalizaci_n || undefined,
      PorcentajeFormalizacion: scrapedItem.objetivo_de_dedicaci_n_a_7
        ? parseFloat(scrapedItem.objetivo_de_dedicaci_n_a_7)
        : undefined,
      ObjetivoCrecimientoSostenible:
        scrapedItem.objetivo_crecimiento || undefined,
      PorcentajeCrecimientoSostenible: scrapedItem.objetivo_de_dedicaci_n_a_8
        ? parseFloat(scrapedItem.objetivo_de_dedicaci_n_a_8)
        : undefined,
      ObjetivoInclusionFinanciera:
        scrapedItem.objetivo_inclusi_n_financiera || undefined,
      PorcentajeInclusionFinanciera: scrapedItem.objetivo_de_dedicaci_n_a_9
        ? parseFloat(scrapedItem.objetivo_de_dedicaci_n_a_9)
        : undefined,
      RecursosPGN: scrapedItem.recursos_pgn
        ? parseFloat(scrapedItem.recursos_pgn)
        : undefined,
      RecursosCooperacion: scrapedItem.recursos_cooperaci_n
        ? parseFloat(scrapedItem.recursos_cooperaci_n)
        : undefined,
      RecursosSGR: scrapedItem.recursos_sgr
        ? parseFloat(scrapedItem.recursos_sgr)
        : undefined,
      RecursosEsfuerzoFiscal: scrapedItem.recursos_esfuerzo_fiscal
        ? parseFloat(scrapedItem.recursos_esfuerzo_fiscal)
        : undefined,
      RecursosParafiscales: scrapedItem.recursos_parafiscales
        ? parseFloat(scrapedItem.recursos_parafiscales)
        : undefined,
      RecursosOtros: scrapedItem.recursos_otros
        ? parseFloat(scrapedItem.recursos_otros)
        : undefined,
      RecursosPrivado: scrapedItem.recursos_privado
        ? parseFloat(scrapedItem.recursos_privado)
        : undefined,
      DisenadoPorLeyOJuez:
        (scrapedItem.el_instrumento_se_dise_a || "").toLowerCase() === "si",
      DisenadoPorPolitica:
        (scrapedItem.el_instrumento_se_dise_a_1 || "").toLowerCase() === "si",
      DescritoDocumentoInterno:
        (scrapedItem.el_instrumento_est_descrito || "").toLowerCase() === "si",
      OrigenInstrumento: scrapedItem.origen_del_instrumento || undefined,
      SolucionaFallaMercadoGobiernoArticulacion:
        (scrapedItem.el_instrumento_soluciona || "").toLowerCase() === "si",
      ExistenAlternativasInstrumento:
        (scrapedItem.existen_otras_alternativas || "").toLowerCase() === "si",
      ObjetivosFormulacionInstrumento:
        scrapedItem.objetivos_que_orientan_la || undefined,
      TieneMarcoLogico:
        (scrapedItem.el_instrumento_tiene_marco || "").toLowerCase() === "si",
      InsumosFormulacionImplementacion:
        scrapedItem.insumos_necesarios_para_la || undefined,
      ActividadesFormulacionImplementacion:
        scrapedItem.actividades_que_se_deben || undefined,
      ProductosGeneradosInstrumento:
        scrapedItem.principales_productos || undefined,
      ResultadosImpactosEsperados:
        scrapedItem.resultados_e_impactos || undefined,
      PoblacionObjetivo: scrapedItem.poblaci_n_objetivo_del || undefined,
      CriteriosFocalizacionBeneficiarios:
        scrapedItem.criterios_de_focalizaci_n || undefined,
      AdaptaDiferenciasTerritorios:
        (scrapedItem.el_instrumento_contempla || "").toLowerCase() === "si",
      SeleccionBeneficiarios:
        scrapedItem.selecci_n_de_los_beneficiarios || undefined,
      AccesoBeneficiarios: scrapedItem.acceso_de_los_potenciales || undefined,
      TrazabilidadBeneficiarios:
        (scrapedItem.se_tiene_trazabilidad_de || "").toLowerCase() === "si",
      DisponibilidadRecursos:
        (scrapedItem.disponibilidad_de_recursos || "").toLowerCase() === "si",
      GestionOrganizativa: scrapedItem.gesti_n_organizativa_del || undefined,
      PersonalApoyoFormulacionImplementacion:
        scrapedItem.personal_de_apoyo_para_la || undefined,
      GestionInformacionInstrumento:
        scrapedItem.gesti_n_de_la_informaci_n || undefined,
      MonitoreoEvaluacionInstrumento:
        scrapedItem.monitoreo_y_evaluaci_n_m || undefined,
      GestionAprendizajesInstrumento:
        scrapedItem.gesti_n_de_aprendizajes_para || undefined,
      RelacionConOtrosInstrumentos: scrapedItem.relaci_n_con_otros || undefined,
      ConsideraCoordinacionOtrasEntidades:
        (scrapedItem.el_instrumento_considera || "").toLowerCase() === "si",
      BarrerasFuncionamientoInstrumento:
        scrapedItem.barreras_que_afecten_el || undefined,
    };

    setManualArticuladorData(prefilledArticulador);
    setTipoEntidad("articulador");
    setActiveTab("registro");
  };

  const limpiarMensajes = () => {
    setError("");
    setSuccess("");
    setScrapingError("");
  };

  const extractLogoFromUrl = async (url: string) => {
    if (!url) return;

    try {
      setLogoLoading(true);
      let formattedUrl = url;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        formattedUrl = `https://${url}`;
      }
      const domain = new URL(formattedUrl).hostname;
      const logoOptions = [
        `https://logo.clearbit.com/${domain}`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        `${formattedUrl}/favicon.ico`,
        `${formattedUrl}/assets/logo.png`,
        `${formattedUrl}/images/logo.png`,
      ];

      for (const logoUrl of logoOptions) {
        try {
          const response = await fetch(logoUrl, { method: "HEAD" });
          if (response.ok) {
            setFormData((prev) => ({ ...prev, logoUrl }));
            break;
          }
        } catch {
          continue;
        }
      }
    } catch (error) {
      console.error("Error extrayendo logo:", error);
    } finally {
      setLogoLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    limpiarMensajes();

    if (tipoEntidad === "empresa") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      let parsedValue: string | number | boolean | Date | undefined = value;

      if (
        [
          "Anio",
          "AntiguedadOferta",
          "PorcentajeFormacionCapitalHumano",
          "PorcentajeComercioElectronico",
          "PorcentajeInnovacion",
          "PorcentajeEmprendimiento",
          "PorcentajeTransferenciaConocimientoTecnologia",
          "PorcentajeInvestigacion",
          "PorcentajeCalidad",
          "PorcentajeClusterEncadenamientos",
          "PorcentajeFinanciacion",
          "PorcentajeComercializacion",
          "PorcentajeFormalizacion",
          "PorcentajeCrecimientoSostenible",
          "PorcentajeInclusionFinanciera",
          "RecursosPGN",
          "RecursosCooperacion",
          "RecursosSGR",
          "RecursosEsfuerzoFiscal",
          "RecursosParafiscales",
          "RecursosOtros",
          "RecursosPrivado",
        ].includes(name)
      ) {
        parsedValue = value === "" ? undefined : parseFloat(value);
      } else if (
        [
          "ApoyoFinanciero",
          "AsistenciaTecnica",
          "FormacionTalentoHumano",
          "IncentivosTributarios",
          "Eventos",
          "CompraPublica",
          "RedesColaboracion",
          "BonosBouchers",
          "SistemasInformacion",
          "PremiosReconocimientos",
          "InstrumentosRegulatorios",
          "DisenadoPorLeyOJuez",
          "DisenadoPorPolitica",
          "DescritoDocumentoInterno",
          "SolucionaFallaMercadoGobiernoArticulacion",
          "ExistenAlternativasInstrumento",
          "TieneMarcoLogico",
          "AdaptaDiferenciasTerritorios",
          "TrazabilidadBeneficiarios",
          "DisponibilidadRecursos",
          "ConsideraCoordinacionOtrasEntidades",
        ].includes(name)
      ) {
        parsedValue = value === "true";
      } else if (["FechaApertura", "FechaCierre"].includes(name)) {
        parsedValue = value ? new Date(value) : undefined;
      } else if (name === "Latitud" || name === "Longitud") {
        parsedValue = value === "" ? undefined : parseFloat(value);
      }

      setManualArticuladorData((prev) => ({
        ...prev,
        [name]: parsedValue,
      }));
    }
  };

  useEffect(() => {
    if (tipoEntidad === "empresa" && formData.url && formData.url.trim()) {
      const timeoutId = setTimeout(() => {
        extractLogoFromUrl(formData.url.trim());
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [formData.url, tipoEntidad]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (tipoEntidad === "empresa") {
      try {
        // Normalizar el departamento antes de enviar
        const departamentoNormalizado = formData.department
          ? formData.department
              .toLowerCase()
              .normalize("NFD")
              .replace(/\u0300-\u036f/g, "")
              .replace(/\s+/g, " ")
              .trim()
          : "";
        const payload = {
          ...formData,
          department: departamentoNormalizado,
          departamento: departamentoNormalizado,
        };
        console.log("Payload a enviar:", payload); // DEBUG
        const result = await EmpresaService.crearEmpresa(payload);
        if (result.success) {
          setSuccess("Empresa registrada exitosamente.");
          router.push(`/mapa?lastUpdate=${Date.now()}`);
        } else {
          console.error("Error del servidor:", result.message);
          alert(
            `Error al registrar empresa: ${
              result.message || "Error desconocido"
            }`
          );
        }
      } catch (err) {
        console.error("Error al registrar empresa:", err);
        setError("Error de red o en el servidor al registrar la empresa.");
      } finally {
        setLoading(false);
      }
    } else {
      await crearArticulador(manualArticuladorData);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-8 h-8 mr-3 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 00-1-1h-4a1 1 00-1 1v3M4 7h16"
                />
              </svg>
              Panel de Administración
            </h1>
            <p className="text-gray-600">
              Administra articuladores del ecosistema INTEIA
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => {
                    setActiveTab("registro");
                    limpiarMensajes();
                  }}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === "registro"
                      ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  📝 Registrar Entidad
                </button>
                <button
                  onClick={() => {
                    setActiveTab("scraping");
                    limpiarMensajes();
                  }}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === "scraping"
                      ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  🔍 Scraping de Articuladores (ArCo)
                </button>
              </nav>
            </div>

            <div className="p-8">
              {/* Mensajes de error/éxito */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              {/* Contenido de las pestañas */}
              {activeTab === "registro" && (
                <div className="max-w-4xl mx-auto p-6">
                  {/* Header Section */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                      Registrar Nueva Entidad
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Añade tu{" "}
                      {tipoEntidad === "empresa"
                        ? "empresa"
                        : "perfil como articulador"}{" "}
                      al ecosistema de innovación colombiano
                    </p>
                  </div>

                  {/* Form Container */}
                  <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl rounded-3xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Selector de tipo de entidad */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          ¿Qué quieres registrar? *
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setTipoEntidad("empresa")}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                              tipoEntidad === "empresa"
                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                : "border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-25"
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <svg
                                className="w-8 h-8 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                              <span className="font-semibold">Empresa</span>
                              <span className="text-xs mt-1 opacity-75">
                                Organización o startup
                              </span>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTipoEntidad("articulador")}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                              tipoEntidad === "articulador"
                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                : "border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-25"
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <svg
                                className="w-8 h-8 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              <span className="font-semibold">Articulador</span>
                              <span className="text-xs mt-1 opacity-75">
                                Facilitador del ecosistema
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {tipoEntidad === "empresa" ? (
                        // Formulario para Empresas
                        <>
                          {/* Campos de empresa */}
                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nombre de la empresa *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                  className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                              </div>
                              <input
                                name="name"
                                type="text"
                                placeholder="Ejemplo: Innovación Tech SAS"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                              />
                            </div>
                          </div>
                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              URL del sitio web *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                  className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </div>
                              <input
                                name="url"
                                type="url"
                                placeholder="https://www.empresa.com"
                                value={formData.url}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                              />
                            </div>
                          </div>
                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              URL del logo (opcional)
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                {logoLoading ? (
                                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <svg
                                    className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                )}
                              </div>
                              <input
                                name="logoUrl"
                                type="url"
                                placeholder={
                                  logoLoading
                                    ? "Extrayendo logo automáticamente..."
                                    : "https://www.empresa.com/logo.png"
                                }
                                value={formData.logoUrl}
                                onChange={handleChange}
                                className="w-full pl-10 pr-32 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                              />
                              <button
                                type="button"
                                onClick={() => extractLogoFromUrl(formData.url)}
                                disabled={!formData.url || logoLoading}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-600 hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                title="Extraer logo automáticamente"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                  />
                                </svg>
                              </button>
                            </div>
                            {formData.logoUrl && (
                              <div className="mt-3 flex items-center space-x-3">
                                <span className="text-sm text-gray-600">
                                  Vista previa:
                                </span>
                                <Image
                                  src={formData.logoUrl}
                                  alt="Logo preview"
                                  width={32}
                                  height={32}
                                  className="object-contain rounded border border-gray-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              💡 El logo se extraerá automáticamente cuando
                              ingreses la URL de la empresa
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Sector *
                            </label>
                            <select
                              name="sector"
                              value={formData.sector}
                              onChange={handleChange}
                              required
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                            >
                              <option value="">Selecciona un sector</option>
                              <option value="Tecnología">Tecnología</option>
                              <option value="Educación">Educación</option>
                              <option value="Salud">Salud</option>
                              <option value="Energía">Energía</option>
                              <option value="Fintech">Fintech</option>
                              <option value="Agroindustria">
                                Agroindustria
                              </option>
                              <option value="Manufactura">Manufactura</option>
                              <option value="Servicios">Servicios</option>
                              <option value="Otros">Otros</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Departamento *
                            </label>
                            <select
                              name="department"
                              value={formData.department}
                              onChange={handleChange}
                              required
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                            >
                              <option value="">
                                Selecciona un departamento
                              </option>
                              <option value="amazonas">Amazonas</option>
                              <option value="antioquia">Antioquia</option>
                              <option value="arauca">Arauca</option>
                              <option value="atlantico">Atlántico</option>
                              <option value="bolivar">Bolívar</option>
                              <option value="boyaca">Boyacá</option>
                              <option value="caldas">Caldas</option>
                              <option value="caqueta">Caquetá</option>
                              <option value="casanare">Casanare</option>
                              <option value="cauca">Cauca</option>
                              <option value="cesar">Cesar</option>
                              <option value="choco">Chocó</option>
                              <option value="cordoba">Córdoba</option>
                              <option value="cundinamarca">Cundinamarca</option>
                              <option value="guainia">Guainía</option>
                              <option value="guaviare">Guaviare</option>
                              <option value="huila">Huila</option>
                              <option value="la guajira">La Guajira</option>
                              <option value="magdalena">Magdalena</option>
                              <option value="meta">Meta</option>
                              <option value="nariño">Nariño</option>
                              <option value="norte de santander">
                                Norte de Santander
                              </option>
                              <option value="putumayo">Putumayo</option>
                              <option value="quindio">Quindío</option>
                              <option value="risaralda">Risaralda</option>
                              <option value="san andres y providencia">
                                San Andrés y Providencia
                              </option>
                              <option value="santander">Santander</option>
                              <option value="sucre">Sucre</option>
                              <option value="tolima">Tolima</option>
                              <option value="valle del cauca">
                                Valle del Cauca
                              </option>
                              <option value="vaupes">Vaupés</option>
                              <option value="vichada">Vichada</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Descripción de la empresa *
                            </label>
                            <textarea
                              name="description"
                              rows={4}
                              placeholder="Describe brevemente los productos o servicios de tu empresa..."
                              value={formData.description}
                              onChange={handleChange}
                              required
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-500 resize-none"
                            />
                          </div>
                        </>
                      ) : (
                        // Formulario para Articuladores
                        <>
                          {/* Campos de articulador (manualArticuladorData) */}
                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nombre completo *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                  className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </div>
                              <input
                                name="nombre"
                                type="text"
                                placeholder="Ejemplo: Juan Carlos Pérez"
                                value={manualArticuladorData.nombre}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tipo de articulador *
                            </label>
                            <select
                              name="tipo"
                              value={manualArticuladorData.tipo}
                              onChange={handleChange}
                              required
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                            >
                              <option value="">Selecciona un tipo</option>
                              <option value="consultor">Consultor</option>
                              <option value="mentor">Mentor</option>
                              <option value="inversionista">
                                Inversionista
                              </option>
                              <option value="acelerador">Acelerador</option>
                              <option value="academia">Academia</option>
                              <option value="gobierno">Gobierno</option>
                              <option value="corporativo">Corporativo</option>
                              <option value="hub/centro de innovacion">
                                Hub/Centro de innovacion
                              </option>
                              <option value="otros">Otros</option>
                            </select>
                          </div>

                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Ciudad *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                  className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                              </div>
                              <input
                                name="Ciudad"
                                type="text"
                                placeholder="Ejemplo: Medellín"
                                value={manualArticuladorData.Ciudad || ""}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Departamento *
                            </label>
                            <select
                              name="Departamento"
                              value={manualArticuladorData.Departamento || ""}
                              onChange={handleChange}
                              required
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                            >
                              <option value="">
                                Selecciona un departamento
                              </option>
                              <option value="amazonas">Amazonas</option>
                              <option value="antioquia">Antioquia</option>
                              <option value="arauca">Arauca</option>
                              <option value="atlantico">Atlántico</option>
                              <option value="bolivar">Bolívar</option>
                              <option value="boyaca">Boyacá</option>
                              <option value="caldas">Caldas</option>
                              <option value="caqueta">Caquetá</option>
                              <option value="casanare">Casanare</option>
                              <option value="cauca">Cauca</option>
                              <option value="cesar">Cesar</option>
                              <option value="choco">Chocó</option>
                              <option value="cordoba">Córdoba</option>
                              <option value="cundinamarca">Cundinamarca</option>
                              <option value="guainia">Guainía</option>
                              <option value="guaviare">Guaviare</option>
                              <option value="huila">Huila</option>
                              <option value="la guajira">La Guajira</option>
                              <option value="magdalena">Magdalena</option>
                              <option value="meta">Meta</option>
                              <option value="nariño">Nariño</option>
                              <option value="norte de santander">
                                Norte de Santander
                              </option>
                              <option value="putumayo">Putumayo</option>
                              <option value="quindio">Quindío</option>
                              <option value="risaralda">Risaralda</option>
                              <option value="san andres y providencia">
                                San Andrés y Providencia
                              </option>
                              <option value="santander">Santander</option>
                              <option value="sucre">Sucre</option>
                              <option value="tolima">Tolima</option>
                              <option value="valle del cauca">
                                Valle del Cauca
                              </option>
                              <option value="vaupes">Vaupés</option>
                              <option value="vichada">Vichada</option>
                            </select>
                          </div>

                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Información de contacto
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                  className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                  />
                                </svg>
                              </div>
                              <input
                                name="contacto"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={manualArticuladorData.contacto}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900 placeholder-gray-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Descripción y servicios *
                            </label>
                            <textarea
                              name="Descripcion"
                              rows={4}
                              placeholder="Describe los servicios que ofreces como articulador del ecosistema de innovación..."
                              value={manualArticuladorData.Descripcion || ""}
                              onChange={handleChange}
                              required
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-500 resize-none"
                            />
                          </div>
                        </>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="group w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 font-semibold text-lg"
                      >
                        <div className="flex items-center justify-center">
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                              Registrando {tipoEntidad}...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-6 h-6 mr-2 group-hover:animate-pulse"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                              Registrar{" "}
                              {tipoEntidad === "empresa"
                                ? "Empresa"
                                : "Articulador"}
                            </>
                          )}
                        </div>
                      </button>
                    </form>
                  </div>
                </div>
              )}
              {activeTab === "scraping" && (
                <div className="space-y-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Scraping de Articuladores (ArCo)
                    </h3>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        value={scrapingYear}
                        onChange={(e) => setScrapingYear(e.target.value)}
                        placeholder="Año"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                      />
                      <button
                        onClick={handleScrape}
                        disabled={scrapingLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                      >
                        {scrapingLoading ? "Buscando..." : "Buscar"}
                      </button>
                    </div>
                  </div>

                  {scrapingError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-700 text-sm">{scrapingError}</p>
                    </div>
                  )}

                  {scrapedData.length > 0 && (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {scrapedData.map((item, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-gray-800 mb-2">
                                {item.instrumentos_ofertados ||
                                  "Sin Nombre de Instrumento"}
                              </h4>
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold">Entidad:</span>{" "}
                                {item.entidad || "N/A"}
                              </p>
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold">Tipo:</span>{" "}
                                {"N/A"}{" "}
                                {/* Este campo no viene de la API, se muestra N/A */}
                              </p>
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold">
                                  Cobertura:
                                </span>{" "}
                                {item.cobertura || "N/A"}
                              </p>
                              {item.p_gina && (
                                <p className="text-sm text-blue-600 hover:underline mt-1">
                                  <a
                                    href={item.p_gina}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Ver Instrumento
                                  </a>
                                </p>
                              )}
                            </div>
                            <div className="ml-4">
                              <button
                                onClick={() =>
                                  handleSelectScrapedArticuladorForRegistration(
                                    item
                                  )
                                }
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                                title="Pre-llenar formulario de registro"
                              >
                                Pre-llenar y Guardar
                              </button>
                            </div>
                          </div>

                          <details className="mt-4 border-t border-gray-100 pt-4">
                            <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors duration-200">
                              Ver más detalles
                            </summary>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm text-gray-600">
                              <p>
                                <span className="font-semibold">
                                  Año de Corte:
                                </span>{" "}
                                {item.a_o || "N/A"}
                              </p>
                              <p>
                                <span className="font-semibold">Código:</span>{" "}
                                {item.c_digo || "N/A"}
                              </p>
                              <p>
                                <span className="font-semibold">Sector:</span>{" "}
                                {item.sector || "N/A"}
                              </p>
                              <p>
                                <span className="font-semibold">
                                  Instrumentos Ofertados:
                                </span>{" "}
                                {item.instrumentos_ofertados || "N/A"}
                              </p>
                              <p>
                                <span className="font-semibold">
                                  Antigüedad de la Oferta:
                                </span>{" "}
                                {item.antig_edad_oferta || "N/A"}
                              </p>
                              <p>
                                <span className="font-semibold">
                                  Fecha de Apertura:
                                </span>{" "}
                                {item.fecha_apertura || "N/A"}
                              </p>
                              <p>
                                <span className="font-semibold">
                                  Fecha de Cierre:
                                </span>{" "}
                                {item.fecha_cierre || "N/A"}
                              </p>
                              <p>
                                <span className="font-semibold">
                                  Dptos/Mpios Beneficiados:
                                </span>{" "}
                                {item.departamentos_y_municipios || "N/A"}
                              </p>
                              {item.descripci_n && (
                                <div className="col-span-full mt-2">
                                  <p className="font-semibold mb-1">
                                    Descripción:
                                  </p>
                                  <p className="whitespace-pre-wrap">
                                    {item.descripci_n}
                                  </p>
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
