/**
 * Ensambla el modelo del informe: todo lo que se decide de forma determinista.
 *
 * Aquí se cierra qué va a decir el informe. Lo único que queda fuera es **cómo**
 * se dice, que es lo que se le pide a Claude — y se le pide sobre este modelo, no
 * sobre las respuestas.
 */

import type { Scores } from "./scoring.ts";
import type { BandResult, Interpretation, Rule, RuleMatch } from "./interpretation.ts";

export interface Labels {
  domains: Record<string, string>;
  facets: Record<string, string>;
  /** Facetas y dominios cuyo nombre visible difiere del técnico, para la leyenda. */
  renombradas: Record<string, string>;
  /** Nombre visible de cada banda. Las claves son los ids del motor (baja…alta). */
  bandas: Record<string, string>;
  /** El aviso de contra qué se compara, según el método de bandas. */
  avisoComparacion: { escala: string; baremo: string };
}

export interface DomainConfig {
  id: string;
  facets: string[];
  items: number[];
}

export interface FacetView {
  id: string;
  label: string;
  /** Nombre técnico, solo si difiere del visible. */
  technicalLabel?: string;
  score: number;
  band: BandResult["band"];
}

export interface DomainView {
  id: string;
  label: string;
  technicalLabel?: string;
  score: number;
  band: BandResult["band"];
  percentile?: number;
  facets: FacetView[];
  /** Faceta que se separa claramente de las otras dos: es la noticia del bloque. */
  divergentFacet?: FacetView;
}

export interface ReportModel {
  meta: {
    /** "baremo" solo si todas las bandas se calcularon con normas. */
    method: "baremo" | "escala" | "mixto";
    /** Aviso obligatorio en la sección 1 cuando no hay baremo. */
    comparisonNotice: string;
    generatedFor?: string;
  };
  headline: {
    highestDomain: string;
    lowestDomain: string;
    /** Faceta más alejada de la media del resto: lo más distintivo del perfil. */
    mostDistinctiveFacet: string;
  };
  domains: DomainView[];
  fired: RuleMatch[];
  nearMisses: RuleMatch[];
  safety: {
    /** Alguna regla disparada habla de agotamiento, ánimo o similar. */
    clinical: boolean;
    /** Alguna regla disparada describe un patrón incómodo (poder, hostilidad). */
    delicate: boolean;
  };
  /** Nombre visible → nombre técnico, para la leyenda. */
  legend: { label: string; technicalLabel: string }[];
}

/** Faceta que más se aparta de la media de las otras dos de su dominio. */
function divergente(facets: FacetView[]): FacetView | undefined {
  if (facets.length < 3) return undefined;
  let mayor: { facet: FacetView; distancia: number } | undefined;
  for (const f of facets) {
    const otras = facets.filter((o) => o.id !== f.id);
    const media = otras.reduce((a, o) => a + o.score, 0) / otras.length;
    const distancia = Math.abs(f.score - media);
    if (!mayor || distancia > mayor.distancia) mayor = { facet: f, distancia };
  }
  // Menos de tres cuartos de punto no es una separación, es ruido de medida.
  return mayor && mayor.distancia >= 0.75 ? mayor.facet : undefined;
}

export function buildReport(
  scores: Scores,
  banded: { facets: Record<string, BandResult>; domains: Record<string, BandResult> },
  interpretation: Interpretation,
  domainsConfig: readonly DomainConfig[],
  labels: Labels,
  generatedFor?: string,
): ReportModel {
  const vistaFaceta = (id: string): FacetView => {
    const tecnico = labels.renombradas[id];
    return {
      id,
      label: labels.facets[id] ?? id,
      ...(tecnico ? { technicalLabel: tecnico } : {}),
      score: scores.facets[id],
      band: banded.facets[id].band,
    };
  };

  const domains: DomainView[] = domainsConfig.map((d) => {
    const facets = d.facets.map(vistaFaceta);
    const tecnico = labels.renombradas[d.id];
    const banda = banded.domains[d.id];
    return {
      id: d.id,
      label: labels.domains[d.id] ?? d.id,
      ...(tecnico ? { technicalLabel: tecnico } : {}),
      score: scores.domains[d.id],
      band: banda.band,
      ...(banda.percentile !== undefined ? { percentile: banda.percentile } : {}),
      facets,
      ...(divergente(facets) ? { divergentFacet: divergente(facets) } : {}),
    };
  });

  const metodos = new Set([
    ...Object.values(banded.domains).map((b) => b.method),
    ...Object.values(banded.facets).map((b) => b.method),
  ]);
  const method: ReportModel["meta"]["method"] =
    metodos.size === 1 ? ([...metodos][0] as "baremo" | "escala") : "mixto";

  const porPuntuacion = [...domains].sort((a, b) => b.score - a.score);

  // Lo más distintivo: la faceta más lejos del centro de la escala.
  const todasLasFacetas = domains.flatMap((d) => d.facets);
  const distintiva = todasLasFacetas.reduce((a, b) =>
    Math.abs(b.score - 3) > Math.abs(a.score - 3) ? b : a,
  );

  const disparadas = interpretation.fired.map((m) => m.rule);
  const legend = [...domains, ...todasLasFacetas]
    .filter((x): x is typeof x & { technicalLabel: string } => x.technicalLabel !== undefined)
    .map((x) => ({ label: x.label, technicalLabel: x.technicalLabel }));

  return {
    meta: {
      method,
      // El motor decide el método; el idioma pone las palabras. El aviso viene
      // de labels (src/i18n/*-informe.json), como el resto de la prosa.
      comparisonNotice: method === "baremo" ? labels.avisoComparacion.baremo : labels.avisoComparacion.escala,
      ...(generatedFor ? { generatedFor } : {}),
    },
    headline: {
      highestDomain: porPuntuacion[0].id,
      lowestDomain: porPuntuacion[porPuntuacion.length - 1].id,
      mostDistinctiveFacet: distintiva.id,
    },
    domains,
    fired: interpretation.fired,
    nearMisses: interpretation.nearMisses,
    safety: {
      clinical: disparadas.some((r: Rule) => r.safety === "clinico"),
      delicate: disparadas.some((r: Rule) => r.safety === "delicado"),
    },
    legend,
  };
}
